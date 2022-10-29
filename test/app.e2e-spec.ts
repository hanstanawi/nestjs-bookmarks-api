import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';

import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import { userStub, userWithNameStub } from './stub';

const BASE_URL = 'http://localhost:3000/api/v1';

describe('App e2e test', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    await app.listen(3000);
    pactum.request.setBaseUrl(BASE_URL);

    prisma = app.get(PrismaService);
    prisma.cleanDb();
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    describe('Signup', () => {
      it('should sign a new user up', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(userStub())
          .expectStatus(201)
          .expectBodyContains('access_token')
          .stores('userAccessToken', 'access_token');
      });

      it('should throw 400 exception if no email provided', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ password: '' })
          .expectStatus(400);
      });

      it('should throw 400 exception if no password provided', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ email: userStub().email })
          .expectStatus(400);
      });

      it('should throw 400 exception if no email and password provided', () => {
        return pactum.spec().post('/auth/signup').expectStatus(400);
      });

      it('should sign user up with first and last name', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(userWithNameStub())
          .expectStatus(201)
          .stores('userWithNameAccessToken', 'access_token');
      });
    });

    describe('Login', () => {
      it('should log user in', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody(userStub())
          .expectStatus(200)
          .expectBodyContains('access_token');
      });

      it('throw 400 exception, if no email provided', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({ password: '123' })
          .expectStatus(400);
      });

      it('throw 400 exception, if no password provided', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({ email: 'hanstanawi@gmail.com' })
          .expectStatus(400);
      });

      it('should throw 404 not found exception, if user not found', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({
            email: 'randomemail@gmail.com',
            password: '123',
          })
          .expectStatus(404);
      });

      it('should throw 403 unknown credential exception, if password invalid', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({
            email: 'hanstanawi@gmail.com',
            password: 'wrongpassword',
          })
          .expectStatus(403);
      });
    });
  });

  describe('User', () => {
    describe('Get me', () => {
      it('should get user detail', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({ Authorization: 'Bearer $S{userAccessToken}' })
          .expectStatus(200)
          .expectJson('email', userStub().email)
          .expectJson('firstName', null)
          .expectJson('lastName', null);
      });

      it('should get user detail with name', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({ Authorization: 'Bearer $S{userWithNameAccessToken}' })
          .expectStatus(200)
          .expectJson('email', userWithNameStub().email)
          .expectJson('firstName', userWithNameStub().firstName)
          .expectJson('lastName', userWithNameStub().lastName)
          .inspect();
      });

      it('should throw 401 forbidden error if access token is not valid', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({ Authorization: 'Bearer ey23asdasdasdqweqsad' })
          .expectStatus(401);
      });

      it('should throw 401 forbidden error if authorization header is not defined', () => {
        return pactum.spec().get('/users/me').expectStatus(401);
      });
    });

    describe('Edit user', () => {
      const updateUserStub = () => {
        return {
          email: 'test@test.com',
          firstName: 'Hans',
          lastName: 'Test',
        };
      };

      it('should update user', () => {
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({ Authorization: 'Bearer $S{userAccessToken}' })
          .withBody(updateUserStub())
          .expectStatus(200)
          .expectJson('email', updateUserStub().email)
          .expectJson('firstName', updateUserStub().firstName)
          .expectJson('lastName', updateUserStub().lastName)
          .inspect();
      });

      it('should throw 401 forbidden error, if token is invalid', () => {
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({ Authorization: 'Bearer ey23asdasdasdqweqsad' })
          .withBody(updateUserStub())
          .expectStatus(401);
      });
    });
  });

  describe('Bookmarks', () => {
    describe('Get bookmarks', () => {});
    describe('Get bookmark by id', () => {});
    describe('Create bookmark', () => {});
    describe('Edit bookmark', () => {});
    describe('Delete bookmark', () => {});
  });
});
