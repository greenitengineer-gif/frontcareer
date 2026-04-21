"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const stats_controller_1 = require("../controllers/stats.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get('/public', stats_controller_1.getPublicStats);
router.get('/categories', stats_controller_1.getCategoryStats);
router.get('/candidate', auth_middleware_1.protect, stats_controller_1.getCandidateStats);
router.get('/employer', auth_middleware_1.protect, stats_controller_1.getEmployerStats);
exports.default = router;
//# sourceMappingURL=stats.routes.js.map