import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException
} from "@nestjs/common";
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from "../common/dtos/pagination.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import {validate as isUUID} from 'uuid';
import { ProductImage, Product } from "./entities";

@Injectable()
export class ProductService {

  private readonly logger = new Logger('ProductsService');

  constructor (
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource : DataSource,
  ){}

  /**
   * Metodo para la creacion de productos
   * @param createProductDto  es como luce el producto 
   * @returns el producto creado
   */
  async create(createProductDto: CreateProductDto) {
    try {

      const { images = [], ...productDetails } = createProductDto; 

      const product = this.productRepository.create({
        ...productDetails,
        images: images.map(image => this.productImageRepository.create({url: image}))
      });
      await this.productRepository.save( product );

      return {...product, images};

    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  /**
   * Metodo para obtener los productos con o sin paginacion
   * @param paginationDTO es el query o los parametros
   * @returns retorna los productos 
   */
  async findAll(paginationDTO: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDTO;

    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: { //** configuracion de relaciones va por el nombre de columna */
        images: true,
      }
    });

    return products.map(({images , ...rest}) =>({
      ...rest,
      images: images.map(img => img.url)
    }))
  }

  /**
   * metodo para la busqueda de productos por nombre id o slug
   * @param term Es el parametro por el cual se desea buscar
   * @returns el producto encontrado
   */
  async findOne(term: string) {
    let product: Product;

    if ( isUUID(term) ) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder('product'); //** se le asigna un alias product */
      product = await queryBuilder
        .where('UPPER(title) =:title or slug =:slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        })
        .leftJoinAndSelect('product.images','productImages')//** PAra indicar la relaciones con query builder no sierve el eager */
        .getOne();
    }


    if ( !product )
      throw new NotFoundException(`Product with ${ term } not found`);

    return product;
  }

  /**
   * Funcion para actualizar un producto, borra las imagenes en caso de que vengan nuevas o venga un  []
   * @param id el id unico de producto 
   * @param updateProductDto los nuevos datos del producto
   * @returns el producto actualizado
   */
  async update(id: string, updateProductDto: UpdateProductDto) { 

    const {images , ...toUpdate } = updateProductDto;

    //** busca un producto por un id y carga todas las propiedades que te paso y los mantienes en memoria */
    const product = await this.productRepository.preload({
      id,
      ...toUpdate
    });

    if ( !product ) throw new NotFoundException(`Product with id: ${ id } not found`);

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {

      if(images){
        // ** Borra todas las imagenes cuyo product id sea igual al que esta llegando
        await queryRunner.manager.delete( ProductImage, {product: { id }} );

        // ** Setea las nuevas imagenes al producto
        product.images = images.map(img => this.productImageRepository.create({url: img}));

      }

      await queryRunner.manager.save(product);
      
      //** Commit y desconexion */
      await queryRunner.commitTransaction();
      await queryRunner.release()
 
      // await this.productRepository.save( product );
      return this.finOnePlain(id);

    } catch (error) {
      
      //** ROLBACK */
      await queryRunner.rollbackTransaction();
      await queryRunner.release()

      this.handleDBExceptions(error);
    }
  }

  /**
   * Metodo para eliminar un producto
   * @param id el identificador unico del producto
   */
  async remove(id: string) {
    const product = await this.findOne( id );
    await this.productRepository.remove( product );
  }

  /**
   * Metodo para manejar errores de base de datos
   * @param error el error que se genero 
   * @returns un BadRequestExcepcion con el mensaje del error o un ServerInternal
   */
  private handleDBExceptions( error: any ) {

    if ( error.code === '23505' )
      throw new BadRequestException(error.detail);

    this.logger.error(error)
    // console.log(error)
    throw new InternalServerErrorException('Unexpected error, check server logs');

  }

  /**
   * Metodo para mapear la respuesta en endpoind  findOne
   * @param term es el temino por el cual se desea buscar
   * @returns un objeto con las propiedades y relaciones de un producto
   */
  async finOnePlain ( term:string ) {
    const { images = [], ...rest } = await this.findOne(term);

    return{
      ...rest,
      images: images.map(img => img.url)
    };
  }

  /**
   * Mtodo que elimina toda la data se usa en el seed
   */

  async deleteAll(){
    const query = this.productRepository.createQueryBuilder('product');
    try {
        return await query.delete().where({}).execute();
    }catch (error){
      this.handleDBExceptions(error);
    }
  }
}
