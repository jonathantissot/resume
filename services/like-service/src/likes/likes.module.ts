import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { LikesController } from './likes.controller';
import { LikesService } from './likes.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { Like } from './entities/like.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Like]), PassportModule],
  controllers: [LikesController],
  providers: [LikesService, JwtStrategy],
})
export class LikesModule {}
