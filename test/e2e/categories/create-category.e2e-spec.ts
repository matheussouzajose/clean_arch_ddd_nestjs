import request from 'supertest';
import { instanceToPlain } from 'class-transformer';
import { ICategoryRepository } from '@core/category/domain/repository/category.repository.interface';
import { CATEGORY_PROVIDERS } from '../../../src/nest-modules/categories-module/categories.providers';
import { CreateCategoryFixture } from '../../../src/nest-modules/categories-module/testing/category-fixture';
import { CategoriesController } from '../../../src/nest-modules/categories-module/categories.controller';
import { Uuid } from '@core/shared/domain/value-objects/uuid.vo';
import { CategoryOutputMapper } from '@core/category/application/use-cases/common/category-output.dto';
import { startApp } from '../../../src/nest-modules/shared-module/testing/helpers';

describe('CategoriesController (e2e)', () => {
  const appHelper = startApp();
  let categoryRepo: ICategoryRepository;

  beforeEach(async () => {
    categoryRepo = appHelper.app.get<ICategoryRepository>(
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
    );
  });
  describe('/categories (POST)', () => {
    describe.skip('unauthenticated', () => {
      const app = startApp();

      test('should return 401 when not authenticated', () => {
        return request(app.app.getHttpServer())
          .post('/categories')
          .send({})
          .expect(401);
      });

      test('should return 403 when not authenticated as admin', () => {
        return (
          request(app.app.getHttpServer())
            .post('/categories')
            // .authenticate(app.app, false)
            .send({})
            .expect(403)
        );
      });
    });

    describe('should return a response error with 422 status code when request body is invalid', () => {
      const invalidRequest = CreateCategoryFixture.arrangeInvalidRequest();
      const arrange = Object.keys(invalidRequest).map((key) => ({
        label: key,
        value: invalidRequest[key],
      }));

      test.each(arrange)('when body is $label', ({ value }) => {
        return (
          request(appHelper.app.getHttpServer())
            .post('/categories')
            // .authenticate(appHelper.app)
            .send(value.send_data)
            .expect(422)
            .expect(value.expected)
        );
      });
    });

    describe('should return a response error with 422 status code when throw EntityValidationError', () => {
      const invalidRequest =
        CreateCategoryFixture.arrangeForEntityValidationError();
      const arrange = Object.keys(invalidRequest).map((key) => ({
        label: key,
        value: invalidRequest[key],
      }));

      test.each(arrange)('when body is $label', ({ value }) => {
        return (
          request(appHelper.app.getHttpServer())
            .post('/categories')
            // .authenticate(appHelper.app)
            .send(value.send_data)
            .expect(422)
            .expect(value.expected)
        );
      });
    });

    describe('should create a category', () => {
      const arrange = CreateCategoryFixture.arrangeForCreate();

      test.each(arrange)(
        'when body is $send_data',
        async ({ send_data, expected }) => {
          const res = await request(appHelper.app.getHttpServer())
            .post('/categories')
            // .authenticate(appHelper.app)
            .send(send_data)
            .expect(201);

          const keysInResponse = CreateCategoryFixture.keysInResponse;
          expect(Object.keys(res.body)).toStrictEqual(keysInResponse);
          const id = res.body.id;
          const categoryCreated = await categoryRepo.findById(new Uuid(id));

          const presenter = CategoriesController.serialize(
            CategoryOutputMapper.toOutput(categoryCreated!),
          );
          const serialized = instanceToPlain(presenter);

          expect(res.body).toStrictEqual({
            id: serialized.id,
            createdAt: serialized.createdAt,
            ...expected,
          });
        },
      );
    });
  });
});
