import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { LearningRouteService } from './learning-route.service';

@Controller('learning-routes')
@UseGuards(JwtAuthGuard)
export class LearningRouteController {
  constructor(private readonly routes: LearningRouteService) {}

  @Get('current')
  getCurrent(@CurrentUserId() userId: string) {
    return this.routes.getOwnCurrent(userId);
  }

  @Post('rebuild')
  rebuild(@CurrentUserId() userId: string) {
    return this.routes.rebuildOwn(userId);
  }
}
