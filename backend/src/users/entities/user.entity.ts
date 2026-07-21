import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { Artist } from '../../artists/entities/artist.entity';
import { Booking } from '../../bookings/entities/booking.entity';

export enum UserRole {
  CLIENT = 'client',
  ARTIST = 'artist',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  phone: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CLIENT,
  })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  // --- Champs pour le flux d'inscription en 3 étapes ---
  @Column({ type: 'varchar', nullable: true })
  verificationCode: string | null;

  @Column({ type: 'timestamp', nullable: true })
  verificationCodeExpiresAt: Date | null;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ default: false })
  hasPassword: boolean;
  // -------------------------------------------------------

  // --- Champs pour le flux "mot de passe oublié" ---
  @Column({ type: 'varchar', nullable: true })
  resetPasswordCode: string | null;

  @Column({ type: 'timestamp', nullable: true })
  resetPasswordCodeExpiresAt: Date | null;
  // ---------------------------------------------------

  @OneToOne(() => Artist, (artist) => artist.user, { nullable: true })
  artistProfile: Artist;

  @OneToMany(() => Booking, (booking) => booking.client)
  bookings: Booking[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
