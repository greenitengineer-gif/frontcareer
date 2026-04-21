import { Request, Response } from 'express';
import { supabase } from '../utils/supabase';

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;

    res.json({ message: 'Мэдэгдэл уншсан төлөвт орлоо' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;

    res.json({ message: 'Бүх мэдэгдэл уншсан төлөвт орлоо' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
