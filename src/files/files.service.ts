import {join} from 'path';
import { BadRequestException, Injectable } from '@nestjs/common';
import { fileExistsSync } from 'tsconfig-paths/lib/filesystem';
@Injectable()
export class FilesService {

  getFileName (imageName : string){
     const path = join(__dirname,'../../static/products',imageName);
     if(!fileExistsSync(path)){
       throw new BadRequestException(`No product found with image ${imageName}`);
     }

     return path;
  }
}
