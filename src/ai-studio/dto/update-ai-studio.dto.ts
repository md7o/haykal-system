import { PartialType } from '@nestjs/mapped-types';
import { CreateAiStudioDto } from './create-ai-studio.dto';

export class UpdateAiStudioDto extends PartialType(CreateAiStudioDto) {}
