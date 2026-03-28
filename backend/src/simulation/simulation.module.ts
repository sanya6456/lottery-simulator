import { forwardRef, Module } from '@nestjs/common';
import { SessionsModule } from '../session/sessions.module';
import { WsModule } from '../lib/websocket/ws.module';
import { SimulationService } from './simulation.service';

@Module({
  imports: [forwardRef(() => SessionsModule), WsModule],
  providers: [SimulationService],
  exports: [SimulationService],
})
export class SimulationModule {}
