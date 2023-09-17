import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { UserDTO } from './dto/UserDTO';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserLoginDTO } from './dto/UserLoginDTO';
@Injectable()
export class AuthService {
  private readonly log = new Logger(AuthService.name);
  constructor(
    @InjectRepository(User)
    private readonly UserRepository: Repository<User>
  ) {
  }
  async create(userDTO: UserDTO) {
    try {
      const {password , ...data} = userDTO;


      const user = this.UserRepository.create({
        ...data,
        password: bcrypt.hashSync(password, 10)
      });
      await this.UserRepository.save(user);

      delete user.password;

      return user;

    }catch (error){
      this.handleExceptions(error);
    }
  }

  async login(user: UserLoginDTO){
    const {email, password} = user;

    const usere = await this.UserRepository.findOne({
      where: {email},
      select: {email: true, password:true}
    });

    if(!usere)
      throw new BadRequestException("Credentials are not valid (email)");

    if(!bcrypt.compareSync(password, usere.password))
      throw new BadRequestException("Credentials are not valid (Password)");

    return usere;
    // TODO JWT
  }
  private handleExceptions(error): never {

    if (error.code === '23505'){
      throw  new  BadRequestException(error.detail)
    }

    this.log.error(error);

    throw new InternalServerErrorException("Algo salio mal revisa los logs")

  }
}
