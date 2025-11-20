import { Prop } from '@nestjs/mongoose';

export class Group {
  @Prop()
  readonly _id: string;
  @Prop()
  readonly nombre: string;
  @Prop()
  readonly imagen?: string;
}
