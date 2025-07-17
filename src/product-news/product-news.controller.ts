import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/common/decorator/roles';
import { AdminRolesGuard } from 'src/common/roles/admin.roles';
import {
  NewProductDto,
  NewProductNewsDto,
  NewProductPriceDto,
} from './dto/product.dto';
import { ProductsNewsService } from './product-news.service';

@Controller('api/v1/products')
export class ProductsNewsController {
  constructor(private readonly productsService: ProductsNewsService) {}

  @Post('inc')
  @UseGuards(AdminRolesGuard)
  @Roles('SuperAdmin')
  createProduct(@Body() newProductDto: NewProductDto) {
    return this.productsService.createProduct(newProductDto);
  }

  @Get('inc')
  fetchProducts(@Body() body, @Query() query) {
    return this.productsService.fetchProducts(body, query);
  }

  @Get('inc/:id')
  getSingleProduct(@Param('id') product) {
    return this.productsService.getSingleProduct({ _id: product });
  }

  @Patch('inc')
  @UseGuards(AdminRolesGuard)
  @Roles('SuperAdmin')
  patchProduct(@Body() body) {
    return this.productsService.updateProduct(body.productId, body.status);
  }

  @Post('news')
  @UseGuards(AdminRolesGuard)
  @Roles('SuperAdmin', 'Blogger')
  createNews(@Body() productNews: NewProductNewsDto) {
    return this.productsService.createNews(productNews);
  }

  @Get('news')
  getMultipleNews(@Body() body, @Query() query) {
    return this.productsService.getNews(body, query);
  }

  @Get('news/product/:id')
  getProductNews(@Param('id') productId, @Query() query) {
    return this.productsService.getNews({ product: productId }, query);
  }

  @Get('news/:id')
  getSingleNews(@Param('id') news_id) {
    return this.productsService.getSingleNews({ _id: news_id });
  }

  @Patch('news')
  @UseGuards(AdminRolesGuard)
  @Roles('SuperAdmin', 'Blogger')
  patchNews(@Body() body) {
    return this.productsService.updateNews(body.news_id, body.news);
  }

  //User Access
  @Post('subscription')
  createSubscription(@Req() req) {
    const { productId } = req.body;
    const user = req.decoded.sID;
    return this.productsService.addProductSubscription({ product: productId, userId: user });
  }

  //User Access
  @Get('subscription')
  fetchProductSub(@Req() req, @Query() queryParam) {
    return this.productsService.fetchProductSubscription({
      userId: req.decoded.sID,
       
    }, queryParam,);
  }

  //User Access
  @Delete('subscription')
  updateSubscription(@Req() req) {
    const { productId } = req.body;
    return this.productsService.updateProductSubscription(
      {
        userId: req.decoded.sID,
        product: productId,
      }
    );
  }

  @Patch('price')
  @UseGuards(AdminRolesGuard)
  @Roles('SuperAdmin', 'Blogger')
  patchProductPrice(@Body() body) {
    return this.productsService.updateDailyPrice(body);
  }

  @Get('prices')
  fetchDailyPrice(@Query() search) {
    return this.productsService.fetchDailyPrice(search);
  }

  @Get('prices/:id')
  fetchSingleDailyPrice(@Param('id') id) {
    return this.productsService.fetchSingleDailyPrice(id);
  }

  @Post('prices')
  @UseGuards(AdminRolesGuard)
  @Roles('SuperAdmin', 'Blogger')
  createProductPrice(@Body() newProductPrice: NewProductPriceDto) {
    return this.productsService.createDailyPrice(newProductPrice);
  }

  @Get('prices/graph/:id')
  fetchPriceGraph(@Param('id') id, @Query() query) {
    const { duration, intervals } = query;
    return this.productsService.getProductPriceGraphData(id, intervals);
  }
}
