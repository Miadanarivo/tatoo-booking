import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PortfolioService } from './portfolio.service';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';

// ⚠️ Le JwtAuthGuard sera réactivé une fois le module Auth créé
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { UseGuards } from '@nestjs/common';

@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  // @UseGuards(JwtAuthGuard) // à réactiver plus tard
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

  // @UseGuards(JwtAuthGuard) // à réactiver plus tard
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.portfolioService.remove(id);
  }
}