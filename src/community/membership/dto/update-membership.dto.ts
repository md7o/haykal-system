import { Type } from 'class-transformer';
import { IsOptional, IsString, IsEnum, IsDate } from 'class-validator';
import { MembershipType } from 'src/common/enums/community-enums/membership-type';

export class UpdateMembershipDto {
  @IsOptional()
  @IsEnum(MembershipType)
  role?: MembershipType;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  subscriptionExpiration?: Date;

  @IsOptional()
  @IsString()
  status?: string;
}
