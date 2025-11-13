import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    public readonly client: Redis;

    constructor() {
       this.client = new Redis({
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD || undefined,
        tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
        lazyConnect: true,
        connectTimeout: 5000,
        maxRetriesPerRequest: 1,
        retryStrategy: () => null, // Evita reintentos infinitos
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