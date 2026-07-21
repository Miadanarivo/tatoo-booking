import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Request() req) {
    const user = await this.usersService.findById(req.user.userId);
    const { password, ...safeUser } = user;
    return safeUser;
  }

  // Réservé à l'admin : liste des utilisateurs (ex: ?role=client)
  // utilisé par le dashboard admin pour compter les nouveaux clients
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  async findAll(@Query('role') role?: string) {
    const users = await this.usersService.findAll(role);
    return users.map(({ password, ...safeUser }) => safeUser);
  }
}