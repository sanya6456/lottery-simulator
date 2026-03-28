import {
  Body,
  Controller,
  Delete,
  forwardRef,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Session, SessionStatus } from 'src/lib/entities/session.entity';
import { WinningDraw } from 'src/lib/entities/winning-draw.entity';
import { SimulationService } from '../simulation/simulation.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSpeedDto } from './dto/update-speed.dto';
import { SessionsService } from './sessions.service';

@ApiTags('sessions')
@Controller('sessions')
export class SessionsController {
  constructor(
    private readonly sessionsService: SessionsService,
    @Inject(forwardRef(() => SimulationService))
    private readonly simulationService: SimulationService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create and start a new simulation session' })
  @ApiResponse({ status: 201, type: Session })
  async create(@Body() dto: CreateSessionDto): Promise<Session> {
    const session = await this.sessionsService.create(dto);
    await this.simulationService.start(session.id);
    return session;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get session state and statistics' })
  @ApiResponse({ status: 200, type: Session })
  @ApiResponse({ status: 404, description: 'Session not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Session> {
    return this.sessionsService.findOneOrFail(id);
  }

  @Patch(':id/speed')
  @ApiOperation({ summary: 'Update draw speed during simulation' })
  @ApiResponse({ status: 200, type: Session })
  async updateSpeed(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSpeedDto,
  ): Promise<Session> {
    const session = await this.sessionsService.updateSpeed(id, dto.speedMs);
    this.simulationService.updateSpeed(id, dto.speedMs);
    return session;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Stop and end a session' })
  @ApiResponse({ status: 204 })
  async end(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    this.simulationService.stop(id);
    await this.sessionsService.end(id, SessionStatus.EXPIRED);
  }

  @Get(':id/winning-draws')
  @ApiOperation({ summary: 'Get all winning draws for a session' })
  @ApiResponse({ status: 200, type: [WinningDraw] })
  getWinningDraws(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<WinningDraw[]> {
    return this.sessionsService.getWinningDraws(id);
  }
}
