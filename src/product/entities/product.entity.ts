import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from './product-image.entity';

@Entity()
export class Product {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text',{
    unique:true
  })
  title : string;


  @Column('float',{
    default: 0
  })
  price: number;

  @Column({
    type: 'text',
    nullable: true
  })
  description: string;

  @Column('text', {
    unique: true
  })
  slug: string;

  @Column('int', {
    default: 0
  })
  stock: number;

  @Column('text',{
    array: true
  })
  sizes: string[];

  @Column('text')
  gender: string; 


  @Column('text', {
    array: true,
    default: []
  })
  tags: string[];

  // images
  @OneToMany(
    () => ProductImage,
    (productImage) => productImage.product,
    {cascade : true, eager: true} //** Eager para traer siempre la relacion */
  )
  images?: ProductImage[];

  //** Trigger antes de insertar valida el slug para que nunca sea nulo
  @BeforeInsert()
  checkSlugInsert() {

    if ( !this.slug ) {
      this.slug = this.title;
    }

    this.validateSlug();

  }

  
  //** Trigger antes de actualizar valida el slug para que nunca sea nulo
  @BeforeUpdate()
  checkSlugUpdate() {
   this.validateSlug();
  }


  private validateSlug (){
    this.slug = this.slug
    .toLowerCase()
    .replaceAll(' ','_')
    .replaceAll("'",'')
  }
}
