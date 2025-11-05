import { createServerClient } from "@supabase/ssr";
import { type Request, type Response, type NextFunction } from "express";

export const supabaseMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return next(new Error("Missing Supabase environment variables"));
  }

  // Create a safe cookie handler that checks if headers have been sent
  const safeCookieHandler = {
    get(key: string) {
      return req.headers.cookie?.split(";").find(c => c.trim().startsWith(`${key}=`))?.split("=")[1];
    },
    set(key: string, value: string, options: any) {
      if (!res.headersSent) {
        res.cookie(key, value, options);
      }
    },
    remove(key: string, options: any) {
      if (!res.headersSent) {
        res.cookie(key, "", options);
      }
    },
  };

  const supabase = createServerClient(supabaseUrl, supabaseServiceKey, {
    cookies: safeCookieHandler,
  });

  req.supabase = supabase;
  next();
};

declare global {
  namespace Express {
    export interface Request {
      supabase: ReturnType<typeof createServerClient>;
    }
  }
}