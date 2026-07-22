import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { Like } from './entities/like.entity';
import { ToggleLikeDto } from './dto/toggle-like.dto';

@Injectable()
export class LikesService {
  private readonly sns = new SNSClient({ region: process.env.AWS_REGION ?? 'us-east-1' });

  constructor(
    @InjectRepository(Like) private readonly likeRepo: Repository<Like>,
  ) {}

  async toggle(userId: string, dto: ToggleLikeDto): Promise<{ liked: boolean; count: number }> {
    const existing = await this.likeRepo.findOneBy({ post_id: dto.post_id, user_id: userId });
    if (existing) {
      await this.likeRepo.remove(existing);
    } else {
      const like = this.likeRepo.create({ post_id: dto.post_id, user_id: userId, reaction: dto.reaction ?? 'like' });
      await this.likeRepo.save(like);
      await this.publishSns('PostLiked', { postId: dto.post_id, userId, reaction: like.reaction });
    }
    const count = await this.likeRepo.countBy({ post_id: dto.post_id });
    return { liked: !existing, count };
  }

  async getCount(postId: string): Promise<{ count: number }> {
    const count = await this.likeRepo.countBy({ post_id: postId });
    return { count };
  }

  async getUserLike(postId: string, userId: string): Promise<{ liked: boolean }> {
    const like = await this.likeRepo.findOneBy({ post_id: postId, user_id: userId });
    return { liked: !!like };
  }

  private async publishSns(event: string, detail: Record<string, any>) {
    const topicArn = process.env.SNS_TOPIC_ARN;
    if (!topicArn) return;
    try {
      await this.sns.send(new PublishCommand({
        TopicArn: topicArn,
        Message: JSON.stringify({ event, ...detail }),
        Subject: event,
      }));
    } catch (err) {
      console.error('SNS publish failed', err);
    }
  }
}
