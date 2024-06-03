import request from 'supertest';
import { instanceToPlain } from 'class-transformer';
import { ICategoryRepository } from '@core/category/domain/repository/category.repository.interface';
import { startApp } from '../../../src/nest-modules/shared-module/testing/helpers';
import { ListCategoriesFixture } from '../../../src/nest-modules/categories-module/testing/category-fixture';
import { CATEGORY_PROVIDERS } from '../../../src/nest-modules/categories-module/categories.providers';
import { CategoriesController } from '../../../src/nest-modules/categories-module/categories.controller';
import { CategoryOutputMapper } from '@core/category/application/use-cases/common/category-output.dto';

describe('CategoriesController (e2e)', () => {
  describe('/categories (GET)', () => {
    describe('should return categories sorted by created_at when request query is empty', () => {
      let categoryRepo: ICategoryRepository;
      const nestApp = startApp();
      const { entitiesMap, arrange } =
        ListCategoriesFixture.arrangeIncrementedWithCreatedAt();

      beforeEach(async () => {
        categoryRepo = nestApp.app.get<ICategoryRepository>(
          CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
        );
        await categoryRepo.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)(
        'when query params is $send_data',
        async ({ send_data, expected }) => {
          const queryParams = new URLSearchParams(send_data as any).toString();
          return (
            request(nestApp.app.getHttpServer())
              .get(`/categories/?${queryParams}`)
              // .authenticate(nestApp.app)
              .expect(200)
              .expect({
                data: expected.entities.map((e) =>
                  instanceToPlain(
                    CategoriesController.serialize(
                      CategoryOutputMapper.toOutput(e),
                    ),
                  ),
                ),
                meta: expected.meta,
              })
          );
        },
      );
    });

    describe('should return categories using paginate, filter and sort', () => {
      let categoryRepo: ICategoryRepository;
      const nestApp = startApp();
      const { entitiesMap, arrange } = ListCategoriesFixture.arrangeUnsorted();

      beforeEach(async () => {
        categoryRepo = nestApp.app.get<ICategoryRepository>(
          CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
        );
        await categoryRepo.bulkInsert(Object.values(entitiesMap));
      });

      test.each([arrange])(
        'when query params is $send_data',
        async ({ send_data, expected }) => {
          const queryParams = new URLSearchParams(send_data as any).toString();
          return (
            request(nestApp.app.getHttpServer())
              .get(`/categories/?${queryParams}`)
              // .authenticate(nestApp.app)
              .expect(200)
              .expect({
                data: expected.entities.map((e) =>
                  instanceToPlain(
                    CategoriesController.serialize(
                      CategoryOutputMapper.toOutput(e),
                    ),
                  ),
                ),
                meta: expected.meta,
              })
          );
        },
      );
    });
  });
});
