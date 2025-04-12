import { BadRequestException, Injectable } from '@nestjs/common';
import {
  ChangePasswordDto,
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
import { IUser } from './users.interface';
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

  async create<T>(createUserDto: CreateUserDto | T) {
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

  // CRUD users
  async findAll(
    query: Tpaginate<{
      name?: string;
      email?: string;
      birthday?: string;
      gender?: number;
    }>,
  ) {
    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Number(query.limit) : 10;

    // Xóa các tham số phân trang khỏi query để dùng cho bộ lọc
    delete query.page;
    delete query.limit;

    // // Xây dựng bộ lọc MongoDB từ query params
    // const filter: Record<string, any> = {};
    // for (const key in query) {
    //   if (query[key]) {
    //     filter[key] = { $regex: query[key], $options: 'i' }; // Tìm kiếm không phân biệt hoa thường
    //   }
    // }

    // Tạo filter rõ ràng theo từng trường
    const filter: Record<string, any> = {};

    // Lọc theo name (string)
    if (query.name) {
      filter.name = { $regex: query.name, $options: 'i' };
    }

    // Lọc theo email (string)
    if (query.email) {
      filter.email = { $regex: query.email, $options: 'i' };
    }

    // Lọc theo birthday (exact date string)
    if (query.birthday) {
      // Nếu bạn lưu birthday theo định dạng ISO (yyyy-mm-dd), thì so sánh trực tiếp string là được
      filter.birthday = query.birthday;
    }

    // Lọc theo gender (exact string)
    if (query.gender) {
      filter.gender = query.gender;
    }

    // Tìm kiếm dữ liệu với bộ lọc và phân trang
    const results = await this.userModel
      .find(filter)
      .select(['-password', '-refreshToken']) // Bỏ qua trường password
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    // Tổng số bản ghi (để client tính tổng số trang)
    const total = await this.userModel.countDocuments(filter).exec();

    return {
      results,
      meta: {
        page,
        limit,
        totalResult: total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    return await this.userModel
      .findById(id)
      .select(['-password', '-refreshToken'])
      .exec();
  }

  async createUser<T>(createUserDto: CreateUserDto | T, currentUser: IUser) {
    const { password, gender, role } = createUserDto as any;

    const hashPassword = this.getHashPassword(password);

    const checkGender = Object.values(GENDER_TYPES).includes(Number(gender));
    const checkRole = Object.values(ROLE_TYPES).includes(role);

    if (!checkGender) {
      throw new BadRequestException(
        `Gender phải là 1 trong các giá trị: ${Object.values(GENDER_TYPES).join(', ')}`,
      );
    }

    if (!checkRole) {
      throw new BadRequestException(
        `Role phải là 1 trong các giá trị: ${Object.values(ROLE_TYPES).join(', ')}`,
      );
    }

    const user = await this.userModel.create({
      ...createUserDto,
      password: hashPassword,
      createdBy: {
        _id: currentUser._id,
        email: currentUser.email,
      },
    });
    return { _id: user._id, createdAt: user.createdAt };
  }

  async update(id: string, updateUserDto: UpdateUserDto, currentUser: IUser) {
    const { gender, role } = updateUserDto as any;
    const checkGender = Object.values(GENDER_TYPES).includes(Number(gender));
    const checkRole = Object.values(ROLE_TYPES).includes(role);

    if (!checkGender) {
      throw new BadRequestException(
        `Gender phải là 1 trong các giá trị: ${Object.values(GENDER_TYPES).join(', ')}`,
      );
    }

    if (!checkRole) {
      throw new BadRequestException(
        `Role phải là 1 trong các giá trị: ${Object.values(ROLE_TYPES).join(', ')}`,
      );
    }

    const updateUser = await this.userModel.updateOne(
      { _id: id },
      {
        ...updateUserDto,
        updatedBy: { _id: currentUser._id, email: currentUser.email },
      },
    );
    return updateUser;
  }

  async remove(id: string, currentUser: IUser) {
    const foundUser = await this.userModel.findById(id);
    if (foundUser && foundUser.email === 'admin@gmail.com') {
      throw new BadRequestException('Không thể xóa tài khoản admin@gmail.com');
    }
    const result = await this.userModel.updateOne(
      { _id: id },
      { deletedBy: { _id: currentUser._id, email: currentUser.email } },
    );

    if (!result) return 'user not found';
    return this.userModel.softDelete({ _id: id });
  }

  async changePassword(
    id: string,
    body: ChangePasswordDto,
    currentUser: IUser,
  ) {
    const { currentPassword, newPassword, confirmNewPassword } = body;

    const foundUser = await this.userModel.findById(id);

    if (!foundUser) {
      throw new BadRequestException('Người dùng không tồn tại');
    }

    const isValid = this.isValidPassword(currentPassword, foundUser.password);

    if (!isValid) {
      throw new BadRequestException('Mật khẩu hiện tại không đúng');
    }

    if (newPassword !== confirmNewPassword) {
      throw new BadRequestException('Mật khẩu mới không khớp');
    }
    const hashPassword = this.getHashPassword(newPassword);
    const updateUser = await this.userModel.updateOne(
      { _id: id },
      {
        password: hashPassword,
        updatedBy: { _id: currentUser._id, email: currentUser.email },
      },
    );
    if (updateUser.modifiedCount > 0) {
      return 'Cập nhật mật khẩu thành công';
    } else {
      throw new BadRequestException('Cập nhật mật khẩu thất bại');
    }
  }
}
