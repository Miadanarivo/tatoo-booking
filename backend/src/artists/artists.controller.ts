import { Body, Controller, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { ArtistsService } from './artists.service';
import { CreateArtistDto } from './dto/create-artist.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('artists')
export class ArtistsController {
  constructor(private readonly artistsService: ArtistsService) {}

  @Get()
  async findAll() {
    return this.artistsService.findAll();
  }

  // Doit être déclaré AVANT ":id" pour que "me" ne soit pas interprété comme un id
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async findMe(@Request() req) {
    return this.artistsService.findByUserId(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/availability')
  async updateAvailability(@Request() req, @Body('isAvailable') isAvailable: boolean) {
    return this.artistsService.setAvailability(req.user.userId, isAvailable);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.artistsService.findOne(id);
  }

  // Réservé à l'admin : transforme un utilisateur en artiste
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  async create(@Body() dto: CreateArtistDto) {
    return this.artistsService.create(dto);
  }
}