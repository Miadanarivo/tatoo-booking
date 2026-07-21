import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async onModuleInit() {
    const adminEmail = 'admin@gmail.com';
    const existing = await this.userRepo.findOne({
      where: { email: adminEmail },
    });

    if (existing) {
      this.logger.log(`Compte admin déjà présent (${adminEmail})`);
      return;
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = this.userRepo.create({
      firstName: 'Admin',
      lastName: 'Ink & Gold',
      email: adminEmail,
      password: hashedPassword,
      role: UserRole.ADMIN,
      isEmailVerified: true,
      hasPassword: true,
    });
    await this.userRepo.save(admin);
    this.logger.log(`✅ Compte admin créé : ${adminEmail} / admin123`);
  }
}