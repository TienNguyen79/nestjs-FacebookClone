import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { IS_PUBLIC_KEY, IS_PUBLIC_PERMISSION } from 'src/decorator/customize';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  // nếu thêm decorator Public thì sẽ không cần phải check token
  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }

  // khi validate trong jwt.strategy pass thì chạy vào đây và trả ra user
  handleRequest(err, user, info, context: ExecutionContext) {
    // const request: Request = context.switchToHttp().getRequest();

    // const isSkipPermission = this.reflector.getAllAndOverride<boolean>(
    //   IS_PUBLIC_PERMISSION,
    //   [context.getHandler(), context.getClass()],
    // );

    // user lấy kết quả từ jwt của thằng passport
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      throw (
        err ||
        new UnauthorizedException(
          'Token không hợp lệ hoặc không có bearer Token trong header',
        )
      );
    }

    // check quyền theo pathApi và phương thức
    // const targetMethod = request.method;
    // const targetEndPoint = request.route?.path as string;

    // const permissions = user?.permissions ?? [];

    // let isExist = permissions.find(
    //   (permission) =>
    //     permission.method === targetMethod &&
    //     permission.apiPath === targetEndPoint,
    // );

    // if (targetEndPoint.startsWith('/api/v1/auth')) isExist = true;
    // if (!isExist && !isSkipPermission) {
    //   throw new ForbiddenException('Bạn không có quyền truy cập endPoint này');
    // }
    return user;
  }
}
