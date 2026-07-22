import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateCommentDto {
  @IsUUID()
  post_id: string;

  @IsOptional()
  @IsUUID()
  parent_id?: string;

  @IsString()
  content: string;
}
