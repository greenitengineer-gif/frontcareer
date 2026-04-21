import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../utils/supabase';

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if user exists using Supabase
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID();

    // Insert user into Supabase
    const { error: insertError } = await supabase
      .from('users')
      .insert([
        { id: userId, name, email, password: hashedPassword, phone }
      ]);

    if (insertError) throw insertError;

    res.status(201).json({
      id: userId,
      name,
      email,
      token: generateToken(userId),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getEmployers = async (req: Request, res: Response) => {
  try {
    const currentUserId = (req as any).user?.id;
    
    const { data: employers, error } = await supabase
      .from('users')
      .select('id, name, email, phone, avatar, is_verified, created_at, user_type, industry, bio')
      .eq('user_type', 'employer')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Fetch job counts and follower counts for each employer
    const employerWithStats = await Promise.all(
      (employers || []).map(async (emp: any) => {
        const [
          { count: jobCount },
          { count: followersCount },
          { data: isFollowing }
        ] = await Promise.all([
          supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('user_id', emp.id),
          supabase.from('followers').select('*', { count: 'exact', head: true }).eq('employer_id', emp.id),
          currentUserId 
            ? supabase.from('followers').select('*').eq('employer_id', emp.id).eq('follower_id', currentUserId).maybeSingle()
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
      })
    );

    res.json(employerWithStats);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getEmployerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const currentUserId = (req as any).user?.id;
    
    const { data: employer, error } = await supabase
      .from('users')
      .select('id, name, email, phone, avatar, banner, bio, website, address, employee_count, industry, founded_year, facebook_url, linkedin_url, twitter_url, is_verified, created_at, user_type')
      .eq('id', id)
      .eq('user_type', 'employer')
      .maybeSingle();

    if (error) {
      console.error('Error fetching employer:', error);
      const { data: fallbackEmp, error: fallbackError } = await supabase
        .from('users')
        .select('id, name, email, phone, avatar, banner, bio, website, address, employee_count, industry, founded_year, facebook_url, linkedin_url, twitter_url, is_verified, created_at, user_type')
        .eq('id', id)
        .eq('user_type', 'employer')
        .maybeSingle();
      
      if (fallbackError) throw fallbackError;
      if (!fallbackEmp) return res.status(404).json({ message: 'Employer not found' });
      
      return handleEmployerData(fallbackEmp, res, currentUserId);
    }

    if (!employer) return res.status(404).json({ message: 'Employer not found' });
    return handleEmployerData(employer, res, currentUserId);

  } catch (error: any) {
    console.error('Internal Server Error in getEmployerById:', error);
    res.status(500).json({ message: error.message });
  }
};

const handleEmployerData = async (employer: any, res: Response, currentUserId?: string) => {
  try {
    const [
      { data: jobs, error: jobsError },
      { count: followersCount },
      { data: isFollowing }
    ] = await Promise.all([
      supabase.from('jobs').select('*').eq('user_id', employer.id).order('created_at', { ascending: false }),
      supabase.from('followers').select('*', { count: 'exact', head: true }).eq('employer_id', employer.id),
      currentUserId 
        ? supabase.from('followers').select('*').eq('employer_id', employer.id).eq('follower_id', currentUserId).maybeSingle()
        : Promise.resolve({ data: null })
    ]);

    if (jobsError) throw jobsError;

    const formattedJobs = jobs?.map((j: any) => ({
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
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError) throw fetchError;

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { 
      name, 
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
      twitter
    } = req.body;

    // 1. Update public.users table
    const { data, error } = await supabase
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

    if (error) throw error;

    // 2. Update Supabase Auth metadata to keep them in sync
    const currentMetadata = (req as any).user.user_metadata || {};
    const { error: authError } = await supabase.auth.admin.updateUserById(
      userId,
      { 
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
          userType: (req as any).user.user_type || 'employer'
        } 
      }
    );

    if (authError) {
      console.error('Error updating auth metadata:', authError);
      // We don't throw here because the main table is already updated
    }

    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAuthMetadata = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const newMetadata = req.body;
    const currentMetadata = (req as any).user.user_metadata || {};

    const { data, error } = await supabase.auth.admin.updateUserById(
      userId,
      { 
        user_metadata: {
          ...currentMetadata,
          ...newMetadata
        } 
      }
    );

    if (error) throw error;
    res.json({ message: 'Metadata updated successfully', data });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const followEmployer = async (req: Request, res: Response) => {
  try {
    const employerId = req.params.id;
    const followerId = (req as any).user.id;

    if (employerId === followerId) {
      return res.status(400).json({ message: 'Та өөрийгөө дагах боломжгүй' });
    }

    const { error } = await supabase
      .from('followers')
      .insert([{ employer_id: employerId, follower_id: followerId }]);

    if (error) {
      if (error.code === '23505') {
        return res.status(400).json({ message: 'Та аль хэдийн дагасан байна' });
      }
      throw error;
    }

    // Create a notification for the employer
    const followerName = (req as any).user.user_metadata?.name || 'Нэгэн хэрэглэгч';
    await supabase.from('notifications').insert({
      user_id: employerId,
      title: 'Шинэ дагагчтай боллоо',
      message: `${followerName} танай байгууллагыг дагаж эхэллээ.`,
      type: 'new_follower',
      link: `/candidates/${followerId}`
    });

    res.json({ message: 'Амжилттай дагалаа' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const unfollowEmployer = async (req: Request, res: Response) => {
  try {
    const employerId = req.params.id;
    const followerId = (req as any).user.id;

    const { error } = await supabase
      .from('followers')
      .delete()
      .eq('employer_id', employerId)
      .eq('follower_id', followerId);

    if (error) throw error;

    res.json({ message: 'Дагахаа болилоо' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
