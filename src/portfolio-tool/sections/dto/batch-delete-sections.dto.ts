import { IsArray, IsUUID } from 'class-validator';

export class BatchDeleteSectionsDto {
  @IsArray()
  @IsUUID('4', { each: true })
  sectionIds: string[];
}
