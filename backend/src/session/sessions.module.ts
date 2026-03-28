import { forwardRef, Module } from '@nestjs/common';
import { PostgresModule } from '../lib/modules/postgres.module';
import { SimulationModule } from '../simulation/simulation.module';
import {
  sessionRepositoryProvider,
  winningDrawRepositoryProvider,
} from './session.repository';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';

@Module({
  imports: [PostgresModule, forwardRef(() => SimulationModule)],
  providers: [
    sessionRepositoryProvider,
    winningDrawRepositoryProvider,
    SessionsService,
  ],
  controllers: [SessionsController],
  exports: [SessionsService],
})
export class SessionsModule {}
