import { NextFunction, Request, Response } from "express";

export type RequestHandlerType = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<any>;
