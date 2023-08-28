import { Controller, Get, Logger } from '@nestjs/common';
import { SeedService } from './seed.service';

@Controller('seed')
export class SeedController {
  private readonly logger = new Logger('SeedController');
  constructor(private readonly seedService: SeedService,
             )
  {}

  @Get()
  executeSeed(){
    this.logger.log("Seed request ok!")
    return this.seedService.execute();
  }


}
