import { Request, Response, NextFunction } from "express";

type RequestHandlerType = (req: Request, res: Response, next: NextFunction) => Promise<any>;

const asyncHandler = (requestHandler: RequestHandlerType) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };
