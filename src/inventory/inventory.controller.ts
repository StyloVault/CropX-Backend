import { Body, Controller, Delete, Get, Param, Post, Query, Req, Res, UseGuards, Patch } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { Roles } from 'src/common/decorator/roles';
import { UserRolesGuard } from 'src/common/roles/user.roles';
import { InventoryDTO } from './dto/inventoryDto';
import { Response } from 'express';
import { AdminRolesGuard } from 'src/common/roles/admin.roles';

@Controller('api/v1/inventory')
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService, 
     ) {}
     
     @Get('/get') 
     @UseGuards(UserRolesGuard)
     @Roles('User', 'Company')
     getInventories(@Req() req, @Query() body : any, @Res() res : Response) {
         const {sID} = req.decoded
       return this.inventoryService.getAllInventories(body, sID, res);
     }
    
    @Get('/get/:id') 
    @UseGuards(UserRolesGuard)
    @Roles('User', 'Company')
    getInventory(@Req() req,@Param('id') id :string, @Res() res ) {
      const {sID} = req.decoded
      return this.inventoryService.getOneInventory(id,sID, res);
    }

    @Delete('/delete/:id') 
    @UseGuards(UserRolesGuard)
    @Roles('User', 'Company')
    deleteInventory(@Req() req, @Param('id') id :string, @Res() res ) {
        const {sID} = req.decoded
      return this.inventoryService.deleteOneInventory(id, sID, res);
    }

    @Post('/create')
    @UseGuards(UserRolesGuard)
    @Roles('User', 'Company')
    createInventory(@Req() req, @Body() body : InventoryDTO,@Res() res) {
        return this.inventoryService.createInventory(req.decoded, body, res)
  }

  @Patch('/update/:id')
  @UseGuards(UserRolesGuard)
  @Roles('User', 'Company')
  updateInventory(@Req() req, @Body() body : InventoryDTO,  @Param('id') id :string, @Res() res) {
      return this.inventoryService.updateInventory(req.decoded, id,body, res)
}


  // Admin 



  @Get('/admin/all')
  @UseGuards(AdminRolesGuard)
  @Roles('Admin', 'SuperAdmin')
  getAllInventories(@Query() body : any, @Res() res : Response) {
      return this.inventoryService.getInventories(body, res)
   }


  @Get('/admin/user/:id') 
  @UseGuards(AdminRolesGuard)
  @Roles('Admin', 'SuperAdmin')
  getUserInventories(@Param('id') id, @Query() body : any, @Res() res : Response) { 
      return this.inventoryService.getAllUserInventories(body, id, res)
  }



  @Get('/admin/inventory/:id') 
  @UseGuards(AdminRolesGuard)
  @Roles('Admin', 'SuperAdmin')
  getSingleInventories(@Param('id') id, @Res() res : Response) { 
      return this.inventoryService.getInventory(id, res)
  }


// async updateInventory() {

// }

// async deleteInventory(id : string, sID: string, res: Response) {
//   try {
//      await this.inventoryRepository.deleteSingleInventory({_id:id, businessID : sID})
//      return this.apiResponse.success(res, 'inventory  deleted successfully', [])
//   }catch(error) {
//     return this.apiResponse.failure(res, error.message, error, error.statusCode)
//  }
// }


}
