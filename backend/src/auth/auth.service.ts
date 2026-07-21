import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { ArtistsService } from '../artists/artists.service';
import { InitRegisterDto, PublicRole } from './dto/init-register.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { ResendCodeDto } from './dto/resend-code.dto';
import { SetPasswordDto } from './dto/set-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyResetCodeDto } from './dto/verify-reset-code.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '../users/entities/user.entity';

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 chiffres
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly artistsService: ArtistsService,
  ) {}

  // Étape 1 : infos personnelles → envoi du code par email
  async initRegister(dto: InitRegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);

    if (existing && existing.isEmailVerified) {
      throw new ConflictException('Un compte existe déjà avec cet email');
    }

    const role =
      dto.role === PublicRole.ARTIST ? UserRole.ARTIST : UserRole.CLIENT;

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    const placeholderHash = await bcrypt.hash(crypto.randomUUID(), 10);

    if (existing) {
      // Compte déjà initié mais pas encore vérifié → on met à jour et on renvoie un code
      existing.firstName = dto.firstName;
      existing.lastName = dto.lastName;
      existing.role = role;
      if (dto.phone) {
        existing.phone = dto.phone;
      }
      existing.verificationCode = code;
      existing.verificationCodeExpiresAt = expiresAt;
      await this.usersService.save(existing);
    } else {
      await this.usersService.create({
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        password: placeholderHash,
        role,
        isEmailVerified: false,
        hasPassword: false,
        verificationCode: code,
        verificationCodeExpiresAt: expiresAt,
      });
    }

    await this.mailService.sendVerificationCode(dto.email, dto.firstName, code);

    return { message: 'Code envoyé par email', email: dto.email };
  }

  // Étape 2 : vérification du code à 6 chiffres
  async verifyCode(dto: VerifyCodeDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user)
      throw new NotFoundException('Aucune inscription trouvée pour cet email');
    if (user.isEmailVerified) {
      throw new BadRequestException('Ce compte est déjà vérifié');
    }
    if (!user.verificationCode || user.verificationCode !== dto.code) {
      throw new BadRequestException('Code invalide');
    }
    if (
      !user.verificationCodeExpiresAt ||
      user.verificationCodeExpiresAt < new Date()
    ) {
      throw new BadRequestException('Ce code a expiré, demandez-en un nouveau');
    }

    user.isEmailVerified = true;
    user.verificationCode = null;
    await this.usersService.save(user);

    return { message: 'Email vérifié', email: dto.email };
  }

  // Renvoyer un nouveau code
  async resendCode(dto: ResendCodeDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user)
      throw new NotFoundException('Aucune inscription trouvée pour cet email');
    if (user.isEmailVerified) {
      throw new BadRequestException('Ce compte est déjà vérifié');
    }

    const code = generateCode();
    user.verificationCode = code;
    user.verificationCodeExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await this.usersService.save(user);

    await this.mailService.sendVerificationCode(
      dto.email,
      user.firstName,
      code,
    );

    return { message: 'Nouveau code envoyé' };
  }

  // Étape 3 : définir le mot de passe final → compte activé
  async setPassword(dto: SetPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    if (!user.isEmailVerified) {
      throw new BadRequestException("Vérifiez d'abord votre email");
    }
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Les mots de passe ne correspondent pas');
    }

    user.password = await bcrypt.hash(dto.password, 10);
    user.hasPassword = true;
    await this.usersService.save(user);

    if (user.role === UserRole.ARTIST) {
      await this.artistsService.createForUserIfNotExists(user.id);
    }

    return { message: 'Compte créé avec succès' };
  }

  // --- Mot de passe oublié : étape 1, envoi du code ---
  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new NotFoundException('Aucun compte trouvé pour cet email');
    }

    const code = generateCode();
    user.resetPasswordCode = code;
    user.resetPasswordCodeExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await this.usersService.save(user);

    await this.mailService.sendPasswordResetCode(
      dto.email,
      user.firstName,
      code,
    );

    return {
      message: 'Code de vérification envoyé par email',
      email: dto.email,
    };
  }

  // --- Mot de passe oublié : étape 2, vérification du code ---
  async verifyResetCode(dto: VerifyResetCodeDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new NotFoundException('Aucun compte trouvé pour cet email');
    }
    if (!user.resetPasswordCode || user.resetPasswordCode !== dto.code) {
      throw new BadRequestException('Code invalide');
    }
    if (
      !user.resetPasswordCodeExpiresAt ||
      user.resetPasswordCodeExpiresAt < new Date()
    ) {
      throw new BadRequestException('Ce code a expiré, demandez-en un nouveau');
    }

    return { message: 'Code vérifié', email: dto.email };
  }

  // --- Mot de passe oublié : étape 3, nouveau mot de passe ---
  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new NotFoundException('Aucun compte trouvé pour cet email');
    }
    if (!user.resetPasswordCode || user.resetPasswordCode !== dto.code) {
      throw new BadRequestException('Code invalide');
    }
    if (
      !user.resetPasswordCodeExpiresAt ||
      user.resetPasswordCodeExpiresAt < new Date()
    ) {
      throw new BadRequestException('Ce code a expiré, demandez-en un nouveau');
    }
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Les mots de passe ne correspondent pas');
    }

    user.password = await bcrypt.hash(dto.password, 10);
    user.resetPasswordCode = null;
    user.resetPasswordCodeExpiresAt = null;
    await this.usersService.save(user);

    return { message: 'Mot de passe mis à jour avec succès' };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Identifiants invalides');
    }
    if (!user.isEmailVerified || !user.hasPassword) {
      throw new UnauthorizedException(
        'Inscription incomplète, terminez la création de votre compte',
      );
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const access_token = this.jwtService.sign(payload);

    const { password, verificationCode, ...safeUser } = user;
    return { access_token, user: safeUser };
  }
}
