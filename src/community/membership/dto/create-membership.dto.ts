import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { MembershipType } from 'src/common/enums/community-enums/membership-type';

export class CreateMembershipDto {
  @IsUUID()
  communityId: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  subscriptionExpiration?: Date;

  @IsOptional()
  @IsEnum(MembershipType)
  role?: MembershipType;
}
