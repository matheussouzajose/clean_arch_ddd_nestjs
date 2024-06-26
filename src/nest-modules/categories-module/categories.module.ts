import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { CategoryModel } from '@core/category/infrastructure/persistence/repository/sequelize/category.model';
import { CATEGORY_PROVIDERS } from './categories.providers';
import { CategoriesResolver } from './categories.resolver';

@Module({
  imports: [SequelizeModule.forFeature([CategoryModel])],
  controllers: [CategoriesController],
  providers: [
    ...Object.values(CATEGORY_PROVIDERS.REPOSITORIES),
    ...Object.values(CATEGORY_PROVIDERS.USE_CASES),
    CategoriesResolver,
  ],
})
export class CategoriesModule {}
