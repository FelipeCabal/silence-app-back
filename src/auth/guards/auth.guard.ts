import {
    CanActivate,
    ExecutionContext,
    HttpException,
    HttpStatus,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from '../../config/constants/jwt.constants';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { UsersService } from 'src/users/services/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly jwtService: JwtService,
        private readonly usersService: UsersService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        console.log(request.headers.authorization)
        if (request.headers.authorization === undefined) {
            throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
        }
        const token = request.headers.authorization.split(' ')[1];

        try {
            const decoded = await this.jwtService.verifyAsync(token, {
                secret: jwtConstants.secret,
            });
            const user = await this.usersService.findByEmail(decoded.email);
            request.user = user;
        } catch (error) {
            throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
        }

        return true;
    }
}
