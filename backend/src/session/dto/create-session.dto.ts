import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateSessionDto {
  @ApiProperty({ description: 'Use randomly generated numbers each draw' })
  @IsBoolean()
  @Type(() => Boolean)
  useRandomNumbers: boolean;

  @ApiPropertyOptional({
    description:
      '5 unique numbers between 1 and 90 (required when useRandomNumbers is false)',
    example: [4, 17, 32, 55, 78],
  })
  @ValidateIf((dto: CreateSessionDto) => !dto.useRandomNumbers)
  @IsArray()
  @ArrayMinSize(5)
  @ArrayMaxSize(5)
  @ArrayUnique()
  @Type(() => Number)
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(90, { each: true })
  playerNumbers?: number[];

  @ApiPropertyOptional({
    description: 'Draw interval in ms (10–1000, multiples of 10)',
    default: 1000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(10)
  @Max(1000)
  speedMs?: number;
}
