// import { z } from 'zod'

// export const menuSchema: z.ZodObject<any> = z.object({
//     id: z.number(),
//     name: z.string(),

//     status: z.number(),
//     children: z.array(z.lazy(() => menuSchema)),
// })

// export type MenuColumnSchemaType = z.infer<typeof menuSchema>

export interface ProjectMenuSchema {
    id: number;
    name: string;
    icon: string;
    children?: ProjectMenuSchema[];
    // permission: string;
}
