import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { MembershipType } from 'src/common/enums/membership-type';

export class CreateMembershipDto {
  @IsUUID()
  communityId: string;

  @IsOptional()
  @IsEnum(MembershipType)
  role?: MembershipType;
}
