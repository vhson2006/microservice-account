import { Common } from "src/entities/common.entity";
import { OneToMany, JoinColumn, Entity } from "typeorm";
import { Comment } from "./comment.entity";

@Entity({name: "common"})
export class CommentType extends Common {
  @OneToMany(() => Comment, comment => comment.type)
  @JoinColumn({ name: 'id' })
  public comments: Promise<Comment[]>
}