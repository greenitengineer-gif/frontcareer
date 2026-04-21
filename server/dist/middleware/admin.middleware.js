"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = void 0;
const supabase_1 = require("../utils/supabase");
const parseListEnv = (value) => (value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
const requireAdmin = async (req, res, next) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: 'Not authorized' });
    }
    if (!user.id) {
        return res.status(401).json({ message: 'Not authorized' });
    }
    // Check admin approval via Supabase table `admin_requests`
    // to avoid relying on `users.is_admin` (which may not be populated yet).
    const { data, error } = await supabase_1.supabase
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
exports.requireAdmin = requireAdmin;
//# sourceMappingURL=admin.middleware.js.map