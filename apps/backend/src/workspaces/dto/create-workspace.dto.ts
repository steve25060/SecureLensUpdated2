import { IsString, IsNotEmpty, IsOptional, IsEnum, IsArray } from 'class-validator';

export enum WorkspaceType {
  WEBSITE = 'WEBSITE',
  GITHUB = 'GITHUB',
  COMBINED = 'COMBINED',
}

export class CreateWorkspaceDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsEnum(WorkspaceType)
  type?: WorkspaceType;

  @IsOptional()
  @IsString()
  targetUrl?: string;

  @IsOptional()
  @IsString()
  repoUrl?: string;
}
