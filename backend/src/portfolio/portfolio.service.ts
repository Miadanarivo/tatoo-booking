import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Portfolio } from './entities/portfolio.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class PortfolioService {
  constructor(
    @InjectRepository(Portfolio)
    private readonly portfolioRepo: Repository<Portfolio>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async addImage(
    artistId: string,
    file: Express.Multer.File,
    caption?: string,
  ): Promise<Portfolio> {
    const uploadResult = await this.cloudinaryService.uploadImage(
      file,
      'portfolio',
    );

    const portfolioItem = this.portfolioRepo.create({
      artist: { id: artistId } as any,
      imageUrl: uploadResult.secure_url,
      caption,
    });

    return this.portfolioRepo.save(portfolioItem);
  }

  async findByArtist(artistId: string): Promise<Portfolio[]> {
    return this.portfolioRepo.find({
      where: { artist: { id: artistId } },
      order: { createdAt: 'DESC' },
    });
  }

  async remove(id: string): Promise<void> {
    const item = await this.portfolioRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Image non trouvée');
    await this.portfolioRepo.remove(item);
  }
}