import { Request, Response } from 'express';
import { supabase } from '../utils/supabase';
import { calculateMatchScore } from '../utils/ai';
import crypto from 'crypto';

export const getMyListings = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Format like getListings for client
    const formatted = await Promise.all(
      jobs.map(async (j: any) => {
        const [{ count: appsCount }, { count: viewsCount }] = await Promise.all([
          supabase.from('job_applications').select('*', { count: 'exact', head: true }).eq('job_id', j.id),
          supabase.from('job_views').select('*', { count: 'exact', head: true }).eq('job_id', j.id),
        ]);

        return {
          ...j,
          companyName: j.company_name,
          companyLogo: j.company_logo,
          salaryMin: j.salary_min,
          salaryMax: j.salary_max,
          salaryType: j.salary_type,
          jobType: j.job_type,
          userId: j.user_id,
          createdAt: j.created_at,
          applicationsCount: appsCount || 0,
          viewsCount: viewsCount || 0,
        };
      })
    );

    res.json(formatted);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createListing = async (req: Request, res: Response) => {
  try {
    const { 
      title, 
      companyName, 
      companyLogo, 
      description, 
      requirements, 
      salaryMin, 
      salaryMax, 
      salaryType, 
      jobType, 
      category, 
      location,
      latitude,
      longitude,
      experienceLevel,
      careerLevel,
      skills,
      benefits
    } = req.body;
    const user = (req as any).user;

    if (user.user_type !== 'employer') {
      return res.status(403).json({ message: 'Зөвхөн ажил олгогч (Байгууллага) зар оруулах эрхтэй.' });
    }

    const userId = user.id; 
    const jobId = crypto.randomUUID();

    const { data: job, error } = await supabase
      .from('jobs')
      .insert([
        { 
          id: jobId, 
          title, 
          company_name: companyName, 
          company_logo: companyLogo, 
          description, 
          requirements, 
          salary_min: salaryMin, 
          salary_max: salaryMax, 
          salary_type: salaryType, 
          job_type: jobType, 
          category, 
          location, 
          latitude: latitude || null,
          longitude: longitude || null,
          experience_level: experienceLevel,
          career_level: careerLevel,
          skills,
          benefits,
          user_id: userId 
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(job);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'IT_SOFTWARE': [
    'developer','software','programmer','frontend','back-end','backend','fullstack','full-stack',
    'react','next','node','typescript','javascript','java','python','golang','c#','c++','php',
    'mobile','android','ios','flutter','react native','devops','sre','qa','tester','ui','ux','design','designer'
  ],
  'FINANCE_ACCOUNTING': [
    'finance','accountant','accounting','audit','auditor','tax','bank','loan','credit','insurance','даатгал','бүртгэл','нягтлан'
  ],
  'SALES_MARKETING': [
    'sales','marketing','content','seo','smm','b2b','b2c','борлуулалт','маркетинг'
  ],
  'ADMIN_HR': [
    'hr','human resources','recruiter','office manager','assistant','coordinator','бичиг хэрэг','захиргаа','хүний нөөц'
  ],
  'SERVICE_HOSPITALITY': [
    'waiter','reception','barista','cook','chef','зочид буудал','улаанбурхан','үйлчилгээ','restaurant','hotel','hospitality'
  ],
  'ENGINEERING_CONSTRUCTION': [
    'engineer','civil','mechanical','electrical','construction','plant','mining','barilga','инженер','барилга','уурхай'
  ],
  'LOGISTICS_TRANSPORT': [
    'logistics','transport','driver','warehouse','inventory','delivery','fulfillment','агуулах','логистик','тээвэр'
  ],
  'HEALTHCARE_PHARMACY': [
    'doctor','nurse','pharmacy','pharmacist','эмч','эмнэлэг','эм зүй','эм найруулагч'
  ],
  'EDUCATION_SOCIAL': [
    'teacher','trainer','instructor','education','social','сургалт','багш','нийгмийн'
  ],
};

const inferCategoryFromCV = (cv: any): string | '' => {
  try {
    const bagOfWords = [
      cv.summary || '',
      ...(Array.isArray(cv.cv_skills) ? cv.cv_skills.map((s: any) => s.skill_name || '') : []),
      ...(Array.isArray(cv.experience) ? cv.experience.flatMap((e: any) => [e.position || '', e.company || '', e.description || '']) : []),
      ...(Array.isArray(cv.education) ? cv.education.flatMap((e: any) => [e.degree || '', e.institution || '']) : []),
    ].join(' ').toLowerCase();

    let bestCat = '';
    let bestScore = 0;
    for (const [cat, kws] of Object.entries(CATEGORY_KEYWORDS)) {
      let sc = 0;
      for (const kw of kws) {
        if (!kw) continue;
        if (bagOfWords.includes(kw)) sc += 1;
      }
      if (sc > bestScore) {
        bestScore = sc;
        bestCat = cat;
      }
    }
    // require minimal signal
    return bestScore >= 2 ? bestCat : '';
  } catch {
    return '';
  }
};

export const getRecommendations = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const limit = parseInt((req.query.limit as string) || '8', 10);
    let category = (req.query.category as string) || '';
    const jobType = (req.query.jobType as string) || '';
    const minSalary = req.query.minSalary ? parseFloat(req.query.minSalary as string) : undefined;
    const maxSalary = req.query.maxSalary ? parseFloat(req.query.maxSalary as string) : undefined;
    const location = (req.query.location as string) || '';

    // Load user's CV with skills, languages, experience
    const { data: cv, error: cvError } = await supabase
      .from('cvs')
      .select(`
        id, summary, address, expected_salary, gender,
        education(*),
        experience(*),
        cv_skills(*),
        cv_languages(*)
      `)
      .eq('user_id', user.id)
      .single();

    if (cvError) {
      return res.status(200).json([]); // No CV → no recommendations
    }

    // Auto-infer category from CV if not provided
    if (!category) {
      const inferred = inferCategoryFromCV(cv);
      if (inferred) category = inferred;
    }

    // Fetch recent jobs
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (jobsError || !jobs) {
      return res.status(200).json([]);
    }

    const skills: string[] = (cv.cv_skills || []).map((s: any) => (s.skill_name || '').toLowerCase()).filter(Boolean);
    const languages: string[] = (cv.cv_languages || []).map((l: any) => (l.language_name || '').toLowerCase()).filter(Boolean);
    const positions: string[] = (cv.experience || []).map((e: any) => (e.position || '').toLowerCase()).filter(Boolean);
    const companies: string[] = (cv.experience || []).map((e: any) => (e.company || '').toLowerCase()).filter(Boolean);
    const address: string = (cv.address || '').toLowerCase();

    const tokenize = (text: string) =>
      text
        .toLowerCase()
        .replace(/[^a-zA-Z0-9\u0400-\u04FF\s]/g, ' ')
        .split(/\s+/)
        .filter(Boolean);

    const scoreJob = (job: any) => {
      const corpus = `${job.title || ''} ${job.description || ''} ${job.requirements || ''}`.toLowerCase();
      const tokens = new Set(tokenize(corpus));

      let score = 0;

      // Skills match
      for (const s of skills) {
        if (!s) continue;
        if (tokens.has(s) || corpus.includes(s)) score += 3;
      }

      // Position/title similarity
      for (const p of positions) {
        if (!p) continue;
        if (corpus.includes(p)) score += 2;
      }

      // Company mention (rare but adds signal)
      for (const c of companies) {
        if (!c) continue;
        if (corpus.includes(c)) score += 1;
      }

      // Language presence
      for (const lang of languages) {
        if (!lang) continue;
        if (corpus.includes(lang)) score += 1;
      }

      // Location hint
      if (address) {
        if ((job.location || '').toLowerCase().includes(address)) score += 1;
      }

      // Recency bonus
      const createdAt = job.created_at ? new Date(job.created_at) : new Date();
      const daysSince = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince <= 7) score += 1;

      return score;
    };

    const preFiltered = jobs.filter((j: any) => {
      if (category && j.category !== category) return false;
      if (jobType && j.job_type !== jobType) return false;
      if (typeof minSalary === 'number' && j.salary_min && j.salary_min < minSalary) return false;
      if (typeof maxSalary === 'number' && j.salary_max && j.salary_max > maxSalary) return false;
      if (location && !(j.location || '').toLowerCase().includes(location.toLowerCase())) return false;
      return true;
    });

    const scored = preFiltered
      .map((j) => ({ job: j, score: scoreJob(j) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ job }) => job);

    // Format like getListings for client
    const formatted = await Promise.all(
      scored.map(async (j: any) => {
        const [{ count: appsCount }, { count: viewsCount }] = await Promise.all([
          supabase.from('job_applications').select('*', { count: 'exact', head: true }).eq('job_id', j.id),
          supabase.from('job_views').select('*', { count: 'exact', head: true }).eq('job_id', j.id),
        ]);

        return {
          ...j,
          companyName: j.company_name,
          companyLogo: j.company_logo,
          salaryMin: j.salary_min,
          salaryMax: j.salary_max,
          salaryType: j.salary_type,
          jobType: j.job_type,
          userId: j.user_id,
          createdAt: j.created_at,
          applicationsCount: appsCount || 0,
          viewsCount: viewsCount || 0,
        };
      })
    );

    res.json(formatted);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const applyToListing = async (req: Request, res: Response) => {
  try {
    const jobId = req.params.id as string;
    const { cv_id: cvId } = req.body;
    const candidate = (req as any).user;

    // 1. Get job details to find the employer
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('user_id, title')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return res.status(404).json({ message: 'Ажлын байр олдсонгүй' });
    }

    const employerId = job.user_id;

    // Prevent employer from applying to their own job
    if (candidate.id === employerId) {
      return res.status(400).json({ message: 'Та өөрийнхөө зар дээр анкет илгээх боломжгүй' });
    }

    // 2. Calculate AI Match Score if CV is provided
    let matchScore = 0;
    if (cvId) {
      const result = await calculateMatchScore(jobId, cvId);
      matchScore = result.score || 0;
    }

    // 3. Create a job application record
    const { data: application, error: appError } = await supabase
      .from('job_applications')
      .insert({
        job_id: jobId,
        candidate_id: candidate.id,
        employer_id: employerId,
        cv_id: cvId,
        match_score: matchScore
      })
      .select()
      .single();

    if (appError) {
      // Handle unique constraint violation (already applied)
      if (appError.code === '23505') {
        return res.status(409).json({ message: 'Та энэ ажлын байранд аль хэдийн анкет илгээсэн байна' });
      }
      throw appError;
    }

    // 3. Create a notification for the employer
    const candidateName = candidate.user_metadata?.name || 'Нэгэн хэрэглэгч';
    await supabase.from('notifications').insert({
      user_id: employerId,
      title: 'Шинэ анкет ирлээ',
      message: `${candidateName} таны "${job.title}" ажлын байранд анкет илгээлээ.`,
      type: 'new_application',
      link: `/dashboard/applications?job_id=${jobId}`
    });

    // 4. Send an automated message in the chat
    const messageText = `Сайн байна уу, би танай "${job.title}" ажлын байранд анкет илгээлээ.`;
    const { error: messageError } = await supabase
      .from('messages')
      .insert({
        id: crypto.randomUUID(),
        text: messageText,
        sender_id: candidate.id,
        receiver_id: employerId,
        job_id: jobId,
      });

    if (messageError) {
      // Log the error but don't fail the whole request, as the application itself was successful
      console.error('Failed to send automated chat message:', messageError);
    }

    res.status(201).json({ 
      message: 'Анкет амжилттай илгээгдлээ',
      application,
      chatRoomId: `${jobId}_${candidate.id}` // Construct a potential chat room ID
    });

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getListings = async (req: Request, res: Response) => {
  try {
    const { category, search, minSalary, maxSalary, location, sort, userId, user_id, jobType, lat, lng, radius } = req.query;

    let query = supabase
      .from('jobs')
      .select('*, user:users(id, name, avatar, banner, is_verified)');

    const ownerId = (userId || user_id) as string | undefined;
    if (ownerId) {
      query = query.eq('user_id', ownerId);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (jobType) {
      query = query.eq('job_type', jobType);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,company_name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (minSalary) {
      query = query.gte('salary_min', parseFloat(minSalary as string));
    }

    if (maxSalary) {
      query = query.lte('salary_max', parseFloat(maxSalary as string));
    }

    if (location) {
      query = query.ilike('location', `%${location}%`);
    }

    if (sort === 'newest') query = query.order('created_at', { ascending: false });
    else query = query.order('created_at', { ascending: false });

    const { data: jobs, error } = await query;

    if (error) throw error;

    // Filter by distance if coordinates and radius are provided
    let filteredByDistance = jobs || [];
    if (lat && lng && radius) {
      const userLat = parseFloat(lat as string);
      const userLng = parseFloat(lng as string);
      const searchRadius = parseFloat(radius as string);

      filteredByDistance = (jobs || []).filter((job: any) => {
        if (!job.latitude || !job.longitude) return false;
        
        const distance = calculateDistance(userLat, userLng, job.latitude, job.longitude);
        return distance <= searchRadius;
      });
    }

    // Enrich with counts similar to lambda-style badges
    const formattedJobs = await Promise.all(
      filteredByDistance.map(async (j: any) => {
        const [{ count: appsCount }, { count: viewsCount }] = await Promise.all([
          supabase.from('job_applications').select('*', { count: 'exact', head: true }).eq('job_id', j.id),
          supabase.from('job_views').select('*', { count: 'exact', head: true }).eq('job_id', j.id)
        ]);

        const createdAt = j.created_at ? new Date(j.created_at) : new Date();
        const daysSince = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
        const isNew = daysSince <= 7;
        const isHot = (appsCount || 0) >= 10 || (viewsCount || 0) >= 50;

        return {
          ...j,
          companyName: j.user?.name || j.company_name,
          companyLogo: j.user?.avatar || j.company_logo,
          companyBanner: j.user?.banner,
          salaryMin: j.salary_min,
          salaryMax: j.salary_max,
          salaryType: j.salary_type,
          jobType: j.job_type,
          experienceLevel: j.experience_level,
          careerLevel: j.career_level,
          userId: j.user_id,
          createdAt: j.created_at,
          applicationsCount: appsCount || 0,
          viewsCount: viewsCount || 0,
          isNew,
          isHot,
          user: j.user
            ? {
                ...j.user,
                isVerified: j.user.is_verified
              }
            : null
        };
      })
    );

    res.json(formattedJobs);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to calculate distance between two coordinates in km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const getListingById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const viewerId = (req as any).user?.id;

    const { data: job, error } = await supabase
      .from('jobs')
      .select('*, user:users(id, name, email, phone, avatar, banner, is_verified, created_at)')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return res.status(404).json({ message: 'Job not found' });
      throw error;
    }

    // Record view if viewer is not the owner
    if (viewerId !== job.user_id) {
      await supabase
        .from('job_views')
        .upsert({
          job_id: id,
          viewer_id: viewerId || null,
          viewed_at: new Date().toISOString(),
        }, { onConflict: 'job_id,viewer_id' });
    }

    // Count stats
    const [{ count: applicationsCount }, { count: viewsCount }] = await Promise.all([
      supabase.from('job_applications').select('*', { count: 'exact', head: true }).eq('job_id', id),
      supabase.from('job_views').select('*', { count: 'exact', head: true }).eq('job_id', id)
    ]);

    const formattedJob = {
      ...job,
      // Prioritize current user data for company info, fallback to stored job data
      companyName: job.user?.name || job.company_name,
      companyLogo: job.user?.avatar || job.company_logo,
      companyBanner: job.user?.banner,
      salaryMin: job.salary_min,
      salaryMax: job.salary_max,
      salaryType: job.salary_type,
      jobType: job.job_type,
      experienceLevel: job.experience_level,
      careerLevel: job.career_level,
      userId: job.user_id,
      createdAt: job.created_at,
      applicationsCount: applicationsCount || 0,
      viewsCount: viewsCount || 0,
      user: job.user ? {
        ...job.user,
        isVerified: job.user.is_verified,
        createdAt: job.user.created_at
      } : null
    };

    res.json(formattedJob);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateListing = async (req: Request, res: Response) => {
  try {
    const { 
      title, 
      companyName, 
      companyLogo, 
      description, 
      requirements, 
      salaryMin, 
      salaryMax, 
      salaryType, 
      jobType, 
      category, 
      location,
      experienceLevel,
      careerLevel,
      skills,
      benefits
    } = req.body;
    const userId = (req as any).user.id;

    const { data: existingJob, error: fetchError } = await supabase
      .from('jobs')
      .select('user_id')
      .eq('id', req.params.id)
      .single();

    if (!existingJob) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (existingJob.user_id !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { data: updatedJob, error: updateError } = await supabase
      .from('jobs')
      .update({ 
        title, 
        company_name: companyName, 
        company_logo: companyLogo, 
        description, 
        requirements, 
        salary_min: salaryMin, 
        salary_max: salaryMax, 
        salary_type: salaryType, 
        job_type: jobType, 
        category, 
        location,
        experience_level: experienceLevel,
        career_level: careerLevel,
        skills,
        benefits
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateError) throw updateError;

    res.json(updatedJob);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteListing = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const { data: existingJob, error: fetchError } = await supabase
      .from('jobs')
      .select('user_id')
      .eq('id', req.params.id)
      .single();

    if (!existingJob) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (existingJob.user_id !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { error: deleteError } = await supabase
      .from('jobs')
      .delete()
      .eq('id', req.params.id);

    if (deleteError) throw deleteError;

    res.json({ message: 'Job removed' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
