import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { Prisma, Role, type User } from '../../generated/prisma/client';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

const emailAlreadyExistsMessage = 'Пользователь с таким email уже существует';
const invalidCredentialsMessage = 'Неверный email или пароль';
const unauthorizedMessage = 'Требуется авторизация';
const currentPasswordInvalidMessage = 'Текущий пароль указан неверно';
const passwordMustBeDifferentMessage =
  'Новый пароль должен отличаться от текущего';

const passwordHashOptions: argon2.HashOptions = {
  type: argon2.argon2id as 2,
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(dto.email);

    if (existingUser) {
      throw new ConflictException(emailAlreadyExistsMessage);
    }

    const passwordHash = (await argon2.hash(
      dto.password,
      passwordHashOptions,
    )) as string;

    try {
      const user = await this.usersService.create({
        email: dto.email,
        passwordHash,
        name: dto.name,
        role: Role.STUDENT,
      });

      return this.createAuthResponse(user);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(emailAlreadyExistsMessage);
      }

      throw error;
    }
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user?.passwordHash) {
      throw new UnauthorizedException(invalidCredentialsMessage);
    }

    const isPasswordValid = await argon2.verify(
      user.passwordHash,
      dto.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException(invalidCredentialsMessage);
    }

    return this.createAuthResponse(user);
  }

  async getCurrentUser(userId: string) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException(unauthorizedMessage);
    }

    return this.toPublicUser(user);
  }

  async updateCurrentUser(userId: string, dto: UpdateProfileDto) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException(unauthorizedMessage);
    }

    if (dto.email !== user.email) {
      const existingUser = await this.usersService.findByEmail(dto.email);

      if (existingUser) {
        throw new ConflictException(emailAlreadyExistsMessage);
      }
    }

    try {
      const updatedUser = await this.usersService.update(userId, {
        name: dto.name,
        email: dto.email,
      });

      return this.toPublicUser(updatedUser);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(emailAlreadyExistsMessage);
      }

      throw error;
    }
  }

  async updatePassword(userId: string, dto: UpdatePasswordDto) {
    const user = await this.usersService.findById(userId);

    if (!user?.passwordHash) {
      throw new UnauthorizedException(unauthorizedMessage);
    }

    const isCurrentPasswordValid = await argon2.verify(
      user.passwordHash,
      dto.currentPassword,
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException(currentPasswordInvalidMessage);
    }

    const isSamePassword = await argon2.verify(
      user.passwordHash,
      dto.newPassword,
    );

    if (isSamePassword) {
      throw new BadRequestException(passwordMustBeDifferentMessage);
    }

    const passwordHash = (await argon2.hash(
      dto.newPassword,
      passwordHashOptions,
    )) as string;

    await this.usersService.update(userId, { passwordHash });

    return { message: 'Пароль успешно изменён' };
  }

  private async createAuthResponse(user: User) {
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      role: user.role,
    });

    return {
      accessToken,
      user: this.toPublicUser(user),
    };
  }

  private toPublicUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
