"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAdminListing = exports.getAdminListings = exports.getAdminStats = void 0;
const supabase_1 = require("../utils/supabase");
const getAdminStats = async (req, res) => {
    try {
        const { count: listingsCount } = await supabase_1.supabase
            .from('listings')
            .select('id', { count: 'exact', head: true });
        const { count: usersCount } = await supabase_1.supabase
            .from('users')
            .select('id', { count: 'exact', head: true });
        const { count: messagesCount } = await supabase_1.supabase
            .from('messages')
            .select('id', { count: 'exact', head: true });
        const { count: verifiedSellersCount } = await supabase_1.supabase
            .from('users')
            .select('id', { count: 'exact', head: true })
            .eq('is_verified', true);
        res.json({
            listingsCount: listingsCount || 0,
            usersCount: usersCount || 0,
            verifiedSellersCount: verifiedSellersCount || 0,
            messagesCount: messagesCount || 0,
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getAdminStats = getAdminStats;
const getAdminListings = async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);
        const { data: listings, error } = await supabase_1.supabase
            .from('listings')
            .select('*, user:users(id, name, avatar, is_verified)')
            .order('created_at', { ascending: false })
            .limit(limit);
        if (error)
            throw error;
        const formattedListings = listings?.map((l) => ({
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
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getAdminListings = getAdminListings;
const deleteAdminListing = async (req, res) => {
    try {
        const { error } = await supabase_1.supabase
            .from('listings')
            .delete()
            .eq('id', req.params.id);
        if (error)
            throw error;
        res.json({ message: 'Listing deleted' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.deleteAdminListing = deleteAdminListing;
//# sourceMappingURL=admin.controller.js.map