import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException, Get, Res, Param,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import {fileFilter, fileNamer} from './helpers';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('files/product')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService
  ) {}

  @Get('/:image')
  findProductImage(
    @Res() resp: Response,
    @Param('image') image: string
  ){
    const path = this.filesService.getFileName(image);
    resp.sendFile(path);
  }
  @Post()
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: fileFilter,
    //limits: {fileSize: 1000, files: 3},
    storage:diskStorage({
      destination:'./static/products',
      filename: fileNamer
    })
  }))
  create(
    @UploadedFile() file: Express.Multer.File
  ) {
    // * This is the client feedback after the validation of the interceptor
    if(!file) {
      throw new BadRequestException("Make sure that the files is an image");
    }



    const secureURl = `${this.configService.get("HOST_API")}/files/product/${file.filename}`;
    return {secureURl};
  }
}
