import { Controller, Get, Query, Req, Res, UseGuards, Param, Patch, Body } from '@nestjs/common';
import { ItemService } from './item.service';
import { UserRolesGuard } from 'src/common/roles/user.roles';
import { Roles } from 'src/common/decorator/roles';
import { Response } from 'express';
import { AdminRolesGuard } from 'src/common/roles/admin.roles';

@Controller('api/v1/item')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Get('/get')
  @UseGuards(UserRolesGuard)
  @Roles('User', 'Company')
  getItems(@Req() req, @Query() query: any, @Res() res: Response) {
    return this.itemService.getItems(query, req.decoded, res);
  }

  @Get('/get/:id')
  @UseGuards(UserRolesGuard)
  @Roles('User', 'Company')
  getItem(@Req() req, @Param('id') id: string, @Res() res: Response) {
    return this.itemService.getItem(id, req.decoded, res);
  }

  @Patch('/update/:id')
  @UseGuards(UserRolesGuard)
  @Roles('User', 'Company')
  updateItem(@Req() req, @Param('id') id: string, @Body() body: any, @Res() res: Response) {
    return this.itemService.updateItemPrice(id, req.decoded, body, res);
  }

  @Get('/admin/all')
  @UseGuards(AdminRolesGuard)
  @Roles('Admin', 'SuperAdmin')
  getAllItems(@Query() query: any, @Res() res: Response) {
    return this.itemService.getItemsAdmin(query, res);
  }

  @Get('/admin/user/:id')
  @UseGuards(AdminRolesGuard)
  @Roles('Admin', 'SuperAdmin')
  getUserItems(@Param('id') id: string, @Query() query: any, @Res() res: Response) {
    return this.itemService.getUserItemsAdmin(query, id, res);
  }

  @Get('/admin/item/:id')
  @UseGuards(AdminRolesGuard)
  @Roles('Admin', 'SuperAdmin')
  getItemAdmin(@Param('id') id: string, @Res() res: Response) {
    return this.itemService.getItemAdmin(id, res);
  }
}
