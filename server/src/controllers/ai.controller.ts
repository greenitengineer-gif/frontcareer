import { Request, Response } from 'express';
import { calculateMatchScore, getOpenAI } from '../utils/ai';
import { supabase } from '../utils/supabase';

export const checkJobMatch = async (req: Request, res: Response) => {
  try {
    const { jobId, cvId, cvData } = req.body;

    if (!jobId || (!cvId && !cvData)) {
      return res.status(400).json({ message: 'Job ID and CV ID (or CV Data) are required' });
    }

    const result = await calculateMatchScore(jobId, cvId, cvData);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const aiSearch = async (req: Request, res: Response) => {
  try {
    const { query: textQuery } = req.body;

    if (!textQuery) {
      return res.status(400).json({ message: 'Query is required' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ message: 'AI Search is not configured (OPENAI_API_KEY missing)' });
    }

    const openai = getOpenAI();

    const prompt = `
      You are an AI assistant for a job platform called Career.
      Your task is to extract search filters from a user's natural language query in Mongolian or English.
      
      Available categories: FINANCE_ACCOUNTING, IT_SOFTWARE, SALES_MARKETING, ADMIN_HR, SERVICE_HOSPITALITY, ENGINEERING_CONSTRUCTION, LOGISTICS_TRANSPORT, HEALTHCARE_PHARMACY, EDUCATION_SOCIAL, OTHERS.
      
      Return ONLY a JSON object with the following fields:
      - category: One of the available categories or null
      - search: Key search terms or keywords (string or null)
      - minSalary: Minimum salary as a number (null if not specified)
      - maxSalary: Maximum salary as a number (null if not specified)
      - location: Location name (string or null)
      - radius: Search radius in kilometers (number, default to 2 if location is mentioned, otherwise null)

      User query: "${textQuery}"
    `;

    console.log('Generating content with OpenAI...');
    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: prompt }],
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      max_tokens: 300,
    });
    console.log('OpenAI result received');
    
    const text = completion.choices[0].message.content;
    
    if (!text) {
      throw new Error('Failed to get response from OpenAI');
    }
    
    const filters = JSON.parse(text);

    // Build Supabase query based on extracted filters
    let query = supabase
      .from('jobs')
      .select('*, user:users(id, name, avatar, is_verified)');

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,company_name.ilike.%${filters.search}%`);
    }

    if (filters.minSalary) {
      query = query.gte('salary_min', filters.minSalary);
    }

    if (filters.maxSalary) {
      query = query.lte('salary_max', filters.maxSalary);
    }

    if (filters.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }

    query = query.order('created_at', { ascending: false });

    const { data: jobs, error } = await query;

    if (error) throw error;

    // Map to camelCase for frontend
    const formattedJobs = jobs?.map((j: any) => ({
      ...j,
      companyName: j.company_name,
      companyLogo: j.company_logo,
      salaryMin: j.salary_min,
      salaryMax: j.salary_max,
      salaryType: j.salary_type,
      jobType: j.job_type,
      userId: j.user_id,
      createdAt: j.created_at,
      user: j.user ? {
        ...j.user,
        isVerified: j.user.is_verified
      } : null
    }));

    res.json({
      filters,
      results: formattedJobs
    });
  } catch (error: any) {
    console.error('AI Search Error:', error);
    res.status(500).json({ message: error.message });
  }
};
