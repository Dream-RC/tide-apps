// import { z } from 'zod'

// export const menuSchema: z.ZodObject<any> = z.object({
//     id: z.number(),
//     name: z.string(),

//     status: z.number(),
//     children: z.array(z.lazy(() => menuSchema)),
// })

// export type MenuColumnSchemaType = z.infer<typeof menuSchema>

export interface StorageConfigSchema {
    id: number;
    name: string;
    icon: string;
    // children?: MenuSchema[];
    // permission: string;
}
