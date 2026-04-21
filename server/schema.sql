-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  avatar TEXT,
  banner TEXT,
  bio TEXT,
  website TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  user_type TEXT CHECK (user_type IN ('candidate', 'employer')) DEFAULT 'candidate',
  is_admin BOOLEAN DEFAULT FALSE,
  address TEXT,
  employee_count TEXT,
  industry TEXT,
  founded_year TEXT,
  facebook_url TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Jobs Table
CREATE TABLE jobs (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  company_logo TEXT,
  description TEXT NOT NULL,
  requirements TEXT,
  salary_min DECIMAL(12, 2),
  salary_max DECIMAL(12, 2),
  salary_type TEXT CHECK (salary_type IN ('fixed', 'range', 'negotiable', 'hourly')) DEFAULT 'negotiable',
  job_type TEXT CHECK (job_type IN ('full-time', 'part-time', 'freelance', 'contract')) DEFAULT 'full-time',
  category TEXT NOT NULL,
  location TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Favorites Table
CREATE TABLE favorites (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, job_id)
);

-- Messages Table
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  text TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Admin Requests
CREATE TABLE admin_requests (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT,
  user_email TEXT,
  user_phone TEXT,
  user_avatar TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP WITH TIME ZONE,
  decided_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- CVs Table
CREATE TABLE cvs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  template TEXT DEFAULT 'professional',
  brand_color TEXT DEFAULT '#2563EB',
  summary TEXT,
  birth_date DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  address TEXT,
  expected_salary DECIMAL(12, 2),
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Education Table
CREATE TABLE education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cv_id UUID NOT NULL REFERENCES cvs(id) ON DELETE CASCADE,
  institution TEXT NOT NULL,
  degree TEXT,
  field_of_study TEXT,
  start_date DATE,
  end_date DATE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Experience Table
CREATE TABLE experience (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cv_id UUID NOT NULL REFERENCES cvs(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  location TEXT,
  start_date DATE,
  end_date DATE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Skills Table
CREATE TABLE cv_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cv_id UUID NOT NULL REFERENCES cvs(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Languages Table
CREATE TABLE cv_languages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cv_id UUID NOT NULL REFERENCES cvs(id) ON DELETE CASCADE,
  language_name TEXT NOT NULL,
  level TEXT CHECK (level IN ('basic', 'intermediate', 'fluent', 'native')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Certificates Table
CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cv_id UUID NOT NULL REFERENCES cvs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  issuer TEXT,
  date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- CV Views Table
CREATE TABLE cv_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cv_id UUID NOT NULL REFERENCES cvs(id) ON DELETE CASCADE,
    viewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(cv_id, viewer_id)
);

-- Job Applications Table
CREATE TABLE job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    employer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('pending', 'viewed', 'shortlisted', 'rejected', 'interview_scheduled')) DEFAULT 'pending',
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    interview_date DATE,
    interview_time TEXT,
    interview_type TEXT,
    interview_location TEXT,
    interview_notes TEXT,
    UNIQUE(job_id, candidate_id)
);

-- Notifications Table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL, -- 'application_viewed', 'application_shortlisted', 'new_message', etc.
    link TEXT, -- Optional link to redirect
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Job Views Table
CREATE TABLE job_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(job_id, viewer_id)
);

-- Followers Table
CREATE TABLE followers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employer_id, follower_id)
);

-- RLS and Policies
ALTER TABLE admin_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cvs ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE followers ENABLE ROW LEVEL SECURITY;

-- Followers Policies
CREATE POLICY "Anyone can view followers count" ON followers FOR SELECT USING (true);
CREATE POLICY "Users can manage their own follows" ON followers FOR ALL USING (follower_id = auth.uid());

-- Admin Requests Policies
CREATE POLICY "Users can view their own requests" ON admin_requests FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own requests" ON admin_requests FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users Policies
CREATE POLICY "Public can view employer profiles" ON users FOR SELECT USING (user_type = 'employer');
CREATE POLICY "users_select_own_row" ON users FOR SELECT USING (id = auth.uid());
CREATE POLICY "users_insert_self" ON users FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "users_update_self" ON users FOR UPDATE USING (id = auth.uid());

-- Jobs Policies
CREATE POLICY "Anyone can view jobs" ON jobs FOR SELECT USING (true);
CREATE POLICY "Employers can manage their own jobs" ON jobs FOR ALL USING (user_id = auth.uid());

-- CV Policies
CREATE POLICY "Users can view any public CV" ON cvs FOR SELECT USING (is_public = true OR user_id = auth.uid());
CREATE POLICY "Users can manage their own CV" ON cvs FOR ALL USING (user_id = auth.uid());

-- Sub-table Policies
CREATE POLICY "Users can view education of public CVs" ON education FOR SELECT USING (EXISTS (SELECT 1 FROM cvs WHERE cvs.id = education.cv_id AND (cvs.is_public = true OR cvs.user_id = auth.uid())));
CREATE POLICY "Users can manage their own education" ON education FOR ALL USING (EXISTS (SELECT 1 FROM cvs WHERE cvs.id = education.cv_id AND cvs.user_id = auth.uid()));

CREATE POLICY "Users can view experience of public CVs" ON experience FOR SELECT USING (EXISTS (SELECT 1 FROM cvs WHERE cvs.id = experience.cv_id AND (cvs.is_public = true OR cvs.user_id = auth.uid())));
CREATE POLICY "Users can manage their own experience" ON experience FOR ALL USING (EXISTS (SELECT 1 FROM cvs WHERE cvs.id = experience.cv_id AND cvs.user_id = auth.uid()));

CREATE POLICY "Users can view skills of public CVs" ON cv_skills FOR SELECT USING (EXISTS (SELECT 1 FROM cvs WHERE cvs.id = cv_skills.cv_id AND (cvs.is_public = true OR cvs.user_id = auth.uid())));
CREATE POLICY "Users can manage their own skills" ON cv_skills FOR ALL USING (EXISTS (SELECT 1 FROM cvs WHERE cvs.id = cv_skills.cv_id AND cvs.user_id = auth.uid()));

CREATE POLICY "Users can view languages of public CVs" ON cv_languages FOR SELECT USING (EXISTS (SELECT 1 FROM cvs WHERE cvs.id = cv_languages.cv_id AND (cvs.is_public = true OR cvs.user_id = auth.uid())));
CREATE POLICY "Users can manage their own languages" ON cv_languages FOR ALL USING (EXISTS (SELECT 1 FROM cvs WHERE cvs.id = cv_languages.cv_id AND cvs.user_id = auth.uid()));

CREATE POLICY "Users can view certificates of public CVs" ON certificates FOR SELECT USING (EXISTS (SELECT 1 FROM cvs WHERE cvs.id = certificates.cv_id AND (cvs.is_public = true OR cvs.user_id = auth.uid())));
CREATE POLICY "Users can manage their own certificates" ON certificates FOR ALL USING (EXISTS (SELECT 1 FROM cvs WHERE cvs.id = certificates.cv_id AND cvs.user_id = auth.uid()));

-- Storage Buckets (Optional: run these in Supabase Dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true);
-- CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'uploads');
-- CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'uploads' AND auth.role() = 'authenticated');
