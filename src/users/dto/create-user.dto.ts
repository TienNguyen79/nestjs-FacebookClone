import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Name không được để trống' })
  name: string;

  @IsEmail({ message: 'Email không đúng định dạng' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @IsNotEmpty({ message: 'Password không được để trống' })
  @IsString()
  @MinLength(6, { message: 'Password phải có ít nhất 6 ký tự' })
  @MaxLength(30, { message: 'Password không được quá 30 ký tự' })
  password: string;

  @IsNotEmpty({ message: 'Ngày sinh không được để trống' })
  birthday: Date;

  @IsNotEmpty({ message: 'Gender không được để trống' })
  gender: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsNumber()
  age?: number;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  role?: string;
}

export class RegisterUserDto {
  @IsNotEmpty({ message: 'Name không được để trống' })
  name: string;

  @IsEmail({ message: 'Email không đúng định dạng' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @IsNotEmpty({ message: 'Password không được để trống' })
  @IsString()
  @MinLength(6, { message: 'Password phải có ít nhất 6 ký tự' })
  @MaxLength(30, { message: 'Password không được quá 30 ký tự' })
  password: string;

  @IsNotEmpty({ message: 'Ngày sinh không được để trống' })
  birthday: Date;

  @IsNotEmpty({ message: 'Gender không được để trống' })
  gender: number;
}

export class LoginUserDto {
  @IsNotEmpty({ message: 'Name không được để trống' })
  name: string;

  @IsEmail({ message: 'Email không đúng định dạng' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;
}

export class ResetPasswordDto {
  @IsNotEmpty({ message: 'Password không được để trống' })
  @IsString()
  @MinLength(6, { message: 'Password phải có ít nhất 6 ký tự' })
  @MaxLength(30, { message: 'Password không được quá 30 ký tự' })
  password: string;

  @IsNotEmpty({ message: 'Confirm Password không được để trống' })
  @IsString()
  @MinLength(6, { message: 'Confirm Password phải có ít nhất 6 ký tự' })
  @MaxLength(30, { message: 'Confirm Password không được quá 30 ký tự' })
  confirmPassword: string;

  @IsNotEmpty({ message: 'Code không được để trống' })
  @IsNumberString({ message: 'Code phải là 6 chữ số' })
  @Matches(/^\d{6}$/, { message: 'Code phải gồm đúng 6 chữ số' })
  code: string;

  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;
}

export class ChangePasswordDto {
  @IsNotEmpty({ message: 'currentPassword không được để trống' })
  @IsString()
  @MinLength(6, { message: 'currentPassword phải có ít nhất 6 ký tự' })
  @MaxLength(30, { message: 'currentPassword không được quá 30 ký tự' })
  currentPassword: string;

  @IsNotEmpty({ message: 'newPassword không được để trống' })
  @IsString()
  @MinLength(6, { message: 'newPassword phải có ít nhất 6 ký tự' })
  @MaxLength(30, { message: 'newPassword không được quá 30 ký tự' })
  newPassword: string;

  @IsNotEmpty({ message: 'confirmNewPassword không được để trống' })
  @IsString()
  @MinLength(6, { message: 'confirmNewPassword phải có ít nhất 6 ký tự' })
  @MaxLength(30, { message: 'confirmNewPassword không được quá 30 ký tự' })
  confirmNewPassword: string;
}
