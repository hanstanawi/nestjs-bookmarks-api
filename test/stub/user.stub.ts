import { SignupDto } from 'src/auth/dto';

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
