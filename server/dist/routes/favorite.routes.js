"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const favorite_controller_1 = require("../controllers/favorite.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.post('/', auth_middleware_1.protect, favorite_controller_1.toggleFavorite);
router.get('/', auth_middleware_1.protect, favorite_controller_1.getFavorites);
exports.default = router;
//# sourceMappingURL=favorite.routes.js.map