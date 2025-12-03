import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-ioredis-yet';
import { BullModule as BullMQModule } from '@nestjs/bullmq';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // đọc .env
    TerminusModule, // /health
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),

    // Redis cache
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (cfg: ConfigService) => ({
        store: await redisStore({
          // trỏ vào Redis Sentinel thay vì 1 node đơn
          sentinel: {
            sentinels: [
              { host: cfg.get('REDIS_SENTINEL_1_HOST'), port: cfg.get<number>('REDIS_SENTINEL_1_PORT') },
              { host: cfg.get('REDIS_SENTINEL_2_HOST'), port: cfg.get<number>('REDIS_SENTINEL_2_PORT') },
              { host: cfg.get('REDIS_SENTINEL_3_HOST'), port: cfg.get<number>('REDIS_SENTINEL_3_PORT') },
            ],
            name: cfg.get('REDIS_MASTER_NAME'), // mặc định "mymaster"
          },
          password: cfg.get('REDIS_PASSWORD') || undefined,
          db: 0,
        }),
      }),
    }),

    // BullMQ queue (dùng chung Redis Sentinel)
    BullMQModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        connection: {
          sentinel: {
            sentinels: [
              { host: cfg.get('REDIS_SENTINEL_1_HOST'), port: cfg.get<number>('REDIS_SENTINEL_1_PORT') },
              { host: cfg.get('REDIS_SENTINEL_2_HOST'), port: cfg.get<number>('REDIS_SENTINEL_2_PORT') },
              { host: cfg.get('REDIS_SENTINEL_3_HOST'), port: cfg.get<number>('REDIS_SENTINEL_3_PORT') },
            ],
            name: cfg.get('REDIS_MASTER_NAME'),
          },
          password: cfg.get('REDIS_PASSWORD') || undefined,
          db: 1,
        },
      }),
    }),
  ],
})
export class AppModule {}
