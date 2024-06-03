import request from 'supertest';
import { startApp } from '../../../src/nest-modules/shared-module/testing/helpers';
import { ICategoryRepository } from '@core/category/domain/repository/category.repository.interface';
import { Category } from '@core/category/domain/entity/category.entity';
import { Uuid } from '@core/shared/domain/value-objects/uuid.vo';
import { CATEGORY_PROVIDERS } from '../../../src/nest-modules/categories-module/categories.providers';

describe('CategoriesController (e2e)', () => {
  describe('/delete/:id (DELETE)', () => {
    const appHelper = startApp();
    describe('should a response error when id is invalid or not found', () => {
      const arrange = [
        {
          id: '88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
          expected: {
            message:
              'Category Not Found using ID 88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
            statusCode: 404,
            error: 'Not Found',
          },
        },
        {
          id: 'fake id',
          expected: {
            statusCode: 422,
            message: 'Validation failed (uuid is expected)',
            error: 'Unprocessable Entity',
          },
        },
      ];

      test.each(arrange)('when id is $id', async ({ id, expected }) => {
        return (
          request(appHelper.app.getHttpServer())
            .delete(`/categories/${id}`)
            // .authenticate(appHelper.app)
            .expect(expected.statusCode)
            .expect(expected)
        );
      });
    });

    test('should delete a category response with status 204', async () => {
      const categoryRepo = appHelper.app.get<ICategoryRepository>(
        CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
      );
      const category = Category.fake().aCategory().withCreatedAt(new Date()).build();
      await categoryRepo.insert(category);

      await request(appHelper.app.getHttpServer())
        .delete(`/categories/${category.getCategoryId()}`)
        // .authenticate(appHelper.app)
        .expect(204);

      await expect(
        categoryRepo.findById(category.entityId as Uuid),
      ).resolves.toBeNull();
    });
  });
});
