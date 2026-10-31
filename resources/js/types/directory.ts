export type BrandContact = {
    id: number;
    name: string;
    phone: string | null;
    email: string | null;
};

export type Brand = {
    id: number;
    name: string;
    tags: string[] | null;
    website: string | null;
    logo_url: string | null;
    is_partner: boolean;
    contacts?: BrandContact[];
    products_count?: number;
    contacts_count?: number;
};

export type Product = {
    id: number;
    brand_id: number;
    code: string;
    name: string;
    description: string | null;
    uom: string;
    currency: string;
    manufacturer_price: string;
    image_url: string | null;
    wattage: string | null;
    lumens: string | null;
    color_temperature: string | null;
    cri: string | null;
    beam_angle: string | null;
    ip_rating: string | null;
    finish: string | null;
};
