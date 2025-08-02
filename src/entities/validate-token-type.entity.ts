import { Common } from "src/entities/common.entity";
import { Entity, JoinColumn, OneToMany } from "typeorm";
import { ValidateToken } from "./validate-token.entity";

@Entity({name: "common"})
export class ValidateTokenType extends Common {
  @OneToMany(() => ValidateToken, validateToken => validateToken.type)
  @JoinColumn({ name: 'id' })
  public validateTokens: Promise<ValidateToken[]>
}