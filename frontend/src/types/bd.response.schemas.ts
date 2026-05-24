// README.md | [29]
export type Rol = 'ADMIN' | 'VENDEDOR';
export type Category = 'ABARROTES' | 'PERECEDEROS' | 'LACTEOS' | 'LIMPIEZA' | 'CUIDADO_PERSONAL' | 'BEBIDAS';
export type VoucherType = 'BOLETA' | 'FACTURA';
export type SellStatus = 'CANCELADO' | 'EN_PROCESO' | 'ANULADO';

export interface User {
    userId: string;
    name: string;
}

export interface DataResponse<T> {
    data: T;
}

export interface BackendResponse {
    error?: boolean;
    message: string;
}

export interface AuthResponse extends BackendResponse {
    token: string;
    user: {
        userId: string;
        rol: Rol;
        name: string;
    }
}

export interface Client {
    name: string;
    id: string;
    email: string | null;
    createdAt: Date;
    updatedAt: Date;
    dni: string | null;
    ruc: string | null;
}

export interface Product {
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    bars_code: string | null;
    lote: string | null;
    category: Category;
    price_adquired: number;
    minor_price: number;
    wholesale_price: number;
    limit_minor_adquirition: number;
    revenue_margin: number;
    current_stock: number;
    alert_stock: number;
    expiration_date: Date | null;
    production_date: Date | null;
    active: boolean;
}

export type ClientsForSells = Omit<Client, 'id' | 'email' | 'createdAt' | 'updatedAt'>;
export type UsersForSells = Omit<UserResponse, 'id' | 'typeUser' | 'createdAt' | 'updatedAt'>;
export type ProductForSells = {
    name: string;
    bars_code: string;
}

export interface Sells {
    client: ClientsForSells | null;
    voucherType: VoucherType;
    user: UsersForSells;
    sellDetails: {
        product: ProductForSells
    };
    id: string;
    createdAt: Date;
    updatedAt: Date;
    id_user: string;
    id_client: string | null;
    sellStatus: SellStatus;
    total: number;
}

export interface UserResponse {
    name: string;
    id: string;
    email: string;
    typeUser: Rol;
    createdAt: Date;
    updatedAt: Date;
}