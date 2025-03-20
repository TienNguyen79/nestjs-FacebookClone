import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Name không được để trống' })
  name: string;

  @IsEmail({ message: 'Email không đúng định dạng' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @IsNotEmpty({ message: 'Password không được để trống' })
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
