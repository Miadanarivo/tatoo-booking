import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArtistsController } from './artists.controller';
import { ArtistsService } from './artists.service';
import { Artist } from './entities/artist.entity';
import { User } from '../users/entities/user.entity';
import { Salon } from '../salons/entities/salon.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Artist, User, Salon])],
  controllers: [ArtistsController],
  providers: [ArtistsService],
  exports: [ArtistsService],
})
export class ArtistsModule {}