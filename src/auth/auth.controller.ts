import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { Public, ResponseMessage } from 'src/decorator/customize';
import { LocalAuthGuard } from './local-auth-guard';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Response } from 'express';

@ApiTags('auth') // dành cho swagger
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public() // khi tất cả bắt buộc phải có jwt mới call api được nhưng cho cái PUBLIC vào thì không cần
  @UseGuards(LocalAuthGuard)
  @UseGuards(ThrottlerGuard)
  // @ApiBody({ type: UserLoginDto })
  @Post('/login')
  @ResponseMessage('User Login')
  async handleLogin(
    @Request() req,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login(req.user, response); // req.user là từ passport trả về trong local.strategy.ts
  }

  @Public()
  @Post('/register')
  @ResponseMessage('Register a new User')
  handleRegister(@Body() registerUser: RegisterUserDto) {
    return this.authService.register(registerUser);
  }

  // @Post()
  // create(@Body() createAuthDto: CreateAuthDto) {
  //   return this.authService.create(createAuthDto);
  // }

  // @Get()
  // findAll() {
  //   return this.authService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.authService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
  //   return this.authService.update(+id, updateAuthDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.authService.remove(+id);
  // }
}
