import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './lib/modules/config.module';
import { PostgresModule } from './lib/modules/postgres.module';
import { RedisModule } from './lib/modules/redis.module';
import { SimulationModule } from './simulation/simulation.module';
import { SessionsModule } from './session/sessions.module';

@Module({
  imports: [
    ConfigModule,
    PostgresModule,
    RedisModule,
    SessionsModule,
    SimulationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
