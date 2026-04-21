import OpenAI from 'openai';
import { supabase } from './supabase';

// Helper to get OpenAI instance
export const getOpenAI = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY missing');
  }
  return new OpenAI({ apiKey });
};

export const calculateMatchScore = async (jobId: string, cvId?: string, cvData?: any) => {
  try {
    // 1. Fetch Job data
    const { data: job, error: jobError } = await supabase.from('jobs').select('*').eq('id', jobId).single();
    if (jobError || !job) throw new Error('Job not found');

    // 2. Get CV data (either from DB or provided in request)
    let cv: any;
    if (cvId) {
      const { data: dbCv, error: cvError } = await supabase
        .from('cvs')
        .select('*, education(*), experience(*), cv_skills(*), cv_languages(*)')
        .eq('id', cvId)
        .single();
      
      if (cvError || !dbCv) throw new Error('CV not found in database');
      cv = dbCv;
    } else {
      cv = cvData;
    }

    if (!cv) throw new Error('CV data is required');

    const openai = getOpenAI();

    const prompt = `
      You are an expert HR assistant. Your task is to analyze the match between a job description and a candidate's CV.
      
      Job Title: ${job.title}
      Job Description: ${job.description}
      Job Requirements: ${job.requirements || 'Not specified'}
      
      Candidate CV Summary: ${cv.summary || 'Not specified'}
      Candidate Skills: ${cv.cv_skills?.map((s: any) => s.skill_name || s.name).join(', ') || cv.skills?.map((s: any) => s.name || s.skill_name).join(', ') || 'Not specified'}
      Candidate Experience: ${cv.experience?.map((e: any) => `${e.position} at ${e.company}`).join('; ') || 'Not specified'}
      Candidate Education: ${cv.education?.map((e: any) => `${e.degree || 'Degree'} from ${e.institution || e.school}`).join('; ') || 'Not specified'}
      
      Return ONLY a JSON object with the following fields:
      - score: A number from 0 to 100 representing the match percentage
      - missing: An array of 3-5 key skills or requirements from the job description that the candidate seems to lack
      - advice: A brief (1-2 sentence) professional advice in Mongolian for the candidate on how to improve their application for this specific job

      The JSON must be valid.
    `;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: prompt }],
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      max_tokens: 500,
    });
    
    const text = completion.choices[0].message.content;
    if (!text) throw new Error('Failed to get response from OpenAI');
    
    return JSON.parse(text);
  } catch (error: any) {
    console.error('Match calculation error:', error);
    return { score: 0, missing: [], advice: 'Нийцлийг тооцоолоход алдаа гарлаа.' };
  }
};
