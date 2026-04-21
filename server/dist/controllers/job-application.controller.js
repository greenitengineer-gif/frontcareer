"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateApplicationStatus = exports.scheduleInterview = exports.getJobApplicationById = exports.getJobApplications = void 0;
const supabase_1 = require("../utils/supabase");
const getJobApplications = async (req, res) => {
    try {
        const { job_id, candidate_id, employer_id } = req.query;
        let query = supabase_1.supabase.from('job_applications').select('*, job:jobs(*), candidate:users!candidate_id(*)');
        if (job_id) {
            query = query.eq('job_id', job_id);
        }
        if (candidate_id) {
            query = query.eq('candidate_id', candidate_id);
        }
        if (employer_id) {
            query = query.eq('employer_id', employer_id);
            // If fetching for employer, sort by match_score descending
            query = query.order('match_score', { ascending: false });
        }
        const { data, error } = await query;
        if (error)
            throw error;
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getJobApplications = getJobApplications;
const getJobApplicationById = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase_1.supabase
            .from('job_applications')
            .select('*, job:jobs(*), candidate:users!candidate_id(*)')
            .eq('id', id)
            .single();
        if (error || !data) {
            return res.status(404).json({ message: 'Анкет олдсонгүй' });
        }
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getJobApplicationById = getJobApplicationById;
const scheduleInterview = async (req, res) => {
    try {
        const { id } = req.params;
        const { date, time, type, location, notes } = req.body;
        const employer = req.user;
        // 1. Check if application exists and belongs to employer
        const { data: application, error: appError } = await supabase_1.supabase
            .from('job_applications')
            .select('*, job:jobs(title)')
            .eq('id', id)
            .eq('employer_id', employer.id)
            .single();
        if (appError || !application) {
            return res.status(404).json({ message: 'Анкет олдсонгүй' });
        }
        // 2. Update application status to scheduled or just add interview details
        // For now, let's assume we store interview info in the job_applications table or a separate one
        // Let's check if there's an 'interviews' table. If not, we might need to add it or store in job_applications
        // For this task, let's assume we update the application status and store interview info in it
        const { error: updateError } = await supabase_1.supabase
            .from('job_applications')
            .update({
            status: 'interview_scheduled',
            interview_date: date,
            interview_time: time,
            interview_type: type,
            interview_location: location,
            interview_notes: notes
        })
            .eq('id', id);
        if (updateError) {
            console.error('Database error during interview scheduling:', updateError);
            if (updateError.code === '42703') { // Undefined column error
                return res.status(500).json({
                    message: 'Өгөгдлийн санд ярилцлагын мэдээлэл хадгалах баганууд дутуу байна. Та Supabase дээр SQL ажиллуулж багануудыг нэмнэ үү.',
                    code: 'MISSING_COLUMNS'
                });
            }
            throw updateError;
        }
        // 3. Create notification for candidate
        await supabase_1.supabase.from('notifications').insert({
            user_id: application.candidate_id,
            title: 'Ярилцлага товлогдлоо',
            message: `Таны "${application.job.title}" ажлын байранд илгээсэн анкетын ярилцлага ${date}-ны ${time} цагт товлогдлоо.`,
            type: 'interview_scheduled',
            link: `/dashboard/activity`
        });
        res.json({ message: 'Ярилцлага амжилттай товлогдлоо' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.scheduleInterview = scheduleInterview;
const updateApplicationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const employer = req.user;
        // 1. Update status
        const { data: application, error: updateError } = await supabase_1.supabase
            .from('job_applications')
            .update({ status })
            .eq('id', id)
            .eq('employer_id', employer.id)
            .select('*, job:jobs(title), candidate:users!candidate_id(name)')
            .single();
        if (updateError || !application) {
            return res.status(404).json({ message: 'Анкет олдсонгүй эсвэл эрх хүрэхгүй байна' });
        }
        // 2. Create notification for candidate
        let title = '';
        let message = '';
        let type = '';
        if (status === 'viewed') {
            title = 'Анкет үзсэн';
            message = `Таны "${application.job.title}" ажлын байранд илгээсэн анкетыг байгууллага үзсэн байна.`;
            type = 'application_viewed';
        }
        else if (status === 'shortlisted') {
            title = 'Анкет тэнцсэн';
            message = `Баяр хүргэе! Та "${application.job.title}" ажлын байрны эхний шатанд тэнцлээ.`;
            type = 'application_shortlisted';
        }
        if (title) {
            await supabase_1.supabase.from('notifications').insert({
                user_id: application.candidate_id,
                title,
                message,
                type,
                link: `/dashboard/activity` // Example link
            });
        }
        res.json({ message: 'Анкетын статус амжилттай шинэчлэгдлээ', application });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateApplicationStatus = updateApplicationStatus;
//# sourceMappingURL=job-application.controller.js.map