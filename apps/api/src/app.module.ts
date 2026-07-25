import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { DiagnosticsModule } from './modules/diagnostics/diagnostics.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { HomeworkModule } from './modules/homework/homework.module';
import { KnowledgeMapModule } from './modules/knowledge-map/knowledge-map.module';
import { LearningRouteModule } from './modules/learning-route/learning-route.module';
import { SubjectsModule } from './modules/subjects/subjects.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { TopicsModule } from './modules/topics/topics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    DiagnosticsModule,
    FavoritesModule,
    HomeworkModule,
    KnowledgeMapModule,
    LearningRouteModule,
    SubjectsModule,
    TasksModule,
    TopicsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
