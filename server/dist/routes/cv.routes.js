"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cv_controller_1 = require("../controllers/cv.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.get('/', auth_middleware_1.protect, cv_controller_1.getAllUserCVs);
router.post('/set-primary', auth_middleware_1.protect, cv_controller_1.setPrimaryCV);
router.get('/public', auth_middleware_1.optionalProtect, cv_controller_1.getPublicCVs);
router.get('/my', auth_middleware_1.protect, cv_controller_1.getMyCV);
router.post('/my', auth_middleware_1.protect, cv_controller_1.updateCV);
router.get('/user/:userId', auth_middleware_1.optionalProtect, cv_controller_1.getCVByUserId);
router.get('/:id', auth_middleware_1.optionalProtect, cv_controller_1.getCV);
exports.default = router;
//# sourceMappingURL=cv.routes.js.map