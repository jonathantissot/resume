import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  author_id: string;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ nullable: true, length: 500 })
  excerpt: string;

  @Column({ nullable: true, length: 500 })
  cover_image_url: string;

  @Column({ nullable: true, length: 500 })
  thumbnail_url: string;

  @Column({ default: 'draft' })
  status: string; // draft | published | archived

  @Column({ default: 'private' })
  visibility: string; // private | friends | public

  @Column({ nullable: true, length: 50 })
  category: string;

  @Column({ type: 'text', array: true, default: [] })
  tags: string[];

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @Column({ nullable: true })
  published_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
