import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsIn,
} from 'class-validator';

export class CreateScanDto {
  @IsString()
  @IsNotEmpty()
  workspaceId!: string;

  @IsOptional()
  @IsIn(['WEBSITE', 'GITHUB', 'COMBINED'])
  type?: 'WEBSITE' | 'GITHUB' | 'COMBINED';

  @IsString()
  @IsNotEmpty()
  target!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  engines?: string[];
}
