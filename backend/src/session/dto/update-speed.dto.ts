import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class UpdateSpeedDto {
  @ApiProperty({
    description: 'New draw interval in ms (10–1000, multiples of 10)',
    example: 500,
  })
  @Type(() => Number)
  @IsInt()
  @Min(10)
  @Max(1000)
  speedMs: number;
}
