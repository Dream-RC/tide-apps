
export interface MemberUserSchema {
    id: number;
    name: string;
    icon: string;
    children?: MemberUserSchema[];
    // permission: string;
}
