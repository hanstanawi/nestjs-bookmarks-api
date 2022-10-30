import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';

import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import {
  updateUserStub,
  userStub,
  userWithNameStub,
  bookmarkStub,
} from './stub';

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
          .stores('userAccessToken', 'access_token')
          .stores('userId', 'id');
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
          .expectJson('lastName', userWithNameStub().lastName);
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
      it('should update user', () => {
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({ Authorization: 'Bearer $S{userAccessToken}' })
          .withBody(updateUserStub())
          .expectStatus(200)
          .expectJson('email', updateUserStub().email)
          .expectJson('firstName', updateUserStub().firstName)
          .expectJson('lastName', updateUserStub().lastName);
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

  describe('Bookmark', () => {
    describe('Get empty bookmarks', () => {
      it('should get empty bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({ Authorization: 'Bearer $S{userAccessToken}' })
          .expectStatus(200)
          .expectJsonLength(0);
      });

      it('should throw unauthorized exception, if no authorization header set', () => {
        return pactum.spec().get('/bookmarks').expectStatus(401);
      });
    });

    describe('Create bookmark', () => {
      it('should create a new bookmark', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({ Authorization: 'Bearer $S{userAccessToken}' })
          .withBody(bookmarkStub())
          .expectStatus(201)
          .expectJson('title', bookmarkStub().title)
          .expectJson('description', bookmarkStub().description)
          .expectJson('link', bookmarkStub().link)
          .stores('bookmarkId', 'id');
      });

      it('should return bad request exception, if link is not valid url', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({ Authorization: 'Bearer $S{userAccessToken}' })
          .withBody({ title: 'NestJS tutorial', link: 'someurl' })
          .expectStatus(400);
      });

      it('should return bad request exception, if title is missing', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({ Authorization: 'Bearer $S{userAccessToken}' })
          .withBody({
            description: 'some description',
            link: 'https://www.youtube.com/watch?v=GHTA143_b-s&t=12165s',
          })
          .expectStatus(400);
      });
    });

    describe('Get bookmarks', () => {
      it('should get array of bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({ Authorization: 'Bearer $S{userAccessToken}' })
          .expectStatus(200)
          .expectJsonLength(1)
          .expectJson('[0].id', '$S{bookmarkId}');
      });
    });

    describe('Get bookmark by id', () => {
      it('should get single bookmark by id', () => {
        return pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({ Authorization: 'Bearer $S{userAccessToken}' })
          .expectStatus(200)
          .expectJson('id', '$S{bookmarkId}')
          .expectJson('title', bookmarkStub().title)
          .expectJson('description', bookmarkStub().description)
          .expectJson('link', bookmarkStub().link);
      });
    });

    describe('Update bookmark', () => {
      it('should update the bookmark', () => {
        return pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({ Authorization: 'Bearer $S{userAccessToken}' })
          .withBody({
            title: 'NestJS Tutorial Update',
            description: 'NestJS tutorial build REST API',
          })
          .expectStatus(200)
          .expectJson('id', '$S{bookmarkId}')
          .expectJson('title', 'NestJS Tutorial Update')
          .expectJson('description', 'NestJS tutorial build REST API')
          .expectJson('link', bookmarkStub().link);
      });
    });

    describe('Delete bookmark', () => {
      it('should update the bookmark', () => {
        return pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({ Authorization: 'Bearer $S{userAccessToken}' })
          .expectStatus(204);
      });

      it('should get empty array of bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({ Authorization: 'Bearer $S{userAccessToken}' })
          .expectStatus(200)
          .expectJsonLength(0);
      });
    });
  });
});
