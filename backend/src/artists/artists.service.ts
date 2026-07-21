import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Artist } from './entities/artist.entity';
import { CreateArtistDto } from './dto/create-artist.dto';

@Injectable()
export class ArtistsService {
  constructor(
    @InjectRepository(Artist)
    private readonly artistRepo: Repository<Artist>,
  ) {}

  async findAll(): Promise<Artist[]> {
    return this.artistRepo.find({
      relations: { user: true, salon: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Artist> {
    const artist = await this.artistRepo.findOne({
      where: { id },
      relations: { user: true, salon: true },
    });
    if (!artist) throw new NotFoundException('Artiste introuvable');
    return artist;
  }

  async findByUserId(userId: string): Promise<Artist> {
    const artist = await this.artistRepo.findOne({
      where: { user: { id: userId } },
      relations: { user: true, salon: true },
    });
    if (!artist) throw new NotFoundException('Profil artiste introuvable');
    return artist;
  }

  async setAvailability(userId: string, isAvailable: boolean): Promise<Artist> {
    const artist = await this.findByUserId(userId);
    artist.isAvailable = isAvailable;
    return this.artistRepo.save(artist);
  }

  async create(dto: CreateArtistDto): Promise<Artist> {
    const artist = this.artistRepo.create({
      user: { id: dto.userId } as any,
      salon: dto.salonId ? ({ id: dto.salonId } as any) : undefined,
      bio: dto.bio,
      styles: dto.styles,
      hourlyRate: dto.hourlyRate,
    });
    return this.artistRepo.save(artist);
  }

  async createForUserIfNotExists(userId: string): Promise<Artist> {
    const existing = await this.artistRepo.findOne({
      where: { user: { id: userId } },
    });
    if (existing) return existing;

    const artist = this.artistRepo.create({
      user: { id: userId } as any,
      styles: [],
      isAvailable: true,
    });
    return this.artistRepo.save(artist);
  }
}