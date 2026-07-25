import { Module } from '@nestjs/common';
import { SolutionFileStorageService } from './solution-file-storage.service';

@Module({
  providers: [SolutionFileStorageService],
  exports: [SolutionFileStorageService],
})
export class SolutionFileStorageModule {}
