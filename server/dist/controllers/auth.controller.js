"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unfollowEmployer = exports.followEmployer = exports.updateAuthMetadata = exports.updateProfile = exports.getMe = exports.getEmployerById = exports.getEmployers = exports.loginUser = exports.registerUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const supabase_1 = require("../utils/supabase");
const generateToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
        expiresIn: '30d',
    });
};
const registerUser = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        // Check if user exists using Supabase
        const { data: existingUser, error: fetchError } = await supabase_1.supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const userId = crypto.randomUUID();
        // Insert user into Supabase
        const { error: insertError } = await supabase_1.supabase
            .from('users')
            .insert([
            { id: userId, name, email, password: hashedPassword, phone }
        ]);
        if (insertError)
            throw insertError;
        res.status(201).json({
            id: userId,
            name,
            email,
            token: generateToken(userId),
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.registerUser = registerUser;
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const { data: user, error: fetchError } = await supabase_1.supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();
        if (user && (await bcryptjs_1.default.compare(password, user.password))) {
            res.json({
                id: user.id,
                name: user.name,
                email: user.email,
                token: generateToken(user.id),
            });
        }
        else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.loginUser = loginUser;
const getEmployers = async (req, res) => {
    try {
        const currentUserId = req.user?.id;
        const { data: employers, error } = await supabase_1.supabase
            .from('users')
            .select('id, name, email, phone, avatar, is_verified, created_at, user_type, industry, bio')
            .eq('user_type', 'employer')
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        // Fetch job counts and follower counts for each employer
        const employerWithStats = await Promise.all((employers || []).map(async (emp) => {
            const [{ count: jobCount }, { count: followersCount }, { data: isFollowing }] = await Promise.all([
                supabase_1.supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('user_id', emp.id),
                supabase_1.supabase.from('followers').select('*', { count: 'exact', head: true }).eq('employer_id', emp.id),
                currentUserId
                    ? supabase_1.supabase.from('followers').select('*').eq('employer_id', emp.id).eq('follower_id', currentUserId).maybeSingle()
                    : Promise.resolve({ data: null })
            ]);
            return {
                id: emp.id,
                name: emp.name,
                email: emp.email,
                phone: emp.phone,
                avatar: emp.avatar,
                industry: emp.industry,
                bio: emp.bio,
                isVerified: emp.is_verified,
                createdAt: emp.created_at,
                userType: emp.user_type,
                jobCount: jobCount || 0,
                followersCount: followersCount || 0,
                isFollowing: !!isFollowing,
            };
        }));
        res.json(employerWithStats);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getEmployers = getEmployers;
const getEmployerById = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserId = req.user?.id;
        const { data: employer, error } = await supabase_1.supabase
            .from('users')
            .select('id, name, email, phone, avatar, banner, bio, website, address, employee_count, industry, founded_year, facebook_url, linkedin_url, twitter_url, is_verified, created_at, user_type')
            .eq('id', id)
            .eq('user_type', 'employer')
            .maybeSingle();
        if (error) {
            console.error('Error fetching employer:', error);
            const { data: fallbackEmp, error: fallbackError } = await supabase_1.supabase
                .from('users')
                .select('id, name, email, phone, avatar, banner, bio, website, address, employee_count, industry, founded_year, facebook_url, linkedin_url, twitter_url, is_verified, created_at, user_type')
                .eq('id', id)
                .eq('user_type', 'employer')
                .maybeSingle();
            if (fallbackError)
                throw fallbackError;
            if (!fallbackEmp)
                return res.status(404).json({ message: 'Employer not found' });
            return handleEmployerData(fallbackEmp, res, currentUserId);
        }
        if (!employer)
            return res.status(404).json({ message: 'Employer not found' });
        return handleEmployerData(employer, res, currentUserId);
    }
    catch (error) {
        console.error('Internal Server Error in getEmployerById:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.getEmployerById = getEmployerById;
const handleEmployerData = async (employer, res, currentUserId) => {
    try {
        const [{ data: jobs, error: jobsError }, { count: followersCount }, { data: isFollowing }] = await Promise.all([
            supabase_1.supabase.from('jobs').select('*').eq('user_id', employer.id).order('created_at', { ascending: false }),
            supabase_1.supabase.from('followers').select('*', { count: 'exact', head: true }).eq('employer_id', employer.id),
            currentUserId
                ? supabase_1.supabase.from('followers').select('*').eq('employer_id', employer.id).eq('follower_id', currentUserId).maybeSingle()
                : Promise.resolve({ data: null })
        ]);
        if (jobsError)
            throw jobsError;
        const formattedJobs = jobs?.map((j) => ({
            ...j,
            companyName: j.company_name,
            companyLogo: j.company_logo,
            salaryMin: j.salary_min,
            salaryMax: j.salary_max,
            salaryType: j.salary_type,
            jobType: j.job_type,
            createdAt: j.created_at,
        }));
        res.json({
            ...employer,
            isVerified: employer.is_verified,
            createdAt: employer.created_at,
            address: employer.address,
            employeeCount: employer.employee_count,
            industry: employer.industry,
            foundedYear: employer.founded_year,
            facebookUrl: employer.facebook_url,
            linkedinUrl: employer.linkedin_url,
            twitterUrl: employer.twitter_url,
            jobs: formattedJobs || [],
            followersCount: followersCount || 0,
            isFollowing: !!isFollowing,
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const getMe = async (req, res) => {
    try {
        const userId = req.user.id;
        const { data: user, error: fetchError } = await supabase_1.supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();
        if (fetchError)
            throw fetchError;
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getMe = getMe;
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, phone, avatar, banner, bio, website, address, employeeCount, industry, foundedYear, facebook, linkedin, twitter } = req.body;
        // 1. Update public.users table
        const { data, error } = await supabase_1.supabase
            .from('users')
            .update({
            name,
            phone,
            avatar,
            banner,
            bio,
            website,
            address,
            employee_count: employeeCount,
            industry,
            founded_year: foundedYear,
            facebook_url: facebook,
            linkedin_url: linkedin,
            twitter_url: twitter,
            updated_at: new Date().toISOString(),
        })
            .eq('id', userId)
            .select()
            .single();
        if (error)
            throw error;
        // 2. Update Supabase Auth metadata to keep them in sync
        const currentMetadata = req.user.user_metadata || {};
        const { error: authError } = await supabase_1.supabase.auth.admin.updateUserById(userId, {
            user_metadata: {
                ...currentMetadata,
                name,
                companyName: name,
                phone,
                avatar,
                banner,
                bio,
                website,
                address,
                employeeCount,
                industry,
                foundedYear,
                facebook,
                linkedin,
                twitter,
                userType: req.user.user_type || 'employer'
            }
        });
        if (authError) {
            console.error('Error updating auth metadata:', authError);
            // We don't throw here because the main table is already updated
        }
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateProfile = updateProfile;
const updateAuthMetadata = async (req, res) => {
    try {
        const userId = req.user.id;
        const newMetadata = req.body;
        const currentMetadata = req.user.user_metadata || {};
        const { data, error } = await supabase_1.supabase.auth.admin.updateUserById(userId, {
            user_metadata: {
                ...currentMetadata,
                ...newMetadata
            }
        });
        if (error)
            throw error;
        res.json({ message: 'Metadata updated successfully', data });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateAuthMetadata = updateAuthMetadata;
const followEmployer = async (req, res) => {
    try {
        const employerId = req.params.id;
        const followerId = req.user.id;
        if (employerId === followerId) {
            return res.status(400).json({ message: 'Та өөрийгөө дагах боломжгүй' });
        }
        const { error } = await supabase_1.supabase
            .from('followers')
            .insert([{ employer_id: employerId, follower_id: followerId }]);
        if (error) {
            if (error.code === '23505') {
                return res.status(400).json({ message: 'Та аль хэдийн дагасан байна' });
            }
            throw error;
        }
        // Create a notification for the employer
        const followerName = req.user.user_metadata?.name || 'Нэгэн хэрэглэгч';
        await supabase_1.supabase.from('notifications').insert({
            user_id: employerId,
            title: 'Шинэ дагагчтай боллоо',
            message: `${followerName} танай байгууллагыг дагаж эхэллээ.`,
            type: 'new_follower',
            link: `/candidates/${followerId}`
        });
        res.json({ message: 'Амжилттай дагалаа' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.followEmployer = followEmployer;
const unfollowEmployer = async (req, res) => {
    try {
        const employerId = req.params.id;
        const followerId = req.user.id;
        const { error } = await supabase_1.supabase
            .from('followers')
            .delete()
            .eq('employer_id', employerId)
            .eq('follower_id', followerId);
        if (error)
            throw error;
        res.json({ message: 'Дагахаа болилоо' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.unfollowEmployer = unfollowEmployer;
//# sourceMappingURL=auth.controller.js.map