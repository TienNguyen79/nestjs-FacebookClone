import {
  IsEmail,
  IsNotEmpty,
  IsNumberString,
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

  avatar: string;

  phoneNumber: number;

  bio: string;

  age: number;

  address: string;
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
