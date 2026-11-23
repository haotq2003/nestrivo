
import jwt from "jsonwebtoken";

export function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const [scheme, token] = authHeader?.split(" ") ?? [];

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
      message: "Vui lòng cung cấp access token.",
    });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({
      message: "Token không hợp lệ hoặc đã hết hạn.",
    });
  }
}

export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    const roles = req.user?.roles ?? [];

    if (!allowedRoles.some((role) => roles.includes(role))) {
      return res.status(403).json({
        message: "Bạn không có quyền thực hiện thao tác này.",
      });
    }

    return next();
  };
}

export const requireAdmin = authorizeRoles("ADMIN");
export const requireLandlord = authorizeRoles("LANDLORD");

