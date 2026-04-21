"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalProtect = exports.protect = void 0;
const supabase_1 = require("../utils/supabase");
const protect = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
    const token = authHeader.split(' ')[1];
    try {
        // Verify Supabase access token and fetch auth user id.
        const { data: authData, error: authError } = await supabase_1.supabase.auth.getUser(token);
        if (authError || !authData.user) {
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
        const authUser = authData.user;
        // Check for email conflict before upserting (stale records with different ID)
        const { data: existingUserByEmail } = await supabase_1.supabase
            .from('users')
            .select('id')
            .eq('email', authUser.email)
            .maybeSingle();
        if (existingUserByEmail && existingUserByEmail.id !== authUser.id) {
            console.log(`Fixing email conflict for ${authUser.email}. Deleting stale user record ${existingUserByEmail.id}`);
            // Using delete because updating PK (id) in a sync middleware is more error-prone than fresh sync
            await supabase_1.supabase.from('users').delete().eq('id', existingUserByEmail.id);
        }
        // Ensure a row exists in public.users (so other API logic can use it).
        // If the row doesn't exist yet, create it using user metadata.
        const { data: existingUser, error: fetchError } = await supabase_1.supabase
            .from('users')
            .select('id, name, email, phone, avatar, banner, bio, website, is_verified, user_type')
            .eq('id', authUser.id)
            .maybeSingle();
        if (fetchError) {
            console.error('Fetch User Error:', fetchError);
            return res.status(500).json({ message: 'Error fetching user data' });
        }
        let userToUse = existingUser;
        if (!existingUser) {
            // Create user if doesn't exist
            const userMeta = authUser.user_metadata || {};
            const { data: insertedUser, error: insertError } = await supabase_1.supabase
                .from('users')
                .insert({
                id: authUser.id,
                email: authUser.email,
                password: '', // Supabase manages passwords in auth.users.
                name: userMeta.name || authUser.email || 'User',
                phone: userMeta.phone || null,
                avatar: userMeta.avatar || null,
                banner: userMeta.banner || null,
                bio: userMeta.bio || null,
                website: userMeta.website || null,
                is_verified: false,
                user_type: userMeta.userType || 'candidate',
            })
                .select('id, name, email, phone, avatar, banner, bio, website, is_verified, user_type')
                .single();
            if (insertError) {
                console.error('Insert Error:', insertError);
                return res.status(500).json({ message: 'Error creating user record' });
            }
            userToUse = insertedUser;
        }
        if (!userToUse) {
            return res.status(500).json({ message: 'Failed to sync user data.' });
        }
        req.user = {
            ...userToUse,
            user_metadata: authUser.user_metadata,
            isVerified: userToUse.is_verified,
        };
        return next();
    }
    catch (error) {
        console.error('Auth Middleware Error:', error);
        return res.status(401).json({ message: 'Not authorized, token failed' });
    }
};
exports.protect = protect;
const optionalProtect = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next();
    }
    const token = authHeader.split(' ')[1];
    try {
        const { data: authData, error: authError } = await supabase_1.supabase.auth.getUser(token);
        if (authError || !authData.user) {
            return next();
        }
        const authUser = authData.user;
        const { data: user, error: fetchError } = await supabase_1.supabase
            .from('users')
            .select('id, name, email, phone, avatar, banner, bio, website, is_verified, user_type')
            .eq('id', authUser.id)
            .maybeSingle();
        if (user) {
            req.user = {
                ...user,
                isVerified: user.is_verified,
            };
        }
        return next();
    }
    catch (error) {
        return next();
    }
};
exports.optionalProtect = optionalProtect;
//# sourceMappingURL=auth.middleware.js.map