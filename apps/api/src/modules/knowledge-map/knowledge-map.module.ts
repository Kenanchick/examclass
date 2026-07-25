import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { KnowledgeMapController } from './knowledge-map.controller';
import { KnowledgeMapService } from './knowledge-map.service';

@Module({
  imports: [PrismaModule],
  controllers: [KnowledgeMapController],
  providers: [KnowledgeMapService],
  exports: [KnowledgeMapService],
})
export class KnowledgeMapModule {}
