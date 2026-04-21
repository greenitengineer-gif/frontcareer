"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const job_application_controller_1 = require("../controllers/job-application.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.get('/', auth_middleware_1.protect, job_application_controller_1.getJobApplications);
router.get('/:id', auth_middleware_1.protect, job_application_controller_1.getJobApplicationById);
router.patch('/:id/status', auth_middleware_1.protect, job_application_controller_1.updateApplicationStatus);
router.post('/:id/schedule', auth_middleware_1.protect, job_application_controller_1.scheduleInterview);
exports.default = router;
//# sourceMappingURL=job-application.routes.js.map