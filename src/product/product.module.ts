import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductImage, Product } from './entities';

@Module({
  controllers: [ProductController],
  providers: [ProductService],
  imports: [
    TypeOrmModule.forFeature([Product, ProductImage])
  ],
  exports: [ProductService]
})
export class ProductModule {}
