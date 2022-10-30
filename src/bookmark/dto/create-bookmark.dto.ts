import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateBookmarkDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsUrl()
  link: string;
}
