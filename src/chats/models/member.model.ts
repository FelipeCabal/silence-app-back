import { Prop } from "@nestjs/mongoose";
import { Role } from "src/config/enums/roles.enum";

export class MembersSummary {
    @Prop()
  _id: string;
@Prop()
  role: Role;
}
