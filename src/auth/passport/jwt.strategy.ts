import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  // decode giải mã token
  constructor(
    private configService: ConfigService,
    // private roleService: RolesService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // giải mã token ở header
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESSS_TOKEN_SECRET'),
    });
  }

  // chắc dùng cho trường hợp giải mã token và lấy được data từ token
  async validate(payload: any) {
    // const { _id, email, name, role } = payload; payload chính là dữ liệu đã được mã hóa trong JWT khi bạn tạo token. dùng cho cái muốn lấy hết thông tin user từ token

    // cần gán thêm permissions vào req.user
    // const userRole = role as unknown as { _id: string; name: string };
    // const temp = (await this.roleService.findOne(userRole._id)).toObject();

    return {
      ...payload,
      // permissions: temp?.permissions ?? [],
    };
  }
}
