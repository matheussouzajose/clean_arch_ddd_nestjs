import { Module } from '@nestjs/common';
import {
  GqlModuleOptions,
  GraphQLModule as NestGraphQLModule,
} from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { join } from 'path';
import { GraphQLFormattedError } from 'graphql/error';
import { DateResolver, JSONResolver, UUIDResolver } from 'graphql-scalars';


@Module({})
export class GraphqlModule extends NestGraphQLModule {
  static forRoot(config: GqlModuleOptions = {}) {
    return super.forRoot({
      driver: ApolloDriver,
      typePaths: ['./**/*.graphql'],
      definitions: {
        path: join(process.cwd(), 'src/graphql.ts'),
        outputAs: 'interface',
      },
      formatError: (error: GraphQLFormattedError) => {
        return {
          message: error.message,
          code: error.extensions?.code,
          extensions: error.extensions,
        };
      },
      resolvers: {
        ['Date']: DateResolver,
        ['JSON']: JSONResolver,
        ['UUID']: UUIDResolver,
      },
      ...config,
    });
  }
}
