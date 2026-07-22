import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { Comment } from './entities/comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comment]), PassportModule],
  controllers: [CommentsController],
  providers: [CommentsService, JwtStrategy],
})
export class CommentsModule {}
