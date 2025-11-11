import { IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInvitationDto {
  @IsMongoId()
  @ApiProperty({
    description: 'ID del usuario que envía la invitación',
    example: '64b7f9a2e1d3f2a5b6c7d8eb',
  })
  senderId: string;

  @IsMongoId()
  @ApiProperty({
    description: 'ID del usuario que recibe la invitación',
    example: '64b7f9a2e1d3f2a5b6c7d8ec',
  })
  receiverId: string;

  @IsMongoId()
  @ApiProperty({
    description: 'ID del grupo al que se invita',
    example: '64b7f9a2e1d3f2a5b6c7d8ed',
  })
  groupId: string;
}
