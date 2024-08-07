import { cleanupFolder } from "../utility";

export const cleanupMiddleware = (req, res, next) => {
    cleanupFolder('../examples/_output');
    cleanupFolder('uploads');
    next();
  };

  