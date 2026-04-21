"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ai_controller_1 = require("../controllers/ai.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post('/search', ai_controller_1.aiSearch);
router.post('/check-match', auth_middleware_1.protect, ai_controller_1.checkJobMatch);
exports.default = router;
//# sourceMappingURL=ai.routes.js.map