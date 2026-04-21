"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAllAsRead = exports.markAsRead = exports.getNotifications = void 0;
const supabase_1 = require("../utils/supabase");
const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const { data, error } = await supabase_1.supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(20);
        if (error)
            throw error;
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getNotifications = getNotifications;
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { error } = await supabase_1.supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id)
            .eq('user_id', userId);
        if (error)
            throw error;
        res.json({ message: 'Мэдэгдэл уншсан төлөвт орлоо' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.markAsRead = markAsRead;
const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const { error } = await supabase_1.supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', userId)
            .eq('is_read', false);
        if (error)
            throw error;
        res.json({ message: 'Бүх мэдэгдэл уншсан төлөвт орлоо' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.markAllAsRead = markAllAsRead;
//# sourceMappingURL=notification.controller.js.map