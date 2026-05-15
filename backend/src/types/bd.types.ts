// README.MD | [3]
export interface JwtPayload {
    userId: string;
    rol: 'ADMIN' | 'VENDEDOR';
}
export type Rol = 'ADMIN' | 'VENDEDOR';
export interface CreateUser {

}