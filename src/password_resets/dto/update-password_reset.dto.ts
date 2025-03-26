import { PartialType } from '@nestjs/swagger';
import { CreatePasswordResetDto } from './create-password_reset.dto';

export class UpdatePasswordResetDto extends PartialType(CreatePasswordResetDto) {}
