import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Salon } from './entities/salon.entity';
import { UpdateSalonDto } from './dto/update-salon.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class SalonsService {
  constructor(
    @InjectRepository(Salon)
    private readonly salonRepo: Repository<Salon>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async findAll(): Promise<Salon[]> {
    return this.salonRepo.find({ relations: { artists: true } });
  }

  async findOne(id: string): Promise<Salon> {
    const salon = await this.salonRepo.findOne({
      where: { id },
      relations: { artists: true },
    });
    if (!salon) throw new NotFoundException('Salon introuvable');
    return salon;
  }

  async create(data: Partial<Salon>): Promise<Salon> {
    const salon = this.salonRepo.create(data);
    return this.salonRepo.save(salon);
  }

  async update(id: string, dto: UpdateSalonDto): Promise<Salon> {
    const salon = await this.findOne(id);
    Object.assign(salon, dto);
    return this.salonRepo.save(salon);
  }

  async updateLogo(id: string, file: Express.Multer.File): Promise<Salon> {
    const salon = await this.findOne(id);
    const uploadResult = await this.cloudinaryService.uploadImage(file, 'salons');
    salon.logoUrl = uploadResult.secure_url;
    return this.salonRepo.save(salon);
  }
}