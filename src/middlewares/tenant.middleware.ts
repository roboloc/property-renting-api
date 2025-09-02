// // src/middlewares/tenant.middleware.ts
// import { Request, Response, NextFunction } from "express";
// import jwt from "jsonwebtoken";
// import { JWT_SECRET } from "../config/env";

// export const AuthTenant = (req: Request, res: Response, next: NextFunction) => {
//   const user = res.locals.user;

//   if (!user || user.role !== "TENANT") {
//     return res
//       .status(403)
//       .json({ message: "Access denied. Tenant role required." });
//   }

//   next();
// };

import { RequestHandler } from "express";

export const AuthTenant: RequestHandler = (req, res, next) => {
  const user = res.locals.user;

  if (!user || user.role !== "TENANT") {
    res.status(403).json({ message: "Access denied. Tenant role required." });
    return;
  }

  next();
};
