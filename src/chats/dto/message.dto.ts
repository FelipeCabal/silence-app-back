import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';

export enum ChatType {
  PRIVATE = 'private',
  GROUP = 'group',
  COMMUNITY = 'community',
}

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  chatId: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsEnum(ChatType)
  @IsNotEmpty()
  chatType: ChatType;
}

export class JoinChatDto {
  @IsString()
  @IsNotEmpty()
  chatId: string;

  @IsEnum(ChatType)
  @IsNotEmpty()
  chatType: ChatType;
}

export class TypingDto {
  @IsString()
  @IsNotEmpty()
  chatId: string;

  @IsEnum(ChatType)
  @IsNotEmpty()
  chatType: ChatType;

  @IsOptional()
  isTyping?: boolean;
}
