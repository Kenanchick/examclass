import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { Prisma, Role, type User } from '../../generated/prisma/client';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';

const emailAlreadyExistsMessage = 'Пользователь с таким email уже существует';

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
        firstName: dto.firstName,
        lastName: dto.lastName,
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

  private async createAuthResponse(user: User) {
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      role: user.role,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }
}
