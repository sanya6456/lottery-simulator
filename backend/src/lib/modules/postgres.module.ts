import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

export const PG_DATA_SOURCE = 'PG_DATA_SOURCE';

@Module({
  providers: [
    {
      provide: PG_DATA_SOURCE,
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const dataSource = new DataSource({
          type: 'postgres',
          host: config.getOrThrow('DB_HOST'),
          port: parseInt(config.getOrThrow('DB_PORT'), 10),
          username: config.getOrThrow('DB_USER'),
          password: config.getOrThrow('DB_PASSWORD'),
          database: config.getOrThrow('DB_NAME'),
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          migrations: [__dirname + '/../migrations/*{.ts,.js}'],
          synchronize: config.get('NODE_ENV') === 'development',
        });

        return dataSource.initialize();
      },
    },
  ],
  exports: [PG_DATA_SOURCE],
})
export class PostgresModule {}
