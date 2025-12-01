
export interface CartItem {
    item_id: string;
    sku: string;
    quote_id: string;
    name: string;
    product_type: string;
    weight: string;
    uom: string;
    qty: number;
    min_qty: number;
    max_qty: number;
    available_qty: number;
    price: string;
    image?: string;
    sales_price?: string | null;
    special_price?: string | null;
    extension_attributes?: string[];
    toDate?: string | null;
    fromDate?: string | null;
    currentDate?: string;
    error?: string | null;
}

export interface CartApiResponse {
    success: boolean;
    message: string;
    quote_id: string;
    items: CartItem[];
}

export interface GuestCartApiResponse {
    success: boolean;
    message: string;
    id: string;
    items?: CartItem[];
    quote_id?: string;
    created_at?: string;
    updated_at?: string;
    is_active?: boolean;
    is_virtual?: boolean;
}
