export interface IBaseCategory {
    name: string
    idType: number
}

export interface ICategory extends IBaseCategory {
    id: string
    typeName?: string
}

export type IPostCategory = IBaseCategory
