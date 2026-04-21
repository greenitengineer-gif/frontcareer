"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = __importDefault(require("http"));
const path_1 = __importDefault(require("path"));
const next_1 = __importDefault(require("next"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const listing_routes_1 = __importDefault(require("./routes/listing.routes"));
const favorite_routes_1 = __importDefault(require("./routes/favorite.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const ai_routes_1 = __importDefault(require("./routes/ai.routes"));
const cv_routes_1 = __importDefault(require("./routes/cv.routes"));
const stats_routes_1 = __importDefault(require("./routes/stats.routes"));
const job_application_routes_1 = __importDefault(require("./routes/job-application.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
dotenv_1.default.config();
const dev = process.env.NODE_ENV !== 'production';
const nextApp = (0, next_1.default)({ dev, dir: path_1.default.join(__dirname, '../../client') });
const handle = nextApp.getRequestHandler();
nextApp.prepare().then(() => {
    const app = (0, express_1.default)();
    const server = http_1.default.createServer(app);
    app.use((0, cors_1.default)());
    app.use(express_1.default.json());
    // API Routes
    app.use('/api/auth', auth_routes_1.default);
    app.use('/api/listings', listing_routes_1.default);
    app.use('/api/favorites', favorite_routes_1.default);
    app.use('/api/admin', admin_routes_1.default);
    app.use('/api/ai', ai_routes_1.default);
    app.use('/api/cv', cv_routes_1.default);
    app.use('/api/stats', stats_routes_1.default);
    app.use('/api/job-applications', job_application_routes_1.default);
    app.use('/api/notifications', notification_routes_1.default);
    // Health check for API
    app.get('/api/health', (req, res) => {
        res.send('Career API is running');
    });
    // Next.js handler for all other routes
    app.all('*', (req, res) => {
        return handle(req, res);
    });
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
        console.log(`Amjilttai aslaa ${PORT}`);
    });
});
//# sourceMappingURL=index.js.map