import request from 'supertest';
import { instanceToPlain } from 'class-transformer';
import { Category } from '@core/category/domain/entity/category.entity';
import { startApp } from '../../../src/nest-modules/shared-module/testing/helpers';
import { UpdateCategoryFixture } from '../../../src/nest-modules/categories-module/testing/category-fixture';
import { ICategoryRepository } from '@core/category/domain/repository/category.repository.interface';
import { CATEGORY_PROVIDERS } from '../../../src/nest-modules/categories-module/categories.providers';
import { Uuid } from '@core/shared/domain/value-objects/uuid.vo';
import { CategoriesController } from '../../../src/nest-modules/categories-module/categories.controller';
import { CategoryOutputMapper } from '@core/category/application/use-cases/common/category-output.dto';

describe('CategoriesController (e2e)', () => {
  const uuid = '9366b7dc-2d71-4799-b91c-c64adb205104';

  describe('/categories/:id (PATCH)', () => {
    describe('should a response error when id is invalid or not found', () => {
      const nestApp = startApp();
      const faker = Category.fake().aCategory().withCreatedAt(new Date());
      const arrange = [
        {
          id: '88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
          send_data: { name: faker.name },
          expected: {
            message:
              'Category Not Found using ID 88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
            statusCode: 404,
            error: 'Not Found',
          },
        },
        {
          id: 'fake id',
          send_data: { name: faker.name },
          expected: {
            statusCode: 422,
            message: 'Validation failed (uuid is expected)',
            error: 'Unprocessable Entity',
          },
        },
      ];

      test.each(arrange)(
        'when id is $id',
        async ({ id, send_data, expected }) => {
          return (
            request(nestApp.app.getHttpServer())
              .patch(`/categories/${id}`)
              // .authenticate(nestApp.app)
              .send(send_data)
              .expect(expected.statusCode)
              .expect(expected)
          );
        },
      );
    });

    describe('should a response error with 422 when request body is invalid', () => {
      const app = startApp();
      const invalidRequest = UpdateCategoryFixture.arrangeInvalidRequest();
      const arrange = Object.keys(invalidRequest).map((key) => ({
        label: key,
        value: invalidRequest[key],
      }));
      test.each(arrange)('when body is $label', ({ value }) => {
        return (
          request(app.app.getHttpServer())
            .patch(`/categories/${uuid}`)
            // .authenticate(app.app)
            .send(value.send_data)
            .expect(422)
            .expect(value.expected)
        );
      });
    });

    describe('should a response error with 422 when throw EntityValidationError', () => {
      const app = startApp();
      const validationError =
        UpdateCategoryFixture.arrangeForEntityValidationError();
      const arrange = Object.keys(validationError).map((key) => ({
        label: key,
        value: validationError[key],
      }));
      let categoryRepo: ICategoryRepository;

      beforeEach(() => {
        categoryRepo = app.app.get<ICategoryRepository>(
          CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
        );
      });
      test.each(arrange)('when body is $label', async ({ value }) => {
        const category = Category.fake().aCategory().withCreatedAt(new Date()).build();
        await categoryRepo.insert(category);
        return (
          request(app.app.getHttpServer())
            .patch(`/categories/${category.getCategoryId()}`)
            // .authenticate(app.app)
            .send(value.send_data)
            .expect(422)
            .expect(value.expected)
        );
      });
    });

    describe('should update a category', () => {
      const appHelper = startApp();
      const arrange = UpdateCategoryFixture.arrangeForUpdate();
      let categoryRepo: ICategoryRepository;

      beforeEach(async () => {
        categoryRepo = appHelper.app.get<ICategoryRepository>(
          CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
        );
      });
      test.each(arrange)(
        'when body is $send_data',
        async ({ send_data, expected }) => {
          const categoryCreated = Category.fake().aCategory().withCreatedAt(new Date()).build();
          await categoryRepo.insert(categoryCreated);

          const res = await request(appHelper.app.getHttpServer())
            .patch(`/categories/${categoryCreated.getCategoryId()}`)
            // .authenticate(appHelper.app)
            .send(send_data)
            .expect(200);
          const keyInResponse = UpdateCategoryFixture.keysInResponse;
          expect(Object.keys(res.body)).toStrictEqual(['data']);
          expect(Object.keys(res.body.data)).toStrictEqual(keyInResponse);
          const id = res.body.data.id;
          const categoryUpdated = await categoryRepo.findById(new Uuid(id));
          const presenter = CategoriesController.serialize(
            CategoryOutputMapper.toOutput(categoryUpdated!),
          );
          const serialized = instanceToPlain(presenter);
          expect(res.body.data).toStrictEqual(serialized);
          expect(res.body.data).toStrictEqual({
            id: serialized.id,
            createdAt: serialized.createdAt,
            name: expected.name ?? categoryUpdated!.getName(),
            description:
              'description' in expected
                ? expected.description
                : categoryUpdated!.getDescription(),
            isActive: categoryUpdated!.getIsActive(),
          });
        },
      );
    });
  });
});
