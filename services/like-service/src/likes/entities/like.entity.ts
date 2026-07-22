import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Unique,
} from 'typeorm';

@Entity('likes')
@Unique(['post_id', 'user_id']) // idempotent: one like per user per post
export class Like {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  post_id: string;

  @Column()
  user_id: string;

  @Column({ default: 'like' })
  reaction: string; // 'like' | 'love' | 'wow' — extensible

  @CreateDateColumn()
  created_at: Date;
}
