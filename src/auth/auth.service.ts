import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import * as ms from 'ms';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { IUser } from 'src/users/users.interface';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    // private roleService: RolesService,
  ) {}

  async login(user: IUser, response: Response) {
    const { _id, email, name } = user;
    console.log('🚀 ~ AuthService ~ login ~ user:', user);
    const payload = {
      sub: 'Token Login',
      iss: 'From Server',
      _id,
      name,
      email,
      // role,
    };

    const refresh_token = this.createRefreshToken(payload);

    // // update user with refresh token
    await this.usersService.updateUserToken(refresh_token, _id);

    // //...

    // console.log(
    //   "this.configService.get<string>('JWT_REFRESH_EXPIRE')",
    //   this.configService.get<string>('JWT_REFRESH_EXPIRE'),
    // );

    // response.cookie('refresh_token', refresh_token, {
    //   httpOnly: true,
    //   maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')), //ms là chuyển sang miligiay
    // });
    // console.log('á', ms('2d'));

    return {
      access_token: this.jwtService.sign(payload),
      // refresh_token,
      users: {
        _id,
        name,
        email,
        // role,
        // permissions,
      },
    };
  }

  async register(registerUser: RegisterUserDto) {
    const user = await this.usersService.findOnebyUsername(registerUser.email);
    if (user) throw new BadRequestException('Người dùng đã tồn tại');

    return await this.usersService.registerUser(registerUser);
  }

  createRefreshToken = (payload: any) => {
    const refresh_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRE'),
    });
    return refresh_token;
  };

  //userName / pass là 2 tham số thư viện passport ném về
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOnebyUsername(email);

    if (user) {
      const isValid = this.usersService.isValidPassword(pass, user.password);

      if (isValid) {
        // const userRole = user.role as unknown as { _id: string; name: string };
        // const temp = await this.roleService.findOne(userRole._id);

        const objUser = {
          ...user.toObject(),
          // permissions: temp?.permissions ?? [],
        };

        return objUser;
      }
    }

    return null;
  }

  // create(createAuthDto: CreateAuthDto) {
  //   return 'This action adds a new auth';
  // }
  // findAll() {
  //   return `This action returns all auth`;
  // }
  // findOne(id: number) {
  //   return `This action returns a #${id} auth`;
  // }
  // update(id: number, updateAuthDto: UpdateAuthDto) {
  //   return `This action updates a #${id} auth`;
  // }
  // remove(id: number) {
  //   return `This action removes a #${id} auth`;
  // }
}
