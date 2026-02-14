import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiStudioService } from './ai-studio.service';
import { AiStudioController } from './ai-studio.controller';
import { Idea } from './entities/idea.entity';

import { OpenRouterProvider } from '../common/providers/openrouter.provider';

@Module({
  imports: [TypeOrmModule.forFeature([Idea])],
  controllers: [AiStudioController],
  providers: [AiStudioService, OpenRouterProvider],
  exports: [AiStudioService],
})
export class AiStudioModule {}
