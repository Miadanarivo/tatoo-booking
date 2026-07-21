import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { BookingStatus } from './entities/booking.entity';

@UseGuards(JwtAuthGuard)
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  async create(@Request() req, @Body() dto: CreateBookingDto) {
    return this.bookingsService.create(req.user.userId, dto);
  }

  @Get('me')
  async findMyBookings(@Request() req) {
    return this.bookingsService.findMyBookings(req.user.userId);
  }

  // Réservé à l'artiste connecté (dashboard artiste)
  @UseGuards(RolesGuard)
  @Roles('artist')
  @Get('artist/me')
  async findMyArtistBookings(@Request() req) {
    return this.bookingsService.findArtistBookings(req.user.userId);
  }

  // Réservé à l'admin : vue globale de toutes les réservations
  // (utilisé par le dashboard admin pour les stats et l'agenda du jour)
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get()
  async findAll() {
    return this.bookingsService.findAll();
  }

  @Patch(':id/cancel')
  async cancel(@Request() req, @Param('id') id: string) {
    return this.bookingsService.cancel(id, req.user.userId);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: BookingStatus,
    @Body('artistNote') artistNote?: string,
  ) {
    return this.bookingsService.updateStatus(id, status, artistNote);
  }

  @Patch(':id/reschedule')
  async reschedule(
    @Param('id') id: string,
    @Body('date') date: string,
    @Body('startTime') startTime: string,
  ) {
    return this.bookingsService.reschedule(id, date, startTime);
  }

  @Post(':id/reference-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadReferenceImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.bookingsService.setReferenceImage(id, file);
  }
}