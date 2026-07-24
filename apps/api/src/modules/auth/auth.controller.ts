import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getCurrentUser(@CurrentUserId() userId: string) {
    return this.authService.getCurrentUser(userId);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  updateCurrentUser(
    @CurrentUserId() userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.authService.updateCurrentUser(userId, dto);
  }

  @Patch('me/role')
  @UseGuards(JwtAuthGuard)
  updateCurrentRole(
    @CurrentUserId() userId: string,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.authService.updateCurrentRole(userId, dto);
  }

  @Patch('password')
  @UseGuards(JwtAuthGuard)
  updatePassword(
    @CurrentUserId() userId: string,
    @Body() dto: UpdatePasswordDto,
  ) {
    return this.authService.updatePassword(userId, dto);
  }
}
