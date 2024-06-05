import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { Inject } from '@nestjs/common';
import { CreateCategoryUseCase } from '@core/category/application/use-cases/create-category/create-category.use-case';
import { CategoryOutput } from '@core/category/application/use-cases/common/category-output.dto';
import { Category, UUID } from '../../graphql';
import { CreateCategoryGraphqlDto } from './dto/graphql/create-category-graphql.dto';
import {
  CategoryCollectionPresenter,
  CategoryPresenter,
} from './categories.presenter';
import { GetCategoryUseCase } from '@core/category/application/use-cases/get-category/get-category.use-case';
import { ListCategoriesUseCase } from '@core/category/application/use-cases/list-categories/list-categories.use-case';
import { SearchCategoriesDto } from './dto/search-category.dto';
import { UpdateCategoryUseCase } from '@core/category/application/use-cases/update-category/update-category.use-case';
import { UpdateCategoryGraphQLDto } from './dto/graphql/update-category-graphql.dto';
import { DeleteCategoryUseCase } from '@core/category/application/use-cases/delete-category/delete-category.use-case';
import { ActivateCategoryUseCase } from '@core/category/application/use-cases/activate-category/activate-category.use-case';
import { DeactivateCategoryUseCase } from '@core/category/application/use-cases/deactivate-category/deactivate-category.use-case';

@Resolver('Category')
export class CategoriesResolver {
  @Inject(CreateCategoryUseCase)
  private createUseCase: CreateCategoryUseCase;

  @Inject(ListCategoriesUseCase)
  private listUseCase: ListCategoriesUseCase;

  @Inject(GetCategoryUseCase)
  private getCategoryUseCase: GetCategoryUseCase;

  @Inject(UpdateCategoryUseCase)
  private updateUseCase: UpdateCategoryUseCase;

  @Inject(DeleteCategoryUseCase)
  private deleteUseCase: DeleteCategoryUseCase;

  @Inject(ActivateCategoryUseCase)
  private activateUseCase: ActivateCategoryUseCase;

  @Inject(DeactivateCategoryUseCase)
  private deactivateUseCase: DeactivateCategoryUseCase;

  @Mutation('createCategory')
  async createCategory(
    @Args('input') input: CreateCategoryGraphqlDto,
  ): Promise<Category> {
    const output = await this.createUseCase.execute(input);
    return CategoriesResolver.serialize(output);
  }

  @Query('searchCategories')
  async searchCategories(
    @Args('searchParams') searchParamsDto: SearchCategoriesDto,
  ) {
    const output = await this.listUseCase.execute(searchParamsDto);
    return new CategoryCollectionPresenter(output);
  }

  @Query('getCategory')
  async getCategory(@Args('id') id: UUID): Promise<Category> {
    const output = await this.getCategoryUseCase.execute({ id });
    return CategoriesResolver.serialize(output);
  }

  @Mutation('updateCategory')
  async updateCategory(
    @Args('input') input: UpdateCategoryGraphQLDto,
    @Args('id') id: UUID,
  ): Promise<Category> {
    const output = await this.updateUseCase.execute({
      ...input,
      id,
    });
    return CategoriesResolver.serialize(output);
  }

  @Mutation('deleteCategory')
  async deleteCategory(@Args('id') id: UUID): Promise<boolean> {
    await this.deleteUseCase.execute({ id });
    return true;
  }

  @Mutation('activateCategory')
  async activateCategory(@Args('id') id: UUID): Promise<Category> {
    const output = await this.activateUseCase.execute({
      id,
    });
    return CategoriesResolver.serialize(output);
  }

  @Mutation('deactivateCategory')
  async deactivateCategory(@Args('id') id: UUID): Promise<Category> {
    const output = await this.deactivateUseCase.execute({
      id,
    });
    return CategoriesResolver.serialize(output);
  }

  static serialize(output: CategoryOutput): Category {
    return new CategoryPresenter(output).toGraphQL();
  }
}
