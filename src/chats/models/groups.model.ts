import { Prop } from '@nestjs/mongoose';

export class GroupSummary {
  @Prop()
  readonly _id: string;
  @Prop()
  readonly nombre: string;
  @Prop()
  readonly imagen?: string;
}
