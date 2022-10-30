import { SignupDto } from 'src/auth/dto';
import { UpdateUserDto } from 'src/user/dto';

export const userStub = (): SignupDto => {
  return {
    email: 'hanstanawi@gmail.com',
    password: '123',
  };
};

export const userWithNameStub = (): SignupDto => {
  return {
    email: 'hans@gmail.com',
    password: '123',
    firstName: 'Hans',
    lastName: 'Tanawi',
  };
};

export const updateUserStub = (): UpdateUserDto => {
  return {
    email: 'test@test.com',
    firstName: 'Hans',
    lastName: 'Test',
  };
};
