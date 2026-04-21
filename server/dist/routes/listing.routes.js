"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const listing_controller_1 = require("../controllers/listing.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.post('/', auth_middleware_1.protect, listing_controller_1.createListing);
router.get('/', listing_controller_1.getListings);
router.get('/my', auth_middleware_1.protect, listing_controller_1.getMyListings);
router.get('/recommendations', auth_middleware_1.protect, listing_controller_1.getRecommendations);
router.get('/:id', auth_middleware_1.optionalProtect, listing_controller_1.getListingById);
router.post('/:id/apply', auth_middleware_1.protect, listing_controller_1.applyToListing);
router.put('/:id', auth_middleware_1.protect, listing_controller_1.updateListing);
router.delete('/:id', auth_middleware_1.protect, listing_controller_1.deleteListing);
exports.default = router;
//# sourceMappingURL=listing.routes.js.map