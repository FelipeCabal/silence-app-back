import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    public readonly client: Redis;

    constructor() {
        this.client = new Redis({
            host: process.env.REDIS_HOST,
            port: 6379,
            password: process.env.REDIS_PASSWORD,
            tls: {},
            lazyConnect: true,
        });
    }

    async onModuleInit() {
        try {
            await this.client.connect();
        } catch (error) {
            console.error('💥 Error al conectar con Redis:', error);
        }
    }

    async onModuleDestroy() {
        await this.client.quit();
    }
}