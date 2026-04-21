import { Request, Response } from 'express';
import { supabase } from '../utils/supabase';

export const getAdminStats = async (req: Request, res: Response) => {
  try {
    const { count: listingsCount } = await supabase
      .from('listings')
      .select('id', { count: 'exact', head: true });

    const { count: usersCount } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true });

    const { count: messagesCount } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true });

    const { count: verifiedSellersCount } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('is_verified', true);

    res.json({
      listingsCount: listingsCount || 0,
      usersCount: usersCount || 0,
      verifiedSellersCount: verifiedSellersCount || 0,
      messagesCount: messagesCount || 0,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAdminListings = async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt((req.query.limit as string) || '20', 10), 100);

    const { data: listings, error } = await supabase
      .from('listings')
      .select('*, user:users(id, name, avatar, is_verified)')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    const formattedListings = listings?.map((l: any) => ({
      ...l,
      userId: l.user_id,
      createdAt: l.created_at,
      user: l.user
        ? {
            ...l.user,
            isVerified: l.user.is_verified,
          }
        : null,
    }));

    res.json(formattedListings || []);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAdminListing = async (req: Request, res: Response) => {
  try {
    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({ message: 'Listing deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

