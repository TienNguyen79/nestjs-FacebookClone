import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
} from '@nestjs/common';
import {
  Public,
  ResponseMessage,
  User as UserDecorator,
} from 'src/decorator/customize';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { generateRandomNumbers } from 'utils/function';
import { IUser } from 'src/users/users.interface';
import {
  PasswordReset,
  PasswordResetDocument,
} from 'src/password_resets/schema/password_reset.schema';

@Controller('mail')
export class MailController {
  constructor(
    private readonly mailerService: MailerService,

    @InjectModel(User.name)
    private userModel: SoftDeleteModel<UserDocument>,

    @InjectModel(PasswordReset.name)
    private passwordResetModel: SoftDeleteModel<PasswordResetDocument>,
  ) {}

  @Post('/getOTP')
  @Public()
  @ResponseMessage('Test email')
  // @Cron('0 10 0 * * 0') // 0h10p am every Sunday
  async handleTestEmail(@Body() body: { email: string }) {
    const { email } = body;

    // Tạo mã code mới
    const randomCode = generateRandomNumbers(6);
    console.log(
      '🚀 ~ MailController ~ handleTestEmail ~ randomCode:',
      randomCode,
    );

    // Tìm user, nếu không có thì tạo mới
    const user = await this.userModel.findOne({ email: email });

    if (user) {
      // Cập nhật hoặc tạo mới reset code
      const results = await this.passwordResetModel.findOneAndUpdate(
        { user: user._id },
        { code: Number(randomCode) },
        { new: true, upsert: true }, // Cập nhật nếu có, tạo mới nếu chưa có
      );

      if (results) {
        const sendMail = await this.mailerService.sendMail({
          to: 'nguyenmanhtien2002bl@gmail.com',
          from: '"Support Team" <support@example.com>',
          subject: 'Xác Thực Tài Khoản',
          // html: '<b>Mã xác thực của bạn là : 56789</b>', // HTML body content
          template: 'code',
          context: {
            name: user.name,
            code: Number(randomCode),
          },
        });
        if (sendMail) {
          return {
            message: 'Gửi email thành công ! Vui lòng check email của bạn.',
            email,
            code: Number(randomCode),
          };
        }
      }
    } else {
      throw new NotFoundException('Email không tồn tại');
    }

    // const sendMail = await this.mailerService.sendMail({
    //   to: 'nguyenmanhtien2002bl@gmail.com',
    //   from: '"Support Team" <support@example.com>',
    //   subject: 'Xác Thực Tài Khoản',
    //   html: '<b>Mã xác thực của bạn là : 56789</b>', // HTML body content
    //   // template: 'job',
    //   // context: {
    //   //   receiver: subs.name,
    //   //   jobs: jobs,
    //   // },
    // });

    // if (sendMail) {
    //   return { message: 'Gửi mail thành công', email: email };
    // } else {
    //   throw new BadRequestException('Gửi mail thất bại');
    // }
  }
}
