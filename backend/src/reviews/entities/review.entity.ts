import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Booking } from '../../bookings/entities/booking.entity';
import { Artist } from '../../artists/entities/artist.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Booking, (booking) => booking.review, { onDelete: 'CASCADE' })
  @JoinColumn()
  booking: Booking;

  @ManyToOne(() => Artist, (artist) => artist.reviews, { onDelete: 'CASCADE' })
  artist: Artist;

  @Column({ type: 'int' })
  rating: number; // 1 à 5

  @Column({ type: 'text', nullable: true })
  comment: string;

  @CreateDateColumn()
  createdAt: Date;
}