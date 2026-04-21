"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_middleware_1 = require("../middleware/admin.middleware");
const admin_controller_1 = require("../controllers/admin.controller");
const router = (0, express_1.Router)();
// NOTE: For now we keep stats + listings public so the admin UI works
// even when frontend auth integration is still being adapted.
router.get('/stats', admin_controller_1.getAdminStats);
router.get('/listings', admin_controller_1.getAdminListings);
// Deletion remains admin-only.
router.delete('/listings/:id', auth_middleware_1.protect, admin_middleware_1.requireAdmin, admin_controller_1.deleteAdminListing);
exports.default = router;
//# sourceMappingURL=admin.routes.js.map