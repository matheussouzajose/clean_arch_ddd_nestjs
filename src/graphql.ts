
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export interface CreateCategoryPayload {
    name: string;
    description?: Nullable<string>;
    isActive?: Nullable<boolean>;
}

export interface UpdateCategoryPayload {
    name?: Nullable<string>;
    description?: Nullable<string>;
}

export interface SearchCategories {
    page?: Nullable<number>;
    perPage?: Nullable<number>;
    sort?: Nullable<string>;
    sortDir?: Nullable<string>;
    filter?: Nullable<string>;
}

export interface Category {
    id: UUID;
    name: string;
    description?: Nullable<string>;
    isActive: boolean;
    createdAt: string;
}

export interface CategoriesPaginated {
    data?: Nullable<Nullable<Category>[]>;
    meta: Meta;
}

export interface IMutation {
    createCategory(input: CreateCategoryPayload): Category | Promise<Category>;
    updateCategory(id: UUID, input: UpdateCategoryPayload): Category | Promise<Category>;
    deleteCategory(id: UUID): boolean | Promise<boolean>;
    activateCategory(id: UUID): Category | Promise<Category>;
    deactivateCategory(id: UUID): Category | Promise<Category>;
}

export interface IQuery {
    getCategory(id: UUID): Category | Promise<Category>;
    searchCategories(searchParams?: Nullable<SearchCategories>): CategoriesPaginated | Promise<CategoriesPaginated>;
    adminSystemInfo(): SystemInfo | Promise<SystemInfo>;
}

export interface SystemInfo {
    version: string;
    name: string;
}

export interface Meta {
    total?: Nullable<number>;
    currentPage?: Nullable<number>;
    lastPage?: Nullable<number>;
    perPage?: Nullable<number>;
}

export type NaiveDateTime = any;
export type EmailAddress = any;
export type JSON = any;
export type URL = any;
export type UUID = any;
type Nullable<T> = T | null;
