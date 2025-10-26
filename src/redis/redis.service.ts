import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    public readonly client: Redis;

    constructor() {
        this.client = new Redis({
            host: 'relieved-snapper-29465.upstash.io',
            port: 6379,
            password: 'AXMZAAIncDI1YWI0ZDU1NjdiMWM0NDI0OTU3ZjM1ZGM0NGIyNmY3Y3AyMjk0NjU',
            tls: {},
            lazyConnect: true,
        });

        this.client.on('connect', () => {
            console.log('🚀 Conectado a Redis Upstash');
        });

        this.client.on('ready', () => {
            console.log('✅ Redis listo para recibir comandos');
        });

        this.client.on('error', (err) => {
            console.error('❌ Error de Redis:', err);
        });

        this.client.on('close', () => {
            console.log('🔌 Conexión Redis cerrada');
        });
    }

    async onModuleInit() {
        try {
            await this.client.connect();
            console.log('🎯 RedisService inicializado correctamente');
        } catch (error) {
            console.error('💥 Error al conectar con Redis:', error);
        }
    }

    async onModuleDestroy() {
        await this.client.quit();
    }
}