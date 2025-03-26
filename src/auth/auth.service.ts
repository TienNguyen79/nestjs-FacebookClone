import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { IUser } from 'src/users/users.interface';
import { UsersService } from 'src/users/users.service';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import ms = require('ms');
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    // private roleService: RolesService,
  ) {}

  async login(user: IUser, response: Response) {
    const { _id, email, name, role } = user;

    const { password, refreshToken, ...dataUserOther } = user; // lưu vào JWT thông tin trừ password và refreshToken

    const payload = {
      sub: 'Token Login',
      iss: 'From Server',
      ...dataUserOther,
    };

    const refresh_token = this.createRefreshToken(payload);

    // // update user with refresh token
    await this.usersService.updateUserToken(refresh_token, _id);

    const JWT_REFRESH_EXPIRE =
      this.configService.get<string>('JWT_REFRESH_EXPIRE');

    response.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      maxAge: ms(JWT_REFRESH_EXPIRE), //ms là chuyển sang miligiay
    });

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token,
      users: {
        _id,
        name,
        email,
        role,
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

  processNewToken = async (refreshToken: string, response: Response) => {
    try {
      const user = await this.usersService.findUserByToken(refreshToken);

      if (user) {
        const { _id, email, name, role } = user;
        // const plainUser = JSON.parse(JSON.stringify(user));

        const { password, refreshToken, ...dataUserOther } = user;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const payload = {
          sub: 'refresh token',
          iss: 'From Server',
          ...dataUserOther,
        };

        const refresh_token = this.createRefreshToken(payload);

        //  xóa cookie trước

        response.clearCookie('refresh_token');

        // update user with refresh token
        await this.usersService.updateUserToken(refresh_token, _id.toString());

        // const userRole = user.role as unknown as { _id: string; name: string };
        // const temp = await this.roleService.findOne(userRole._id);

        //...
        response.cookie('refresh_token', refresh_token, {
          httpOnly: true,
          maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')),
        });

        return {
          access_token: this.jwtService.sign(payload),
          refresh_token,
          users: {
            _id,
            name,
            email,
            role,
            // permissions: temp?.permissions ?? [],
          },
        };
      } else {
        throw new BadRequestException(
          'Refresh Token không hợp lệ vui lòng login',
        );
      }
    } catch (error) {
      throw new BadRequestException(
        'Refresh Token không hợp lệ vui lòng login',
      );
    }
  };

  logOut = async (refreshToken: string, response: Response) => {
    const user = await this.usersService.findUserByToken(refreshToken);
    if (user) {
      response.clearCookie('refresh_token');

      await this.usersService.updateUserToken('', user._id.toString());
      return 'Logged Out';
    } else {
      throw new BadRequestException(
        'Refresh Token không hợp lệ vui lòng login',
      );
    }
  };
}
