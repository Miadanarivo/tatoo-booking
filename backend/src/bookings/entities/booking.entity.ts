import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Artist } from '../../artists/entities/artist.entity';
import { Review } from '../../reviews/entities/review.entity';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export enum BodyZone {
  BRAS = 'bras',
  JAMBE = 'jambe',
  DOS = 'dos',
  TORSE = 'torse',
  MAIN = 'main',
  COU = 'cou',
  AUTRE = 'autre',
}

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.bookings, { onDelete: 'CASCADE' })
  client: User;

  @ManyToOne(() => Artist, (artist) => artist.bookings, { onDelete: 'CASCADE' })
  artist: Artist;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'int', default: 60 })
  durationMinutes: number;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: BodyZone,
    default: BodyZone.AUTRE,
  })
  bodyZone: BodyZone;

  @Column({ nullable: true })
  referenceImageUrl: string;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @Column({ type: 'text', nullable: true })
  artistNote: string; // note de l'artiste si refus/reprogrammation

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimatedPrice: number;

  @OneToOne(() => Review, (review) => review.booking, { nullable: true })
  review: Review;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}