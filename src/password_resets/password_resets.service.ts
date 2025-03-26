import { Injectable } from '@nestjs/common';
import { CreatePasswordResetDto } from './dto/create-password_reset.dto';
import { UpdatePasswordResetDto } from './dto/update-password_reset.dto';

@Injectable()
export class PasswordResetsService {
  create(createPasswordResetDto: CreatePasswordResetDto) {
    return 'This action adds a new passwordReset';
  }

  findAll() {
    return `This action returns all passwordResets`;
  }

  findOne(id: number) {
    return `This action returns a #${id} passwordReset`;
  }

  update(id: number, updatePasswordResetDto: UpdatePasswordResetDto) {
    return `This action updates a #${id} passwordReset`;
  }

  remove(id: number) {
    return `This action removes a #${id} passwordReset`;
  }
}
