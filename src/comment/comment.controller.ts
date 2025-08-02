import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CommentQueryDto } from 'src/comment/dto/query-comment.dto';
import { CommentService } from 'src/comment/comment.service';

@Controller()
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @MessagePattern('findAllComment')
  findAll(@Payload() query: CommentQueryDto) {
    return this.commentService.findAll(query);
  }
}
