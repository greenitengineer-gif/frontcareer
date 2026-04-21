import { Request, Response } from 'express';
import { supabase } from '../utils/supabase';

export const toggleFavorite = async (req: Request, res: Response) => {
  try {
    const { listingId } = req.body;
    const userId = (req as any).user.id;

    const { data: existingFavorite, error: fetchError } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('listing_id', listingId)
      .single();

    if (existingFavorite) {
      const { error: deleteError } = await supabase
        .from('favorites')
        .delete()
        .eq('id', existingFavorite.id);
      
      if (deleteError) throw deleteError;
      res.json({ message: 'Removed from favorites' });
    } else {
      const favId = crypto.randomUUID();
      const { error: insertError } = await supabase
        .from('favorites')
        .insert([{ id: favId, user_id: userId, listing_id: listingId }]);
      
      if (insertError) throw insertError;
      res.status(201).json({ message: 'Added to favorites' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getFavorites = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const { data: favorites, error } = await supabase
      .from('favorites')
      .select(`
        listing:listings(
          *,
          user:users(id, name, avatar, is_verified)
        )
      `)
      .eq('user_id', userId);

    if (error) throw error;

    // Map to camelCase
    const listings = favorites?.map((f: any) => ({
      ...f.listing,
      userId: f.listing.user_id,
      createdAt: f.listing.created_at,
      user: f.listing.user ? {
        ...f.listing.user,
        isVerified: f.listing.user.is_verified
      } : null
    }));

    res.json(listings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
