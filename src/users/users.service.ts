import { Injectable } from '@nestjs/common';
import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';
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

  async registerUser(registerUser: RegisterUserDto) {
    const { password } = registerUser;

    const hashPassword = this.getHashPassword(password);
    console.log(
      '🚀 ~ UsersService ~ registerUser ~ hashPassword:',
      hashPassword,
    );

    // const userRole = await this.roleModel.findOne({ name: USER_ROLE });

    const user = await this.userModel.create({
      ...registerUser,
      // role: userRole._id,
      password: hashPassword,
    });
    return { _id: user?._id, createdAt: user?.createdAt };
  }
}
