import {
  Controller, Post, Get, Body, Param, UseGuards, Request,
} from '@nestjs/common';
import { LikesService } from './likes.service';
import { ToggleLikeDto } from './dto/toggle-like.dto';
import { JwtAuthGuard } from './guards/jwt.guard';

@Controller('likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @UseGuards(JwtAuthGuard)
  @Post('toggle')
  toggle(@Request() req: any, @Body() dto: ToggleLikeDto) {
    return this.likesService.toggle(req.user.sub, dto);
  }

  @Get('post/:postId/count')
  getCount(@Param('postId') postId: string) {
    return this.likesService.getCount(postId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('post/:postId/me')
  getUserLike(@Param('postId') postId: string, @Request() req: any) {
    return this.likesService.getUserLike(postId, req.user.sub);
  }
}
