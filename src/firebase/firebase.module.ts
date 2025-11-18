import { Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { FirebaseController } from './firebase.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../config/constants/jwt.constants';
import { AuthGuard } from '../auth/guards/auth.guard';

@Module({
    imports: [
        UsersModule,
        JwtModule.register(jwtConstants),
    ],
    controllers: [FirebaseController],
    providers: [FirebaseService, AuthGuard],
    exports: [FirebaseService],
})
export class FirebaseModule { }