import { CreateCategoryInput } from '@core/category/application/use-cases/create-category/dto/create-category-input.dto';
import { CreateCategoryPayload } from '../../../../graphql';

export class CreateCategoryGraphqlDto
  extends CreateCategoryInput
  implements CreateCategoryPayload {}
