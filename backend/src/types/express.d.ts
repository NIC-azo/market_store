// README.MD | [7]
import type { JwtPayload } from "@types/bd.types.ts";

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}