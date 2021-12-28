import { Controller, Get } from '@nestjs/common';

@Controller('')
export class AppController {
  @Get('')
  async ok() {
    return 'OK';
  }

  @Get('health')
  async health() {
    return 'health';
  }
}
