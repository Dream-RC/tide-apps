export interface MenuSchema {
    id: number;
    name: string;
    icon: string;
    children?: MenuSchema[];
    // permission: string;
}
