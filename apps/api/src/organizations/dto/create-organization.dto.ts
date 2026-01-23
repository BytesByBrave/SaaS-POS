import { IsString, IsEnum, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum OrgType {
  RETAIL = 'retail',
  RESTAURANT = 'restaurant',
  SERVICE = 'service',
}

export class CreateOrganizationDto {
  @ApiProperty({ example: 'My Coffee Shop' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'my-coffee-shop' })
  @IsString()
  slug: string;

  @ApiProperty({ enum: OrgType, default: OrgType.RETAIL })
  @IsEnum(OrgType)
  @IsOptional()
  type?: OrgType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  settings?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  features?: any;
}
