import { Controller, Get, Param } from '@nestjs/common';
import { KnowledgeMapService } from './knowledge-map.service';

@Controller('knowledge-maps')
export class KnowledgeMapController {
  constructor(private readonly knowledgeMapService: KnowledgeMapService) {}

  @Get(':subjectCode')
  getMap(@Param('subjectCode') subjectCode: string) {
    return this.knowledgeMapService.getMap(subjectCode);
  }

  @Get(':subjectCode/skills/:skillCode')
  getSkill(
    @Param('subjectCode') subjectCode: string,
    @Param('skillCode') skillCode: string,
  ) {
    return this.knowledgeMapService.getSkill(subjectCode, skillCode);
  }
}
