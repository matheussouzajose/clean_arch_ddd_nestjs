import { Module } from '@nestjs/common';
import { CategoriesModule } from './nest-modules/categories-module/categories.module';
import { DatabaseModule } from './nest-modules/database-module/database.module';
import { ConfigModule } from './nest-modules/config-module/config.module';
import { SharedModule } from './nest-modules/shared-module/shared.module';
import { GraphqlModule } from './nest-modules/graphql-module/graphql.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    GraphqlModule.forRoot(),
    CategoriesModule,
    SharedModule,
  ],
})
export class AppModule {}
