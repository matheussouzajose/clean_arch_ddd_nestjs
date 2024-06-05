import { UpdateCategoryInput } from '@core/category/application/use-cases/update-category/dto/update-category-input.dto';
import { OmitType } from '@nestjs/mapped-types';
import { UpdateCategoryPayload } from '../../../../graphql';

export class UpdateCategoryInputWithoutId extends OmitType(
  UpdateCategoryInput,
  ['id'] as const,
) {}

export class UpdateCategoryGraphQLDto
  extends UpdateCategoryInputWithoutId
  implements UpdateCategoryPayload {}
