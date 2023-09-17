import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDTO } from './dto/UserDTO';
import { UserLoginDTO } from './dto/UserLoginDTO';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() userDTO: UserDTO) {
    return this.authService.create(userDTO);
  }
  @Post('login')
  userLogin(@Body() userDTO: UserLoginDTO) {
    return this.authService.login(userDTO);
  }
}
