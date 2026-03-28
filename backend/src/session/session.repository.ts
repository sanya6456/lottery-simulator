import { DataSource } from 'typeorm';
import { Session } from 'src/lib/entities/session.entity';
import { WinningDraw } from 'src/lib/entities/winning-draw.entity';
import { PG_DATA_SOURCE } from 'src/lib/modules/postgres.module';

export const SESSION_REPOSITORY = 'SESSION_REPOSITORY';
export const WINNING_DRAW_REPOSITORY = 'WINNING_DRAW_REPOSITORY';

export const sessionRepositoryProvider = {
  provide: SESSION_REPOSITORY,
  inject: [PG_DATA_SOURCE],
  useFactory: (dataSource: DataSource) => dataSource.getRepository(Session),
};

export const winningDrawRepositoryProvider = {
  provide: WINNING_DRAW_REPOSITORY,
  inject: [PG_DATA_SOURCE],
  useFactory: (dataSource: DataSource) => dataSource.getRepository(WinningDraw),
};
