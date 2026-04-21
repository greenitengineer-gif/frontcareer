import { Request, Response, NextFunction } from 'express';
import { supabase } from '../utils/supabase';

const parseListEnv = (value: string | undefined) =>
  (value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user as { id?: string; email?: string } | undefined;

  if (!user) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  if (!user.id) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  // Check admin approval via Supabase table `admin_requests`
  // to avoid relying on `users.is_admin` (which may not be populated yet).
  const { data, error } = await supabase
    .from('admin_requests')
    .select('status')
    .eq('user_id', user.id)
    .eq('status', 'approved')
    .maybeSingle();

  if (error || !data) {
    return res.status(403).json({ message: 'Admin only' });
  }

  return next();
};

