import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Artist } from '../../artists/entities/artist.entity';

@Entity('portfolio')
export class Portfolio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Artist, (artist) => artist.portfolio, { onDelete: 'CASCADE' })
  artist: Artist;

  @Column()
  imageUrl: string;

  @Column({ nullable: true })
  caption: string;

  @CreateDateColumn()
  createdAt: Date;
}