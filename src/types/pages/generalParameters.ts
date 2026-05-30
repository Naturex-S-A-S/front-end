interface IBaseCategory {
    name: string
}

export interface ICategory extends IBaseCategory {
    id: string
    type?: string
    dateCreated: string
}

export type IPutCategory = ICategory

export type IPostCategory = IBaseCategory
