import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';
import { GENDER_TYPES, ROLE_TYPES } from 'utils/common';
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
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
