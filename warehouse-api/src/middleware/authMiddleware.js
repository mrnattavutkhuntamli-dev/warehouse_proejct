import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";
import { AppError } from "./errorMiddleware.js";

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new AppError("No token provided", 401);
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        employeeCode: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        departmentId: true,
      },
    });

    if (!user || !user.isActive) {
      throw new AppError("User not found or inactive", 401);
    }

    req.user = user;
    next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      return next(new AppError("Invalid token", 401));
    }
    if (err instanceof jwt.TokenExpiredError) {
      return next(new AppError("Token expired", 401));
    }
    next(err);
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. Required roles: ${roles.join(", ")}`,
          403
        )
      );
    }
    next();
  };
};
