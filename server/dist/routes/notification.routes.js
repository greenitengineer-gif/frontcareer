"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const notification_controller_1 = require("../controllers/notification.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.get('/', auth_middleware_1.protect, notification_controller_1.getNotifications);
router.patch('/:id/read', auth_middleware_1.protect, notification_controller_1.markAsRead);
router.patch('/read-all', auth_middleware_1.protect, notification_controller_1.markAllAsRead);
exports.default = router;
//# sourceMappingURL=notification.routes.js.map