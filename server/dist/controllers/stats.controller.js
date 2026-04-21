"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmployerStats = exports.getCategoryStats = exports.getPublicStats = exports.getCandidateStats = void 0;
const supabase_1 = require("../utils/supabase");
const getCandidateStats = async (req, res) => {
    try {
        const userId = req.user.id;
        // Get user's CV id
        const { data: cv, error: cvError } = await supabase_1.supabase
            .from('cvs')
            .select('id')
            .eq('user_id', userId)
            .single();
        if (cvError || !cv) {
            return res.json({ cvViews: 0, applications: 0 });
        }
        // Count CV views
        const { count: cvViews, error: viewsError } = await supabase_1.supabase
            .from('cv_views')
            .select('*', { count: 'exact', head: true })
            .eq('cv_id', cv.id);
        // Count job applications
        const { count: applications, error: appsError } = await supabase_1.supabase
            .from('job_applications')
            .select('*', { count: 'exact', head: true })
            .eq('candidate_id', userId);
        // Count favorites
        const { count: favorites, error: favError } = await supabase_1.supabase
            .from('favorites')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);
        if (viewsError || appsError || favError) {
            throw viewsError || appsError || favError;
        }
        res.json({
            cvViews: cvViews || 0,
            applications: applications || 0,
            favorites: favorites || 0,
            offers: 0, // Placeholder
            follows: 0, // Placeholder
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getCandidateStats = getCandidateStats;
const getPublicStats = async (req, res) => {
    try {
        const [{ count: jobCount }, { count: companyCount }, { count: cvCount }] = await Promise.all([
            supabase_1.supabase.from('jobs').select('*', { count: 'exact', head: true }),
            supabase_1.supabase.from('users').select('*', { count: 'exact', head: true }).eq('user_type', 'employer'),
            supabase_1.supabase.from('cvs').select('*', { count: 'exact', head: true })
        ]);
        res.json({
            jobCount: jobCount || 0,
            companyCount: companyCount || 0,
            cvCount: cvCount || 0
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getPublicStats = getPublicStats;
const getCategoryStats = async (req, res) => {
    try {
        const { data: jobs, error } = await supabase_1.supabase
            .from('jobs')
            .select('category');
        if (error)
            throw error;
        const stats = {};
        jobs?.forEach((job) => {
            stats[job.category] = (stats[job.category] || 0) + 1;
        });
        res.json(stats);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getCategoryStats = getCategoryStats;
const getEmployerStats = async (req, res) => {
    try {
        const userId = req.user.id;
        // Get employer's job IDs
        const { data: jobs, error: jobsError } = await supabase_1.supabase
            .from('jobs')
            .select('id')
            .eq('user_id', userId);
        if (jobsError) {
            throw jobsError;
        }
        const jobIds = jobs?.map(job => job.id) || [];
        if (jobIds.length === 0) {
            return res.json({ totalViews: 0, applications: 0, jobCount: 0 });
        }
        // Count total job applications for all jobs
        const { count: applications, error: appsError } = await supabase_1.supabase
            .from('job_applications')
            .select('*', { count: 'exact', head: true })
            .in('job_id', jobIds);
        // Count total job views for all jobs
        const { count: totalViews, error: viewsError } = await supabase_1.supabase
            .from('job_views')
            .select('*', { count: 'exact', head: true })
            .in('job_id', jobIds);
        if (appsError || viewsError) {
            throw appsError || viewsError;
        }
        // Count saved CVs
        const { count: savedCVs } = await supabase_1.supabase
            .from('saved_cvs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);
        // Count followers
        const { count: followers } = await supabase_1.supabase
            .from('follows')
            .select('*', { count: 'exact', head: true })
            .eq('following_id', userId);
        res.json({
            totalViews: totalViews || 0,
            applications: applications || 0,
            jobCount: jobIds.length,
            savedCVs: savedCVs || 0,
            followers: followers || 0
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getEmployerStats = getEmployerStats;
//# sourceMappingURL=stats.controller.js.map