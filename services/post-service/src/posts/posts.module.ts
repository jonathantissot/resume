import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { Post } from './entities/post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post]), PassportModule],
  controllers: [PostsController],
  providers: [PostsService, JwtStrategy],
})
export class PostsModule {}
