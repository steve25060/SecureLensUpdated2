import {
  IsString,
  IsOptional,
  IsArray,
  IsIn,
  MaxLength,
} from 'class-validator';

export class UpdateWorkspaceDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsIn(['WEBSITE', 'GITHUB', 'COMBINED'])
  type?: 'WEBSITE' | 'GITHUB' | 'COMBINED';

  @IsOptional()
  @IsString()
  targetUrl?: string;

  @IsOptional()
  @IsString()
  repoUrl?: string;
}
