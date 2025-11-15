import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/services/users.service';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly UsersService: UsersService,
        private readonly JwtServices: JwtService,
        private readonly redisService: RedisService,
    ) { }

    async login({ email, password }: LoginDto) {
        const user = await this.UsersService.findByEmail(email)

        if ((await bcrypt.compare(password, user.password)) === false) {
            throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED)
        }
        const payload = {
            id: user.id,
            email: user.email,
            name: user.nombre
        };

        return {
            access_token: await this.JwtServices.signAsync(payload),
        };
    }

    async register(registerFields: CreateUserDto) {
        const login: LoginDto = {
            email: registerFields.email,
            password: registerFields.password
        }
        const user = await this.UsersService.createUser(registerFields)

        if (!user) {
            throw new HttpException('The user was not created', HttpStatus.INTERNAL_SERVER_ERROR)
        }

        return this.login(login)
    }

    async profile(id: string) {
        const cacheKey = `profile:${id}`;
        const TTL_SECONDS = 600;

        const cached = await this.redisService.client.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }

        const user = await this.UsersService.findOneUser(id);

        const safeUser: any = user ? { ...user } : user;
        if (safeUser && 'password' in safeUser) {
            delete safeUser.password;
        }

        if (safeUser) {
            try {
                await this.redisService.client.set(cacheKey, JSON.stringify(safeUser), 'EX', TTL_SECONDS);
            } catch (err) {
                console.warn('Redis set failed for key', cacheKey, err?.message || err);
            }
        }

        return safeUser;
    }
}
