import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Salon } from '../../salons/entities/salon.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { Portfolio } from '../../portfolio/entities/portfolio.entity';
import { Review } from '../../reviews/entities/review.entity';

export enum TattooStyle {
  OLD_SCHOOL = 'old_school',
  REALISME = 'realisme',
  JAPONAIS = 'japonais',
  TRIBAL = 'tribal',
  MINIMALISTE = 'minimaliste',
  BLACKWORK = 'blackwork',
  AQUARELLE = 'aquarelle',
  AUTRE = 'autre',
}

@Entity('artists')
export class Artist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, (user) => user.artistProfile)
  @JoinColumn()
  user: User;

  @ManyToOne(() => Salon, (salon) => salon.artists, { onDelete: 'SET NULL', nullable: true })
  salon: Salon;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({
    type: 'enum',
    enum: TattooStyle,
    array: true,
    default: [],
  })
  styles: TattooStyle[];

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  hourlyRate: number;

  @Column({ default: true })
  isAvailable: boolean;

  @Column({ type: 'jsonb', nullable: true })
  workingHours: Record<string, { start: string; end: string }>;
  // ex: { "monday": { "start": "09:00", "end": "18:00" } }

  @OneToMany(() => Booking, (booking) => booking.artist)
  bookings: Booking[];

  @OneToMany(() => Portfolio, (portfolio) => portfolio.artist)
  portfolio: Portfolio[];

  @OneToMany(() => Review, (review) => review.artist)
  reviews: Review[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}