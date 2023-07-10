import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from '@Types';

@Entity()
export class Users extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({
    unique: true,
    length: 255,
  })
  email: string;

  @Column({ length: 255, default: '' })
  password: string;

  @Column({ type: 'enum', default: UserRole.USER, enum: UserRole })
  role: UserRole;

  @Column({ type: 'boolean', default: false })
  active: boolean;

  @Column({ length: 255, nullable: true, default: '' })
  refreshToken: string;

  @Column({ length: 255, nullable: true, default: null })
  verificationToken: string;

  @Column({ length: 255, nullable: true, default: null })
  activationUrl: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
