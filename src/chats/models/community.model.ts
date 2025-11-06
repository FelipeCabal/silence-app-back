import { Prop } from "@nestjs/mongoose";
import { MembersSummary } from "./member.model";

export class CommunitySummary {
  @Prop()
  _id: string;
  @Prop()
  nombre: string;
  @Prop()
  imagen?: string;

 @Prop({ type: [MembersSummary], default: [] })
  miembrosSummary: MembersSummary[];

}