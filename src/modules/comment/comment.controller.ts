import { Controller, Get, Query } from '@nestjs/common';
import { CommentQueryDto } from 'src/modules/comment/dto/query-comment.dto';
import { CommentService } from 'src/modules/comment/comment.service';
import { Auth } from 'src/middlewares/iam/authentication/decorators/auth.decorator';
import { AuthType } from 'src/middlewares/iam/authentication/enums/auth-type.enum';
import { Permissions } from 'src/middlewares/iam/authorization/decorators/permission.decoration';
import { VIEW } from 'src/assets/configs/app.permission';

Auth(AuthType.Bearer)
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Permissions(`${VIEW.GROUP}.${VIEW.COMMENT}`)
  @Get()
  findAll(@Query() query: CommentQueryDto) {
    return this.commentService.findAll(query);
  }
}
