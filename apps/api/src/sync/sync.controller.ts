import {
  Controller,
  Post,
  Body,
  Headers,
  BadRequestException,
  Param,
} from '@nestjs/common';
import { SyncService } from './sync.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('sync')
@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post(':entity/pull')
  @ApiOperation({
    summary: 'Pull changes for an entity (RxDB replication support)',
  })
  async pull(
    @Param('entity') entity: string,
    @Body() body: { checkpoint: any; limit: number },
    @Headers('x-tenant-id') organizationId: string,
  ) {
    if (!organizationId) {
      throw new BadRequestException('X-Tenant-ID header is missing');
    }
    return this.syncService.pull(
      entity,
      organizationId,
      body.checkpoint,
      body.limit || 100,
    );
  }

  @Post(':entity/push')
  @ApiOperation({
    summary: 'Push changes for an entity (RxDB replication support)',
  })
  async push(
    @Param('entity') entity: string,
    @Body() body: { changes: any[] },
    @Headers('x-tenant-id') organizationId: string,
  ) {
    if (!organizationId) {
      throw new BadRequestException('X-Tenant-ID header is missing');
    }
    return this.syncService.push(entity, organizationId, body.changes);
  }
}
