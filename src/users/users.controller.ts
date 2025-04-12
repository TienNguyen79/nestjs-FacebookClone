import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ChangePasswordDto,
  CreateUserDto,
  ResetPasswordDto,
} from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { ParseObjectIdPipe } from 'src/core/parse-object-id.pipe';
import { IUser } from './users.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @User() currentUser: IUser,
  ) {
    // Kiểm tra xem người dùng đã tồn tại chưa

    const existingUser = await this.usersService.findOnebyUsername(
      createUserDto.email,
    );
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    return this.usersService.createUser(createUserDto, currentUser);
  }

  @Public()
  @ResponseMessage('Reset Password')
  @Patch('/resetPassword')
  resetPassword(
    @Body()
    body: ResetPasswordDto,
  ) {
    return this.usersService.resetPassword(body);
  }

  @Get()
  @ResponseMessage('Get all User')
  findAll(@Query() queryParams: Tpaginate<{ name?: string }>) {
    return this.usersService.findAll(queryParams);
  }

  @Get(':id')
  @ResponseMessage('Get a User')
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Update a User')
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @User() currentUser: IUser,
  ) {
    return this.usersService.update(id, updateUserDto, currentUser);
  }

  @Patch('/changePassword/:id')
  @ResponseMessage('Change Password a User')
  changePassword(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() body: ChangePasswordDto,
    @User() currentUser: IUser,
  ) {
    return this.usersService.changePassword(id, body, currentUser);
  }

  @Delete(':id')
  @ResponseMessage('Delete a User')
  remove(
    @Param('id', ParseObjectIdPipe) id: string,
    @User() currentUser: IUser,
  ) {
    return this.usersService.remove(id, currentUser);
  }
}
