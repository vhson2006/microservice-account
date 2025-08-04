import { Module } from '@nestjs/common';
import { CommentController } from 'src/modules/comment/comment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentStatus } from 'src/entities/comment-status.entity';
import { CommentType } from 'src/entities/comment-type.entity';
import { CommentService } from 'src/modules/comment/comment.service';
import { Comment } from 'src/entities/comment.entity';
import { I18nService } from 'src/middlewares/globals/i18n/i18n.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, CommentStatus, CommentType])
  ],
  controllers: [CommentController],
  providers: [CommentService, I18nService],
})
export class CommentModule {}
