import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Role, RoleDocument } from './schemas/role.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { ROLE_TYPES } from 'utils/common';
import { IUser } from 'src/users/users.interface';
import mongoose from 'mongoose';
@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role.name)
    private roleModel: SoftDeleteModel<RoleDocument>,
  ) {}

  async create(createRoleDto: CreateRoleDto) {
    const { name, description } = createRoleDto;

    const roleArray = Object.values(ROLE_TYPES);

    if (!roleArray.includes(name)) {
      throw new BadRequestException(
        `Name phải là 1 trong các giá trị: ${roleArray.join(', ')}`,
      );
    }
    const isExist = await this.roleModel.findOne({ name: name });
    if (isExist) {
      throw new BadRequestException(`Name: ${name} đã tồn tại`);
    }

    const role = await this.roleModel.create({
      name,
      description,
    });

    return role;
  }

  async findAll(query: Tpaginate<{ name?: string }>) {
    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Number(query.limit) : 10;

    // Xóa các tham số phân trang khỏi query để dùng cho bộ lọc
    delete query.page;
    delete query.limit;

    // Xây dựng bộ lọc MongoDB từ query params
    const filter: Record<string, any> = {};
    for (const key in query) {
      if (query[key]) {
        filter[key] = { $regex: query[key], $options: 'i' }; // Tìm kiếm không phân biệt hoa thường
      }
    }

    // Tìm kiếm dữ liệu với bộ lọc và phân trang
    const results = await this.roleModel
      .find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    // Tổng số bản ghi (để client tính tổng số trang)
    console.log('🚀 ~ RolesService ~ findAll ~ filter:', filter);
    const total = await this.roleModel.countDocuments(filter).exec();

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
    return await this.roleModel.findById(id).exec();
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    if (!mongoose.Types.ObjectId.isValid(id)) return 'id không hợp lệ';

    const { name, description } = updateRoleDto;

    const isRole = await this.roleModel.findById(id);
    if (!isRole) {
      throw new BadRequestException(`Role không tồn tại`);
    }

    const roleArray = Object.values(ROLE_TYPES);

    if (!roleArray.includes(name)) {
      throw new BadRequestException(
        `Name phải là 1 trong các giá trị: ${roleArray.join(', ')}`,
      );
    }
    const isExist = await this.roleModel.findOne({
      name: name,
      _id: { $ne: id }, // tìm name nhưng ngoài trừ id hiện tại
    });
    if (isExist) {
      throw new BadRequestException(`Name: ${name} đã tồn tại`);
    }

    const role = await this.roleModel.updateOne(
      { _id: id },
      {
        name,
        description,
      },
    );

    if (!role) {
      throw new BadRequestException(`Cập nhật không thành công`);
    }

    return 'Cập nhật Role thành công';
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) return 'id không hợp lệ';

    const isRole = await this.roleModel.findById(id);
    if (!isRole) {
      throw new BadRequestException(`Role không tồn tại`);
    }

    if (isRole.name === ROLE_TYPES.ADMIN) {
      throw new BadRequestException('Không thể xóa role ADMIN');
    }

    await this.roleModel.updateOne(
      { _id: id },
      {
        deletedBy: { _id: user._id, email: user.email },
      },
    );

    const results = this.roleModel.softDelete({
      _id: id,
    });

    if (!results) {
      throw new BadRequestException(`Xóa Role không thành công`);
    }
    return 'Xóa Role thành công';
  }
}
