import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import { SignupDto } from '../src/auth/dto';

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
    const dto: SignupDto = {
      email: 'hanstanawi@gmail.com',
      password: '123',
    };

    describe('Signup', () => {
      it('should sign a new user up', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201)
          .expectBodyContains('access_token')
          .inspect();
      });

      it('should throw 400 exception if no email provided', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ password: '' })
          .expectStatus(400)
          .inspect();
      });

      it('should throw 400 exception if no password provided', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ email: dto.email })
          .expectStatus(400)
          .inspect();
      });

      it('should throw 400 exception if no email and password provided', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({})
          .expectStatus(400)
          .inspect();
      });
    });

    describe('Login', () => {
      it('should log user in', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains('access_token')
          .inspect();
      });

      it('throw 400 exception, if no email provided', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({ password: '123' })
          .expectStatus(400)
          .inspect();
      });

      it('throw 400 exception, if no password provided', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({ email: 'hanstanawi@gmail.com' })
          .expectStatus(400)
          .inspect();
      });

      it('should throw 404 not found exception, if user not found', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({
            email: 'randomemail@gmail.com',
            password: '123',
          })
          .expectStatus(404)
          .inspect();
      });

      it('should throw 403 unknown credential exception, if password invalid', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({
            email: 'hanstanawi@gmail.com',
            password: 'wrongpassword',
          })
          .expectStatus(403)
          .inspect();
      });
    });
  });

  describe('User', () => {
    describe('Get me', () => {});
    describe('Edit user', () => {});
  });
  describe('Bookmarks', () => {
    describe('Get bookmarks', () => {});
    describe('Get bookmark by id', () => {});
    describe('Create bookmark', () => {});
    describe('Edit bookmark', () => {});
    describe('Delete bookmark', () => {});
  });
});
