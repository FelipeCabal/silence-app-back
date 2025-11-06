import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/services/users.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly UsersService: UsersService,
        private readonly JwtServices: JwtService
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
        const user = await this.UsersService.findOneUser(id)
        return user
    }
}
