import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  post_id: string;

  @Column()
  author_id: string;

  @Column({ nullable: true })
  parent_id: string; // null = top-level, set = reply

  @Column({ type: 'int', default: 0 })
  depth: number; // 0 = top-level comment, 1 = reply

  @Column({ type: 'text' })
  content: string;

  @Column({ default: 'active' })
  status: string; // active | flagged | deleted

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
