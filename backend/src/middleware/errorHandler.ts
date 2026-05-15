import type { Request, Response, NextFunction } from "express";
// README.md | [6]
export const errorHandler = (fn: Function) => (
    req: Request, res: Response, next: NextFunction
) => {
    Promise.resolve(fn(req, res, next)).catch(next);
}