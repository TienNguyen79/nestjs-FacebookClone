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
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { Public, ResponseMessage } from 'src/decorator/customize';
import { LocalAuthGuard } from './local-auth-guard';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request as RequestExpress, Response } from 'express';

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

  @Public()
  @Post('/logout')
  @ResponseMessage('Logout User')
  handleLogout(
    @Req() request: RequestExpress,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies['refresh_token'] as string; // lấy refresh token từ cookie

    return this.authService.logOut(refreshToken, response);
  }

  @Get('/account')
  @ResponseMessage('Get user information')
  handleGetAccount(@Request() req) {
    const { user } = req;
    return { user };
  }

  @Public()
  @Get('/refresh')
  @ResponseMessage('Get user by refresh token')
  handleRefreshToken(
    @Req() request: RequestExpress,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies['refresh_token'] as string;
    return this.authService.processNewToken(refreshToken, response);
  }
}
