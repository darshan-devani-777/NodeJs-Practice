import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { AppModule } from './../src/app.module';
import { ResponseInterceptor } from './../src/common/interceptors/response.interceptor';
import { AllExceptionsFilter } from './../src/common/interceptors/all-exception.filter';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.use(cookieParser());
    app.use(
      session({
        secret: process.env.SESSION_SECRET ?? 'dev_secret',
        resave: false,
        saveUninitialized: false,
        cookie: {
          httpOnly: true,
          maxAge: 1000 * 60 * 60,
          secure: process.env.NODE_ENV === 'production',
        },
      }),
    );

    app.setGlobalPrefix('api', { exclude: [''] });
    app.useGlobalInterceptors(new ResponseInterceptor());
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual({
          success: true,
          message: 'Welcome to Nest Services 🚀',
          data: null,
        });
      });
  });
});
