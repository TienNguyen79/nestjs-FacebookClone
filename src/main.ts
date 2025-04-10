import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { Reflector } from '@nestjs/core';
import { TransformInterceptor } from './core/transform.interceptor';
import { RolesGuard } from './roles/role.guard';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  app.useStaticAssets(join(__dirname, '..', 'public')); // js, css, image
  app.setBaseViewsDir(join(__dirname, '..', 'views')); //view
  app.setViewEngine('ejs');

  // guard: kiểu như middleware global và nó sẽ bắt hết những api nào chưa có token
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector), new RolesGuard(reflector));
  app.useGlobalInterceptors(new TransformInterceptor(reflector));

  // có cái pipes này thì mới hiển thị lỗi của classvalidator được, nếu không sẽ hiển thị lỗi mặc định của nestjs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Bỏ qua các field không có trong DTO
      forbidNonWhitelisted: true, // Trả lỗi nếu có field không hợp lệ
      transform: true, // Tự động chuyển đổi kiểu dữ liệu
    }),
  );

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: ['1', '2'],
  });

  app.use(cookieParser());

  // config cors
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // config swagger
  const config = new DocumentBuilder()
    .setTitle('NestJS FacebookClone web API -NMT79')
    .setDescription('The cats API description')
    .setVersion('1.0')
    // .addTag('cats')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'Bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
      'token',
    )
    .addSecurityRequirements('token')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory, {
    swaggerOptions: { persistAuthorization: true }, // khi có token trong khóa rồi, load lại trang không bị mất
  });

  await app.listen(configService.get<string>('PORT'));
}
bootstrap();
