"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.post('/register', auth_controller_1.registerUser);
router.post('/login', auth_controller_1.loginUser);
router.get('/me', auth_middleware_1.protect, auth_controller_1.getMe);
router.put('/profile', auth_middleware_1.protect, auth_controller_1.updateProfile);
router.put('/metadata', auth_middleware_1.protect, auth_controller_1.updateAuthMetadata);
router.get('/employers', auth_middleware_1.optionalProtect, auth_controller_1.getEmployers);
router.get('/employers/:id', auth_middleware_1.optionalProtect, auth_controller_1.getEmployerById);
router.post('/employers/:id/follow', auth_middleware_1.protect, auth_controller_1.followEmployer);
router.delete('/employers/:id/follow', auth_middleware_1.protect, auth_controller_1.unfollowEmployer);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map