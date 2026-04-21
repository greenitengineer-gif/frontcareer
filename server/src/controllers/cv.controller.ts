import { Request, Response } from 'express';
import { supabase } from '../utils/supabase';
import crypto from 'crypto';

const mapLanguageLevelFromServer = (level: string | null | undefined) => {
  if (!level) return undefined;
  if (level === 'elementary') return 'basic';
  if (level === 'intermediate') return 'intermediate';
  if (level === 'upper_intermediate') return 'fluent';
  if (level === 'advanced') return 'fluent';
  if (level === 'native') return 'native';
  return 'basic';
};

const normalizeDateInput = (value: unknown) => {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'string') return value as any;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^\d{4}-\d{2}$/.test(trimmed)) return `${trimmed}-01`;
  return trimmed;
};

const formatCVForFrontend = (cv: any) => {
  const education = Array.isArray(cv.education) ? cv.education : [];
  const experience = Array.isArray(cv.experience) ? cv.experience : [];
  const cvSkills = Array.isArray(cv.cv_skills) ? cv.cv_skills : [];
  const cvLanguages = Array.isArray(cv.cv_languages) ? cv.cv_languages : [];
  const certificates = Array.isArray(cv.certificates) ? cv.certificates : [];
  const projects = Array.isArray(cv.projects) ? cv.projects : [];
  const awards = Array.isArray(cv.awards) ? cv.awards : [];
  const volunteers = Array.isArray(cv.volunteers) ? cv.volunteers : [];
  const hobbies = Array.isArray(cv.hobbies) ? cv.hobbies : [];
  const memberships = Array.isArray(cv.memberships) ? cv.memberships : [];

  const user = cv.user || {};
  const fullName = user.name || '';
  const nameParts = fullName.trim().split(/\s+/);
  
  // In Mongolia, usually "Lastname Firstname" or just "Firstname"
  let firstName = '';
  let lastName = '';
  
  if (nameParts.length >= 2) {
    lastName = nameParts[0];
    firstName = nameParts.slice(1).join(' ');
  } else {
    firstName = nameParts[0] || '';
  }

  return {
    ...cv,
    title: cv.title || '',
    template: cv.template || 'lambda',
    brandColor: cv.brand_color || '#2563EB',
    completionPercentage: cv.completionPercentage ?? 0,
    userId: cv.user_id,
    firstName: cv.first_name || firstName,
    lastName: cv.last_name || lastName,
    email: user.email || cv.email || '',
    phone: user.phone || cv.phone || '',
    image: cv.image || user.avatar || user.user_metadata?.avatar || '',
    jobTitle: cv.job_title || user.job_title || (experience[0]?.position) || '',
    birthDate: cv.birth_date,
    expectedSalary: cv.expected_salary,
    isPublic: cv.is_public,
    createdAt: cv.created_at,
    updatedAt: cv.updated_at,
    education: education.map((e: any) => ({
      ...e,
      cvId: e.cv_id,
      fieldOfStudy: e.field_of_study,
      startDate: e.start_date,
      endDate: e.end_date,
    })),
    experience: experience.map((e: any) => ({
      ...e,
      cvId: e.cv_id,
      startDate: e.start_date,
      endDate: e.end_date,
      isCurrent: e.is_current,
    })),
    skills: cvSkills.map((s: any) => ({
      id: s.id,
      cvId: s.cv_id,
      name: s.skill_name,
      level: s.level,
    })),
    languages: cvLanguages.map((l: any) => ({
      id: l.id,
      cvId: l.cv_id,
      name: l.language_name,
      level: mapLanguageLevelFromServer(l.level),
    })),
    certificates: certificates.map((c: any) => ({
      id: c.id,
      cvId: c.cv_id,
      name: c.name,
      issuer: c.issuer,
    })),
    projects: projects.map((p: any) => ({
      id: p.id,
      cvId: p.cv_id,
      name: p.name,
      link: p.link,
      description: p.description,
      startDate: p.start_date,
      endDate: p.end_date,
    })),
    awards: awards.map((a: any) => ({
      id: a.id,
      cvId: a.cv_id,
      name: a.name,
      issuer: a.issuer,
    })),
    volunteers: volunteers.map((v: any) => ({
      id: v.id,
      cvId: v.cv_id,
      name: v.name,
      role: v.role,
      startDate: v.start_date,
      endDate: v.end_date,
    })),
    hobbies: hobbies.map((h: any) => ({
      id: h.id,
      cvId: h.cv_id,
      name: h.name,
    })),
    memberships: memberships.map((m: any) => ({
      id: m.id,
      cvId: m.cv_id,
      name: m.name,
      organization: m.organization,
    })),
  };
};

export const getCV = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const viewerId = (req as any).user?.id;

    const { data: cv, error: cvError } = await supabase
      .from('cvs')
      .select(`
        *,
        user:users(*),
        education (*),
        experience (*),
        cv_skills (*),
        cv_languages (*),
        certificates (*),
        projects (*),
        awards (*),
        volunteers (*),
        hobbies (*),
        memberships (*)
      `)
      .eq('id', id)
      .maybeSingle();

    if (cvError) throw cvError;
    if (!cv) return res.status(404).json({ message: 'CV not found' });

    // Record view if viewer is not the owner
    if (viewerId && viewerId !== cv.user_id) {
      await supabase
        .from('cv_views')
        .upsert({
          cv_id: id,
          viewer_id: viewerId,
          viewed_at: new Date().toISOString(),
        }, { onConflict: 'cv_id,viewer_id' });
    }

    res.json(formatCVForFrontend(cv));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getCVByUserId = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const viewerId = (req as any).user?.id;

    const { data: cv, error: cvError } = await supabase
      .from('cvs')
      .select(`
        *,
        user:users(*),
        education (*),
        experience (*),
        cv_skills (*),
        cv_languages (*),
        certificates (*),
        projects (*),
        awards (*),
        volunteers (*),
        hobbies (*),
        memberships (*)
      `)
      .eq('user_id', userId)
      .maybeSingle();

    if (cvError) throw cvError;
    if (!cv) return res.status(404).json({ message: 'CV not found' });

    const formattedCV = formatCVForFrontend(cv);

    // Record view if viewer is not the owner
    if (viewerId && viewerId !== cv.user_id) {
      await supabase
        .from('cv_views')
        .upsert({
          cv_id: cv.id,
          viewer_id: viewerId,
          viewed_at: new Date().toISOString(),
        }, { onConflict: 'cv_id,viewer_id' });
    }

    res.json(formattedCV);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getPublicCVs = async (req: Request, res: Response) => {
  try {
    const { data: cvs, error: cvError } = await supabase
      .from('cvs')
      .select(`
        *,
        user:users(*),
        education (*),
        experience (*),
        cv_skills (*),
        cv_languages (*),
        certificates (*),
        projects (*),
        awards (*),
        volunteers (*),
        hobbies (*),
        memberships (*)
      `)
      .eq('is_public', true)
      .order('updated_at', { ascending: false });

    if (cvError) throw cvError;

    const formattedCVs = (cvs || []).map(cv => formatCVForFrontend(cv));
    res.json(formattedCVs);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllUserCVs = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const { data: cv, error: cvError } = await supabase
      .from('cvs')
      .select(`
        *,
        user:users(*),
        education (*),
        experience (*),
        cv_skills (*),
        cv_languages (*),
        certificates (*)
      `)
      .eq('user_id', userId)
      .maybeSingle();

    if (cvError) throw cvError;

    if (!cv) {
      return res.json({ cvs: [], primary_cv_id: null });
    }

    const formattedCV = formatCVForFrontend(cv);

    res.json({
      cvs: [formattedCV],
      primary_cv_id: formattedCV.id
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const setPrimaryCV = async (req: Request, res: Response) => {
  try {
    // For now, since we only support one CV per user, 
    // any existing CV is effectively the primary one.
    // We'll just return success.
    res.json({ message: 'Үндсэн CV-г амжилттай тохирууллаа' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyCV = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const { data: cv, error: cvError } = await supabase
      .from('cvs')
      .select(`
        *,
        user:users(*),
        education (*),
        experience (*),
        cv_skills (*),
        cv_languages (*),
        certificates (*)
      `)
      .eq('user_id', userId)
      .maybeSingle();

    if (cvError) throw cvError;

    if (!cv) {
      return res.json(null);
    }

    const formattedCV = formatCVForFrontend(cv);

    res.json(formattedCV);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCV = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const body = req.body || {};
    const title = body.title;
    const firstName = body.firstName ?? body.first_name;
    const lastName = body.lastName ?? body.last_name;
    const template = body.template;
    const brandColor = body.brandColor ?? body.brand_color;
    const summary = body.summary;
    const birthDate = body.birthDate ?? body.birth_date;
    const gender = body.gender;
    const address = body.address;
    const expectedSalary = body.expectedSalary ?? body.expected_salary;
    const isPublic = body.isPublic ?? body.is_public;
    const image = body.image;
    const education = body.education;
    const experience = body.experience;
    const skills = body.skills ?? body.cv_skills;
    const languages = body.languages ?? body.cv_languages;
    const certificates = body.certificates;
    const projects = body.projects;
    const awards = body.awards;
    const volunteers = body.volunteers;
    const hobbies = body.hobbies;
    const memberships = body.memberships;

    // First, find existing CV for this user to get the ID
    const { data: existingCV } = await supabase
      .from('cvs')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    const cvUpsertData: Record<string, any> = {
      id: existingCV?.id || crypto.randomUUID(),
      user_id: userId,
      updated_at: new Date().toISOString(),
    };

    if (title !== undefined) cvUpsertData.title = title;
    if (firstName !== undefined) cvUpsertData.first_name = firstName;
    if (lastName !== undefined) cvUpsertData.last_name = lastName;
    if (template !== undefined) cvUpsertData.template = template;
    if (brandColor !== undefined) cvUpsertData.brand_color = brandColor;
    if (summary !== undefined) cvUpsertData.summary = summary;
    if (birthDate !== undefined) cvUpsertData.birth_date = birthDate;
    if (gender !== undefined) cvUpsertData.gender = gender;
    if (address !== undefined) cvUpsertData.address = address;
    if (expectedSalary !== undefined) cvUpsertData.expected_salary = expectedSalary;
    if (isPublic !== undefined) cvUpsertData.is_public = isPublic;
    if (image !== undefined) cvUpsertData.image = image;

    // 1. Upsert base CV info
    const { data: cv, error: cvError } = await supabase
      .from('cvs')
      .upsert(cvUpsertData, { onConflict: 'user_id' })
      .select()
      .single();

    if (cvError || !cv) {
      console.error('CV Upsert Error:', cvError);
      throw cvError || new Error('Failed to create/update CV record');
    }

    // 1.1 Update user profile info in public.users table as well
    const userUpdateData: any = {};
    if (firstName || lastName) userUpdateData.name = `${lastName || ''} ${firstName || ''}`.trim();
    if (image) userUpdateData.avatar = image;
    // body.phone is the phone from the CV builder
    if (body.phone) userUpdateData.phone = body.phone;
    if (body.jobTitle) userUpdateData.job_title = body.jobTitle;

    if (Object.keys(userUpdateData).length > 0) {
      const { error: userUpdateError } = await supabase.from('users').update(userUpdateData).eq('id', userId);
      if (userUpdateError) {
        console.error('User Profile Update Error:', userUpdateError);
        // We don't throw here to ensure CV itself is saved, but we log it
      }
    }

    // 1.2 Update Supabase Auth metadata to keep them in sync
    try {
      const { data: userData, error: userFetchError } = await supabase.from('users').select('*').eq('id', userId).single();
      if (!userFetchError && userData) {
        await supabase.auth.admin.updateUserById(userId, {
          user_metadata: {
            ...userData,
            userType: userData.user_type || 'candidate'
          }
        });
      }
    } catch (authErr) {
      console.error('Auth Metadata Sync Error:', authErr);
    }

    const cvId = cv.id;
    console.log('CV saved/updated with ID:', cvId);

    // 2. Handle Education (Delete and Re-insert for simplicity in this demo)
    if (Array.isArray(education)) {
      const { error: deleteError } = await supabase.from('education').delete().eq('cv_id', cvId);
      if (deleteError) {
        console.error('Education Delete Error:', deleteError);
        throw deleteError;
      }

      if (education.length > 0) {
        const eduData = education.map((edu: any) => ({
          id: crypto.randomUUID(),
          cv_id: cvId,
          institution: edu.institution,
          degree: edu.degree,
          field_of_study: edu.fieldOfStudy ?? edu.field_of_study,
          start_date: normalizeDateInput(edu.startDate ?? edu.start_date),
          end_date: normalizeDateInput(edu.endDate ?? edu.end_date),
          description: edu.description,
        }));
        const { error: eduError } = await supabase.from('education').insert(eduData);
        if (eduError) {
          console.error('Education Insert Error:', eduError);
          throw eduError;
        }
      }
    }

    // 3. Handle Experience
    if (Array.isArray(experience)) {
      const { error: deleteError } = await supabase.from('experience').delete().eq('cv_id', cvId);
      if (deleteError) {
        console.error('Experience Delete Error:', deleteError);
        throw deleteError;
      }

      if (experience.length > 0) {
        const expData = experience.map((exp: any) => ({
          id: crypto.randomUUID(),
          cv_id: cvId,
          company: exp.company,
          position: exp.position,
          location: exp.location,
          start_date: normalizeDateInput(exp.startDate ?? exp.start_date),
          end_date: normalizeDateInput(exp.endDate ?? exp.end_date),
          description: exp.description,
        }));
        const { error: expError } = await supabase.from('experience').insert(expData);
        if (expError) {
          console.error('Experience Insert Error:', expError);
          throw expError;
        }
      }
    }

    // 4. Handle Skills
    if (Array.isArray(skills)) {
      const { error: deleteError } = await supabase.from('cv_skills').delete().eq('cv_id', cvId);
      if (deleteError) {
        console.error('Skills Delete Error:', deleteError);
        throw deleteError;
      }

      if (skills.length > 0) {
        const skillData = skills.map((s: any) => ({
          id: crypto.randomUUID(),
          cv_id: cvId,
          skill_name: s.skill_name || s.name,
          level: s.level,
        }));
        const { error: skillError } = await supabase.from('cv_skills').insert(skillData);
        if (skillError) {
          console.error('Skills Insert Error:', skillError);
          throw skillError;
        }
      }
    }

    // 5. Handle Languages
    if (Array.isArray(languages)) {
      const { error: deleteError } = await supabase.from('cv_languages').delete().eq('cv_id', cvId);
      if (deleteError) {
        console.error('Languages Delete Error:', deleteError);
        throw deleteError;
      }

      if (languages.length > 0) {
        const langData = languages.map((l: any) => ({
          id: crypto.randomUUID(),
          cv_id: cvId,
          language_name: l.language_name || l.name,
          level: l.level,
        }));
        const { error: langError } = await supabase.from('cv_languages').insert(langData);
        if (langError) {
          console.error('Languages Insert Error:', langError);
          throw langError;
        }
      }
    }

    // 6. Handle Certificates
    if (Array.isArray(certificates)) {
      const { error: deleteError } = await supabase.from('certificates').delete().eq('cv_id', cvId);
      if (deleteError) {
        console.error('Certificates Delete Error:', deleteError);
        throw deleteError;
      }

      if (certificates.length > 0) {
        const certData = certificates.map((c: any) => ({
          id: crypto.randomUUID(),
          cv_id: cvId,
          name: c.name,
          issuer: c.issuer,
          date: normalizeDateInput(c.date),
        }));
        const { error: certError } = await supabase.from('certificates').insert(certData);
        if (certError) {
          console.error('Certificates Insert Error:', certError);
          throw certError;
        }
      }
    }

    // 7. Handle Projects
    if (Array.isArray(projects)) {
      await supabase.from('projects').delete().eq('cv_id', cvId);
      if (projects.length > 0) {
        const projectData = projects.map((p: any) => ({
          id: crypto.randomUUID(),
          cv_id: cvId,
          name: p.name,
          link: p.link,
          description: p.description,
          start_date: normalizeDateInput(p.startDate || p.start_date),
          end_date: normalizeDateInput(p.endDate || p.end_date),
        }));
        await supabase.from('projects').insert(projectData);
      }
    }

    // 8. Handle Awards
    if (Array.isArray(awards)) {
      await supabase.from('awards').delete().eq('cv_id', cvId);
      if (awards.length > 0) {
        const awardData = awards.map((a: any) => ({
          id: crypto.randomUUID(),
          cv_id: cvId,
          name: a.name,
          issuer: a.issuer,
          date: normalizeDateInput(a.date),
        }));
        await supabase.from('awards').insert(awardData);
      }
    }

    // 9. Handle Volunteers
    if (Array.isArray(volunteers)) {
      await supabase.from('volunteers').delete().eq('cv_id', cvId);
      if (volunteers.length > 0) {
        const volunteerData = volunteers.map((v: any) => ({
          id: crypto.randomUUID(),
          cv_id: cvId,
          name: v.name,
          role: v.role,
          start_date: normalizeDateInput(v.startDate || v.start_date),
          end_date: normalizeDateInput(v.endDate || v.end_date),
        }));
        await supabase.from('volunteers').insert(volunteerData);
      }
    }

    // 10. Handle Hobbies
    if (Array.isArray(hobbies)) {
      await supabase.from('hobbies').delete().eq('cv_id', cvId);
      if (hobbies.length > 0) {
        const hobbyData = hobbies.map((h: any) => ({
          id: crypto.randomUUID(),
          cv_id: cvId,
          name: h.name,
        }));
        await supabase.from('hobbies').insert(hobbyData);
      }
    }

    // 11. Handle Memberships
    if (Array.isArray(memberships)) {
      await supabase.from('memberships').delete().eq('cv_id', cvId);
      if (memberships.length > 0) {
        const membershipData = memberships.map((m: any) => ({
          id: crypto.randomUUID(),
          cv_id: cvId,
          name: m.name,
          organization: m.organization,
        }));
        await supabase.from('memberships').insert(membershipData);
      }
    }

    res.json({ message: 'CV updated successfully', cvId });
  } catch (error: any) {
    console.error('CV Update Error:', error);
    res.status(500).json({ message: error.message });
  }
};
