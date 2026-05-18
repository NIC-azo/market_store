// README.MD | [3]
export interface JwtPayload {
    userId: string;
    rol: 'ADMIN' | 'VENDEDOR';
}
export type Rol = 'ADMIN' | 'VENDEDOR';
export interface CreateUser {
    name: string;
    email: string;
    password: string;
    typeUser: Rol;
}

export interface UpdateUser {
    name?: string;
    email?: string;
    password?: string;
    typeUser?: Rol;
}

export interface CreateClient {
    name: string;
    email: string;
    dni: string;
    ruc: string;
}

export interface UpdateClient {
    name?: string;
    email?: string;
    dni?: string;
    ruc?: string;
}

export interface CreateProduct {
    name: string;
    bars_code?: string;
    lote?: string;
    category: 'ABARROTES' | 'PERECEDEROS' 
    | 'LACTEOS' | 'LIMPIEZA' 
    | 'CUIDADO_PERSONAL' 
    | 'BEBIDAS';
    price_adquired: number;
    minor_price: number;
    wholesale_price: number;
    limit_minor_adquirition: number;
    revenue_margin: number;
    current_stock: number;
    alert_stock: number;
    expiration_date?: Date;
    production_date?: Date;
}

export interface UpdateProduct {
    name?: string;
    bars_code?: string;
    lote?: string;
    category?: 'ABARROTES' | 'PERECEDEROS' 
    | 'LACTEOS' | 'LIMPIEZA' 
    | 'CUIDADO_PERSONAL' 
    | 'BEBIDAS';
    price_adquired?: number;
    minor_price?: number;
    wholesale_price?: number;
    limit_minor_adquirition?: number;
    revenue_margin?: number;
    current_stock?: number;
    alert_stock?: number;
    expiration_date?: Date;
    production_date?: Date;
}

export interface SaleRequest {
    id_client: string;
    voucherType: 'BOLETA' | 'FACTURA';
    products: Array<{
        id_product: string;
        quantity: number;
    }> 
}