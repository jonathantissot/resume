import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  private readonly eb = new EventBridgeClient({ region: process.env.AWS_REGION ?? 'us-east-1' });

  constructor(
    @InjectRepository(Comment) private readonly commentRepo: Repository<Comment>,
  ) {}

  async create(authorId: string, dto: CreateCommentDto): Promise<Comment> {
    const depth = dto.parent_id ? 1 : 0;
    const comment = this.commentRepo.create({ ...dto, author_id: authorId, depth });
    const saved = await this.commentRepo.save(comment);
    await this.publishEvent('CommentCreated', {
      commentId: saved.id,
      postId: saved.post_id,
      authorId: saved.author_id,
      parentId: saved.parent_id ?? null,
    });
    return saved;
  }

  findByPost(postId: string): Promise<Comment[]> {
    return this.commentRepo.find({
      where: { post_id: postId, status: 'active' },
      order: { created_at: 'ASC' },
    });
  }

  async remove(id: string, authorId: string): Promise<void> {
    const comment = await this.commentRepo.findOneBy({ id });
    if (!comment) throw new NotFoundException();
    if (comment.author_id !== authorId) throw new ForbiddenException();
    comment.status = 'deleted';
    await this.commentRepo.save(comment);
  }

  private async publishEvent(detailType: string, detail: Record<string, any>) {
    try {
      await this.eb.send(new PutEventsCommand({
        Entries: [{
          Source: 'blog.platform',
          DetailType: detailType,
          Detail: JSON.stringify(detail),
          EventBusName: process.env.EVENT_BUS_NAME ?? 'default',
        }],
      }));
    } catch (err) {
      console.error('EventBridge publish failed', err);
    }
  }
}
