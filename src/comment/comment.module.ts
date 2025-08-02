import { Module } from '@nestjs/common';
import { CommentController } from 'src/comment/comment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentStatus } from 'src/entities/comment-status.entity';
import { CommentType } from 'src/entities/comment-type.entity';
import { CommentService } from 'src/comment/comment.service';
import { I18nService } from 'src/globals/i18n/i18n.service';
import { Comment } from 'src/entities/comment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, CommentStatus, CommentType])
  ],
  controllers: [CommentController],
  providers: [CommentService, I18nService],
})
export class CommentModule {}
