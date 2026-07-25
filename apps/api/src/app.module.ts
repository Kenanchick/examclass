import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { HomeworkModule } from './modules/homework/homework.module';
import { KnowledgeMapModule } from './modules/knowledge-map/knowledge-map.module';
import { SubjectsModule } from './modules/subjects/subjects.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { TopicsModule } from './modules/topics/topics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    FavoritesModule,
    HomeworkModule,
    KnowledgeMapModule,
    SubjectsModule,
    TasksModule,
    TopicsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
