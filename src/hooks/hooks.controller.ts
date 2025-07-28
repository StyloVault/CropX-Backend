import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query } from '@nestjs/common';
import { HooksService } from './hooks.service';
import { CreateHookDto } from './dto/create-hook.dto';
import { UpdateHookDto } from './dto/update-hook.dto';

@Controller('api/v1/hooks')
export class HooksController {
  constructor(private readonly hooksService: HooksService) {}

  @Post(':route')
  hooks(@Req() req, @Param('route') route: any, @Query() query) {
    return this.hooksService.main(req, route, query);
  }

}
