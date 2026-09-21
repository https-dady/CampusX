import env from "../config/env.js";

const internalCacheMiddleware = (req, res, next) => {
  const internalKey = req.headers["x-internal-key"];

  if (
    !env.LEARNING_CACHE_INTERNAL_KEY ||
    internalKey !== env.LEARNING_CACHE_INTERNAL_KEY
  ) {
    return res.status(401).json({
      success: false,
      message: "Invalid internal API key.",
    });
  }

  next();
  
};

export default internalCacheMiddleware;