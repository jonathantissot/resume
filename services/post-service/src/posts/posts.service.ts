import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
  ) {}

  async create(authorId: string, dto: CreatePostDto): Promise<Post> {
    const slug = slugify(dto.title) + '-' + Date.now();
    const post = this.postRepo.create({ ...dto, author_id: authorId, slug });
    return this.postRepo.save(post);
  }

  findAll(status?: string): Promise<Post[]> {
    const where: any = status ? { status } : {};
    return this.postRepo.find({ where, order: { created_at: 'DESC' } });
  }

  async findBySlug(slug: string): Promise<Post> {
    const post = await this.postRepo.findOneBy({ slug, status: 'published', visibility: 'public' });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async findOne(id: string): Promise<Post> {
    const post = await this.postRepo.findOneBy({ id });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async update(id: string, authorId: string, dto: UpdatePostDto): Promise<Post> {
    const post = await this.findOne(id);
    if (post.author_id !== authorId) throw new ForbiddenException();
    Object.assign(post, dto);
    return this.postRepo.save(post);
  }

  async publish(id: string, authorId: string): Promise<Post> {
    const post = await this.findOne(id);
    if (post.author_id !== authorId) throw new ForbiddenException();
    post.status = 'published';
    post.visibility = 'public';
    post.published_at = new Date();
    return this.postRepo.save(post);
  }

  async unpublish(id: string, authorId: string): Promise<Post> {
    const post = await this.findOne(id);
    if (post.author_id !== authorId) throw new ForbiddenException();
    post.status = 'draft';
    return this.postRepo.save(post);
  }

  async remove(id: string, authorId: string): Promise<void> {
    const post = await this.findOne(id);
    if (post.author_id !== authorId) throw new ForbiddenException();
    await this.postRepo.remove(post);
  }
}
