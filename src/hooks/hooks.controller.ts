import { Controller } from '@nestjs/common';
import { HooksService } from './hooks.service';

@Controller('hooks')
export class HooksController {
  constructor(private readonly hooksService: HooksService) {}
}
