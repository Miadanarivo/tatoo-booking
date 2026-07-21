import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking, BookingStatus } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly mailService: MailService,
  ) {}

  async create(clientId: string, dto: CreateBookingDto): Promise<Booking> {
    const booking = this.bookingRepo.create({
      client: { id: clientId } as any,
      artist: { id: dto.artistId } as any,
      date: dto.date,
      startTime: dto.startTime,
      durationMinutes: dto.durationMinutes ?? 60,
      description: dto.description,
      bodyZone: dto.bodyZone,
      status: BookingStatus.PENDING,
    });
    return this.bookingRepo.save(booking);
  }

  async findMyBookings(clientId: string): Promise<Booking[]> {
    return this.bookingRepo.find({
      where: { client: { id: clientId } },
      relations: { artist: { user: true } },
      order: { date: 'DESC' },
    });
  }

  // Vue globale admin : toutes les réservations, tous salons/artistes confondus
  async findAll(): Promise<Booking[]> {
    return this.bookingRepo.find({
      relations: { client: true, artist: { user: true, salon: true } },
      order: { date: 'DESC', startTime: 'DESC' },
    });
  }

  // Réservé à l'artiste connecté : ses propres réservations (dashboard artiste)
  async findArtistBookings(userId: string): Promise<Booking[]> {
    return this.bookingRepo.find({
      where: { artist: { user: { id: userId } } },
      relations: { client: true, artist: { user: true } },
      order: { date: 'ASC', startTime: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Booking> {
    const booking = await this.bookingRepo.findOne({
      where: { id },
      relations: { client: true, artist: { user: true } },
    });
    if (!booking) throw new NotFoundException('Réservation introuvable');
    return booking;
  }

  async cancel(id: string, clientId: string): Promise<Booking> {
    const booking = await this.findOne(id);
    if (booking.client.id !== clientId) {
      throw new ForbiddenException(
        'Vous ne pouvez pas annuler cette réservation',
      );
    }
    if (!['pending', 'confirmed'].includes(booking.status)) {
      throw new BadRequestException(
        'Cette réservation ne peut plus être annulée',
      );
    }
    booking.status = BookingStatus.CANCELLED;
    return this.bookingRepo.save(booking);
  }

  async updateStatus(
    id: string,
    status: BookingStatus,
    artistNote?: string,
  ): Promise<Booking> {
    const booking = await this.findOne(id);
    booking.status = status;
    if (artistNote) booking.artistNote = artistNote;
    const saved = await this.bookingRepo.save(booking);

    // Notification email best-effort
    try {
      const clientEmail = booking.client.email;
      const clientFirstName = booking.client.firstName;
      const artistName = `${booking.artist.user.firstName} ${booking.artist.user.lastName}`;

      if (status === BookingStatus.CONFIRMED) {
        await this.mailService.sendBookingConfirmation(
          clientEmail,
          clientFirstName,
          artistName,
          booking.date,
          booking.startTime,
        );
      } else if (status === BookingStatus.REJECTED) {
        await this.mailService.sendBookingRejected(
          clientEmail,
          clientFirstName,
          artistName,
          artistNote,
        );
      }
    } catch (e) {
      console.error('Échec envoi email de notification', e);
    }

    return saved;
  }

  // L'artiste propose un nouveau créneau pour une demande existante
  async reschedule(id: string, date: string, startTime: string): Promise<Booking> {
    const booking = await this.findOne(id);
    booking.date = date;
    booking.startTime = startTime;
    return this.bookingRepo.save(booking);
  }

  async setReferenceImage(
    id: string,
    file: Express.Multer.File,
  ): Promise<Booking> {
    const booking = await this.findOne(id);
    const uploadResult = await this.cloudinaryService.uploadImage(
      file,
      'bookings',
    );
    booking.referenceImageUrl = uploadResult.secure_url;
    return this.bookingRepo.save(booking);
  }
}