import { Injectable, Logger } from '@nestjs/common';
import { ProductService } from '../product/product.service';
import { initialData } from './data/data-seed';

@Injectable()
export class SeedService {
  private readonly logger = new Logger('SeedController');
  constructor( private readonly  productService: ProductService) {
  }
  execute() {
    return this.insertNewProducts();
  }

  private async insertNewProducts(){

    this.logger.debug("seed started");
    await this.productService.deleteAll();

    const products = initialData.products;

    let promises = [];

    products.forEach(product => {
      promises.push(this.productService.create(product));
    } );

    await Promise.all(promises);
    this.logger.debug("Seed Executed succesfully");
    return 'This action adds a new seed';
  }

}
