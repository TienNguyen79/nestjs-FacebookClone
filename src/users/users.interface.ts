export interface IUser {
  _id: string;
  name: string;
  email: string;
  role?: string;
  birthday?: Date;
  bio?: string;
  age?: number;
  gender?: number;
  avatar?: string;
  phoneNumber?: number;
  password?: string;
  refreshToken?: string;
  // permissions?: {
  //   _id: string;
  //   name: string;
  //   apiPath: string;
  //   module: string;
  // }[];
}
