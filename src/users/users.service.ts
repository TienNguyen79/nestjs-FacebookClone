import { BadRequestException, Injectable } from '@nestjs/common';
import {
  CreateUserDto,
  RegisterUserDto,
  ResetPasswordDto,
} from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';
import { GENDER_TYPES, ROLE_TYPES } from 'utils/common';
import {
  PasswordReset,
  PasswordResetDocument,
} from 'src/password_resets/schema/password_reset.schema';
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
    @InjectModel(PasswordReset.name)
    private passwordResetModel: SoftDeleteModel<PasswordResetDocument>,
  ) {} // User.name ở bên file module

  getHashPassword = (password: string) => {
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);
    return hash;
  };

  async create(createUserDto: CreateUserDto) {
    const user = await this.userModel.create({
      ...createUserDto,
    });
    return { user, createdAt: user.createdAt };
  }

  async resetPassword(body: ResetPasswordDto) {
    const { password, confirmPassword, code, email } = body;

    const findUserByEmail = await this.userModel.findOne({ email });

    if (!findUserByEmail) {
      throw new BadRequestException('Email không tồn tại');
    }

    const findPasswordReset = await this.passwordResetModel.findOne({
      code: Number(code),
      user: findUserByEmail._id,
    });

    if (!findPasswordReset) {
      throw new BadRequestException(
        'Reset không thành công - mã code không hợp lệ',
      );
    }

    // Kiểm tra thời gian tạo mã code
    const createdAt = findPasswordReset.createdAt;
    const currentTime = new Date();
    const diffInSeconds = (currentTime.getTime() - createdAt.getTime()) / 1000;

    if (diffInSeconds > 60) {
      // Xóa mã code nếu đã quá 60 giây
      await this.passwordResetModel.deleteOne({ user: findUserByEmail._id });
      throw new BadRequestException('Mã code đã hết hạn, vui lòng yêu cầu lại');
    }

    // Kiểm tra xác nhận mật khẩu
    if (confirmPassword !== password) {
      throw new BadRequestException('Xác nhận mật khẩu phải khớp với mật khẩu');
    }

    // Mã hóa mật khẩu mới
    const passwordHash = this.getHashPassword(password);

    // Cập nhật mật khẩu
    const updatePass = await this.userModel.updateOne(
      { _id: findUserByEmail._id },
      { password: passwordHash },
    );

    if (updatePass.modifiedCount > 0) {
      // Xóa mã code sau khi đặt lại mật khẩu thành công
      await this.passwordResetModel.deleteOne({ user: findUserByEmail._id });
      return 'Đặt lại mật khẩu thành công';
    } else {
      throw new BadRequestException('Đặt lại mật khẩu thất bại');
    }
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  findOnebyUsername(userName: string) {
    return this.userModel.findOne({ email: userName });
    // .populate({
    //   path: 'role',
    //   select: { name: 1 },
    // });
  }

  isValidPassword(password: string, hash: string) {
    return compareSync(password, hash);
  }

  updateUserToken = async (refreshToken: string, _id: string) => {
    return await this.userModel.updateOne({ _id }, { refreshToken });
  };

  findUserByToken = async (refreshToken: string) => {
    return await this.userModel
      .findOne({ refreshToken })
      .populate({
        path: 'role',
        select: { name: 1 },
      })
      .lean(); // Chuyển Mongoose Document về Object thuần;
  };

  async registerUser(registerUser: RegisterUserDto) {
    const { password, gender } = registerUser;

    const hashPassword = this.getHashPassword(password);

    const checkGender = Object.values(GENDER_TYPES).includes(Number(gender));

    if (!checkGender) {
      throw new BadRequestException(
        `Gender phải là 1 trong các giá trị: ${Object.values(GENDER_TYPES).join(', ')}`,
      );
    }

    // const userRole = await this.roleModel.findOne({ name: USER_ROLE });

    const user = await this.userModel.create({
      ...registerUser,
      role: ROLE_TYPES.USER,
      refreshToken: '',
      password: hashPassword,
    });
    return { _id: user?._id, createdAt: user?.createdAt };
  }
}
