import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PublicacionesModule } from './publicaciones/publicaciones.module';
import { ChatsModule } from './chats/chats.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { typeOrmConfig, mongooseConfigUri } from './config/data.source';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { ComentariosModule } from './publicaciones/comentarios/comentarios.module';
import { LikesModule } from './likes/likes.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(typeOrmConfig),
    MongooseModule.forRoot(mongooseConfigUri),
    PublicacionesModule,
    ChatsModule,
    UsersModule,
    AuthModule,
    ComentariosModule,
    LikesModule
  ],
  controllers: [AppController,],
  providers: [AppService,],
  exports: [TypeOrmModule, MongooseModule]
})
export class AppModule { }
