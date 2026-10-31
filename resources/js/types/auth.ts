export type Role = {
    id: number;
    name: string;
    is_admin: boolean;
    can_manage?: boolean;
    permissions?: { name: string }[];
    users_count?: number;
};

export type User = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    avatar?: string;
    role_id: number | null;
    role?: Role | null;
    can_manage?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User;
    permissions: string[];
};
