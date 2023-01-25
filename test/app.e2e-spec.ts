import * as pactum from 'pactum';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Tables } from '../database/enums';
import { User, Wallet } from 'knex/types/tables';
import { Knex } from 'knex';
import { UserService } from '../src/user/user.service';
import { SignUpDto, SignInDto, AccessToken } from '../src/auth/dto/auth.dto';
import { AuthService } from '../src/auth/auth.service';

describe('App E2E', () => {
  const BASE_ENDPOINT = 'http://localhost:3333/api/v1';
  let app: INestApplication;
  let knex: Knex;
  let userService: UserService;
  let authService: AuthService;

  const AUTH_ENDPOINT = `${BASE_ENDPOINT}/auth`;

  const authDTO: SignInDto = {
    email: 'bookmark@bookmark.com',
    password: '#!bl4kJavaScrip7ra',
  };

  const userDTO: SignUpDto = {
    email: 'bookmark@bookmark.com',
    password: '#!bl4kJavaScrip7ra',
    first_name: 'test',
    last_name: 'user',
  };

  const cleanUserTable = (): Promise<void> => {
    return knex.table<User>(Tables.USER).delete();
  };

  const cleanWalleTable = (): Promise<void> => {
    return knex.table<Wallet>(Tables.WALLET).delete();
  };

  const signUp = async (
    userDetails: SignUpDto = userDTO,
  ): Promise<SignUpDto> => {
    await knex.table<User>(Tables.USER).insert(userDetails);
    return userDetails;
  };

  const signIn = async (
    authDetails: SignInDto = authDTO,
  ): Promise<AccessToken> => {
    return authService.signIn(authDetails);
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    userService = moduleRef.get<UserService>(UserService);
    knex = userService.knex;
    authService = app.get<AuthService>(AuthService);

    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    app.listen(3333);
  });

  afterAll(() => {
    cleanUserTable();
    cleanWalleTable();
    app.close();
  });

  describe('Auth', () => {
    afterAll(async () => {
      return await cleanUserTable();
    });

    describe('POST - signup', () => {
      const SIGN_UP_ENDPOINT = `${AUTH_ENDPOINT}/sign-up`;

      beforeEach(async () => {
        return await cleanUserTable();
      });

      it('+should successfully sign up without first and last names', async () => {
        return pactum
          .spec()
          .post(SIGN_UP_ENDPOINT)
          .withBody({
            email: 'emerenkene@otajha.org',
            password: '#!bl4kJavaScrip7ra',
          })
          .expectStatus(HttpStatus.CREATED)
          .expectBodyContains('id');
      });

      it('+should successfully sign up with first and last names', () => {
        return pactum
          .spec()
          .post(SIGN_UP_ENDPOINT)
          .withBody({
            email: 'emerenfffne@otajha.org',
            password: '#!bl4kJavaScrip7ra',
            first_name: 'test',
            last_name: 'passed',
          })
          .expectStatus(HttpStatus.CREATED)
          .expectBodyContains('id');
      });

      it('+should successfully sign up with first name only', () => {
        return pactum
          .spec()
          .post(SIGN_UP_ENDPOINT)
          .withBody({
            email: 'emauelsamuel@yahoo.com',
            password: '#!bl4kJavaScrip7ra',
            first_name: 'lendsqr',
          })
          .expectStatus(HttpStatus.CREATED)
          .expectBodyContains('id');
      });

      it('+should successfully sign up with last name only', () => {
        return pactum
          .spec()
          .post(SIGN_UP_ENDPOINT)
          .withBody({
            email: 'samuelemma@yahoo.com',
            password: '#!bl4kJavaScrip7ra',
            last_name: 'lendsqr',
          })
          .expectStatus(HttpStatus.CREATED)
          .expectBodyContains('id');
      });

      it('-should fail if password is not provided', () => {
        return pactum
          .spec()
          .post(SIGN_UP_ENDPOINT)
          .withBody({
            email: 'emauelsamuel@yahoo.com',
          })
          .expectStatus(HttpStatus.BAD_REQUEST);
      });

      it('-should fail if email is not provided', () => {
        return pactum
          .spec()
          .post(SIGN_UP_ENDPOINT)
          .withBody({
            password: '#!bl4kJavaScrip7ra',
          })
          .expectStatus(HttpStatus.BAD_REQUEST);
      });

      it('-should fail if credentials are not provided', () => {
        return pactum
          .spec()
          .post(SIGN_UP_ENDPOINT)
          .withBody({})
          .expectStatus(HttpStatus.BAD_REQUEST);
      });

      it('-should fail when invalid email is provided', () => {
        return pactum
          .spec()
          .post(SIGN_UP_ENDPOINT)
          .withBody({ email: 'failing', password: '#!bl4kJavaScrip7ra' })
          .expectStatus(HttpStatus.BAD_REQUEST);
      });

      it('+should fail due to short last name length', () => {
        return pactum
          .spec()
          .post(SIGN_UP_ENDPOINT)
          .withBody({
            email: 'emauelsamuel@yahoo.com',
            password: '#!bl4kJavaScrip7ra',
            last_name: 'qr',
            first_name: 'lends,',
          })
          .expectStatus(HttpStatus.BAD_REQUEST);
      });

      it('+should fail due to short first name length', () => {
        return pactum
          .spec()
          .post(SIGN_UP_ENDPOINT)
          .withBody({
            email: 'emauelsamuel@yahoo.com',
            password: '#!bl4kJavaScrip7ra',
            first_name: 'le',
            last_name: 'ndsqr',
          })
          .expectStatus(HttpStatus.BAD_REQUEST);
      });

      it('-should fail if the password is weak', () => {
        return pactum
          .spec()
          .post(SIGN_UP_ENDPOINT)
          .withBody({
            email: 'emauelsamuel@yahoo.com',
            password: 'weak',
          })
          .expectStatus(HttpStatus.BAD_REQUEST);
      });

      it('-should fail if another user exists with the provided email', async () => {
        const userDetails = await signUp();
        return pactum
          .spec()
          .post(SIGN_UP_ENDPOINT)
          .withBody(userDetails)
          .expectStatus(HttpStatus.CONFLICT);
      });
    });

    describe('POST - auth:sign-in', () => {
      const SIGN_IN_ENDPOINT = `${AUTH_ENDPOINT}/sign-in`;

      it('+should successfully sign-in', () => {
        return pactum
          .spec()
          .post(`${AUTH_ENDPOINT}/sign-in`)
          .withBody(authDTO)
          .expectStatus(HttpStatus.OK)
          .expectBodyContains('access_token')
          .stores('userAccessToken', 'access_token');
      });

      it('-should fail due to wrong credentials', () => {
        return pactum
          .spec()
          .post(`${AUTH_ENDPOINT}/sign-in`)
          .withBody({})
          .expectStatus(HttpStatus.BAD_REQUEST);
      });

      it('-should fail if password is not provided', () => {
        return pactum
          .spec()
          .post(SIGN_IN_ENDPOINT)
          .withBody({ email: authDTO.email })
          .expectStatus(HttpStatus.BAD_REQUEST);
      });

      it('-should fail if email is not provided', () => {
        return pactum
          .spec()
          .post(SIGN_IN_ENDPOINT)
          .withBody({ password: authDTO.password })
          .expectStatus(HttpStatus.BAD_REQUEST);
      });

      it('-should fail if credentials are not provided', () => {
        return pactum
          .spec()
          .post(SIGN_IN_ENDPOINT)
          .withBody({})
          .expectStatus(HttpStatus.BAD_REQUEST);
      });

      it('-should fail when invalid email is provided', () => {
        return pactum
          .spec()
          .post(SIGN_IN_ENDPOINT)
          .withBody({ email: 'failing', password: authDTO.password })
          .expectStatus(HttpStatus.BAD_REQUEST);
      });

      it('-should fail if the password is weak', () => {
        return pactum
          .spec()
          .post(SIGN_IN_ENDPOINT)
          .withBody({ email: authDTO.email, password: 'weak' })
          .expectStatus(HttpStatus.BAD_REQUEST);
      });
    });
  });

  describe('User', () => {
    const USERS_ENDPOINT = `${BASE_ENDPOINT}/users`;

    describe('GET - users:me', () => {
      it('+should retrieve details of the signed in user', () => {
        return pactum
          .spec()
          .get(`${USERS_ENDPOINT}/me`)
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .expectStatus(HttpStatus.OK)
          .expectBodyContains('id');
      });

      it('+should return a 401 if no bearer token is provided', () => {
        return pactum
          .spec()
          .get(`${USERS_ENDPOINT}/me`)
          .expectStatus(HttpStatus.UNAUTHORIZED);
      });

      it('+should return a 401 if an incorrect access token is provided', () => {
        return pactum
          .spec()
          .get(`${USERS_ENDPOINT}/me`)
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}tt3t',
          })
          .expectStatus(HttpStatus.UNAUTHORIZED);
      });
    });

    describe('GET - users', () => {
      it('should retrieve all users', () => {
        return pactum
          .spec()
          .get(`${USERS_ENDPOINT}`)
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .expectStatus(HttpStatus.OK);
      });
    });

    describe('GET - users:id', () => {
      it('should retrieve a single user by id', () => {
        return pactum
          .spec()
          .get(`${USERS_ENDPOINT}/users/3`)
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .expectStatus(HttpStatus.NOT_FOUND);
      });
    });

    describe('GET - users:id', () => {
      it("-should return 404 if a non-existent user's id is provided", () => {
        return pactum
          .spec()
          .get(`${USERS_ENDPOINT}/users/999`)
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .expectStatus(HttpStatus.NOT_FOUND);
      });
    });
  });

  describe('Wallet', () => {
    const WALLETS_ENDPOINT = `${BASE_ENDPOINT}/wallets`;

    let user: SignUpDto;
    let accessToken: AccessToken;

    beforeAll(async () => {
      user = await signUp(userDTO);
      accessToken = await signIn(authDTO);
    });

    describe('POST - wallets', () => {
      it('should create a wallet', () => {
        return pactum
          .spec()
          .post(WALLETS_ENDPOINT)
          .withHeaders({
            Authorization: `Bearer ${accessToken}`,
          })
          .expectStatus(HttpStatus.CREATED)
          .expectBodyContains('id')
          .expectBodyContains('user_id');
      });
    });

    describe('GET - wallets', () => {
      it('should retrieve all wallets', () => {
        return pactum
          .spec()
          .get(`${WALLETS_ENDPOINT}`)
          .withHeaders({
            Authorization: `Bearer ${accessToken}`,
          })
          .expectStatus(HttpStatus.OK);
      });
    });

    describe('GET - wallets:me', () => {
      it('should be able to get my wallets with the current signed in user', () => {
        return pactum
          .spec()
          .get(`${WALLETS_ENDPOINT}/me`)
          .withHeaders({
            Authorization: `Bearer ${accessToken}`,
          })
          .expectStatus(HttpStatus.OK);
      });
    });

    describe('GET - wallets:id', () => {
      it("should be able to get individual wallet by it's id", () => {
        return pactum
          .spec()
          .get(`${WALLETS_ENDPOINT}/4`)
          .withHeaders({
            Authorization: `Bearer ${accessToken}`,
          })
          .expectStatus(HttpStatus.NOT_FOUND);
      });
    });

    describe('POST - wallets:deposit', () => {
      it('should be able to fund their wallet', () => {
        return pactum
          .spec()
          .post(`${WALLETS_ENDPOINT}/1/deposit`)
          .withBody({
            Authorization: `Bearer ${accessToken}`,
          })
          .expectStatus(HttpStatus.OK)
          .inspect();
      });
    });

    describe('POST - wallets:withdraw', () => {
      it.todo('should be able to withdraw funds from wallet');
    });

    describe('POST - wallets:transfer', () => {
      it.todo("should be able to transfer funds to other user's wallets");
    });
  });
});
