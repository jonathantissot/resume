import { IsUUID, IsOptional, IsString } from 'class-validator';

export class ToggleLikeDto {
  @IsUUID()
  post_id: string;

  @IsOptional()
  @IsString()
  reaction?: string;
}
