import { Global, Module } from '@nestjs/common';
import Redis from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';
export const REDIS_SUBSCRIBER = 'REDIS_SUBSCRIBER';

function createRedisClient(): Redis {
  return new Redis({
    host: process.env.REDIS_HOST ?? 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
    lazyConnect: true,
  });
}

@Global()
@Module({
  providers: [
    { provide: REDIS_CLIENT, useFactory: createRedisClient },
    { provide: REDIS_SUBSCRIBER, useFactory: createRedisClient },
  ],
  exports: [REDIS_CLIENT, REDIS_SUBSCRIBER],
})
export class RedisModule {}
