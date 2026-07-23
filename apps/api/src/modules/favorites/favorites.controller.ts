import { Controller, Delete, Get, Param, Put, UseGuards } from '@nestjs/common';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { FavoritesService } from './favorites.service';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  getFavorites(@CurrentUserId() userId: string) {
    return this.favoritesService.getFavorites(userId);
  }

  @Put(':publicId')
  addFavorite(
    @CurrentUserId() userId: string,
    @Param('publicId') publicId: string,
  ) {
    return this.favoritesService.addFavorite(userId, publicId);
  }

  @Delete(':publicId')
  removeFavorite(
    @CurrentUserId() userId: string,
    @Param('publicId') publicId: string,
  ) {
    return this.favoritesService.removeFavorite(userId, publicId);
  }
}
