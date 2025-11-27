import { ApiProperty } from "@nestjs/swagger";
import { Comunidades } from "../schemas/community.schema";

export class CommunitySummaryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nombre: string;

  @ApiProperty({ required: false })
  imagen?: string;

  @ApiProperty({ required: false })
  lastMessage?: string;

  @ApiProperty()
  lastMessageDate: Date;

  static fromModel(model: Comunidades): CommunitySummaryResponseDto {
    return {
      id: model._id.toString(),
      nombre: model.nombre,
      imagen: model.imagen,
      lastMessage: model.lastMessage ?? null,
      lastMessageDate: model.lastMessageDate ?? null,
    };
  }
}
