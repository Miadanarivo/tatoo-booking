import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PortfolioService } from './portfolio.service';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':artistId')
  @UseInterceptors(FileInterceptor('file'))
  async addImage(
    @Param('artistId') artistId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreatePortfolioDto,
  ) {
    return this.portfolioService.addImage(artistId, file, dto.caption);
  }

  @Get('artist/:artistId')
  async findByArtist(@Param('artistId') artistId: string) {
    return this.portfolioService.findByArtist(artistId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.portfolioService.remove(id);
  }
}