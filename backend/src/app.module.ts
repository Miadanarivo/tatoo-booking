import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';

// Entités
import { User } from './users/entities/user.entity';
import { Salon } from './salons/entities/salon.entity';
import { Artist } from './artists/entities/artist.entity';
import { Booking } from './bookings/entities/booking.entity';
import { Review } from './reviews/entities/review.entity';
import { Portfolio } from './portfolio/entities/portfolio.entity';

// Modules métier
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ArtistsModule } from './artists/artists.module';
import { SalonsModule } from './salons/salons.module';
import { BookingsModule } from './bookings/bookings.module';
import { ReviewsModule } from './reviews/reviews.module';
import { PortfolioModule } from './portfolio/portfolio.module';

// Modules techniques
import { MailModule } from './mail/mail.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';

@Module({
  imports: [
    // Charge le .env et le rend accessible globalement (ConfigService)
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Connexion PostgreSQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
       port: parseInt(config.get<string>('DB_PORT', '5432'), 10),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        entities: [User, Salon, Artist, Booking, Review, Portfolio],
        synchronize: true, // ⚠️ à mettre "false" en production, utiliser des migrations
      }),
    }),

    // Modules métier
    AuthModule,
    UsersModule,
    ArtistsModule,
    SalonsModule,
    BookingsModule,
    ReviewsModule,
    PortfolioModule,

    // Modules techniques (email + upload d'images)
    MailModule,
    CloudinaryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}