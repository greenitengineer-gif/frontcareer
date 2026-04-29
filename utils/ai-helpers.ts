export const generateAISummary = async (jobTitle: string, experience: any[]) => {
  // Simulate AI delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const skills = experience.map(exp => exp.position).join(', ');
  return `Би бол ${jobTitle} мэргэжилтэй, ${experience.length} жилийн туршлагатай. Миний гол давуу тал бол ${skills} чиглэлээр ажиллаж байсан туршлага юм. Би үргэлж шинийг эрэлхийлж, баг хамт олонтойгоо үр дүнтэй ажиллахыг эрмэлздэг.`;
};

export const suggestSkills = async (jobTitle: string) => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const commonSkills: Record<string, string[]> = {
    'Frontend Developer': ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Figma', 'Redux'],
    'Backend Developer': ['Node.js', 'Express', 'PostgreSQL', 'Prisma', 'Docker', 'Redis'],
    'Software Engineer': ['Algorithms', 'Data Structures', 'Git', 'CI/CD', 'Clean Code', 'Testing'],
    'Designer': ['UI/UX', 'Figma', 'Adobe XD', 'Photoshop', 'Typography', 'Prototyping'],
  };

  return commonSkills[jobTitle] || ['Communication', 'Teamwork', 'Problem Solving', 'Adaptability'];
};

export const checkJobMatch = async (job: any, resume: any) => {
  // Simulate AI delay
  await new Promise(resolve => setTimeout(resolve, 3000));

  const jobTitle = (job.title || '').toLowerCase();
  const resumeTitle = (resume.jobTitle || '').toLowerCase();
  
  let score = 0;
  const missing: string[] = [];

  // 1. Basic Title Match
  if (jobTitle.includes(resumeTitle) || resumeTitle.includes(jobTitle)) {
    score += 40;
  } else {
    missing.push('Мэргэжил эсвэл албан тушаал шууд тохирохгүй байна');
  }

  // 2. Skills Match (Check if job requirements mention resume skills)
  const resumeSkills = (resume.skills || []).map((s: any) => s.name.toLowerCase());
  const jobReqs = (job.requirements || '').toLowerCase() + (job.description || '').toLowerCase();
  
  let matchedSkills = 0;
  resumeSkills.forEach((skill: string) => {
    if (jobReqs.includes(skill)) matchedSkills++;
  });

  if (resumeSkills.length > 0) {
    score += Math.min((matchedSkills / resumeSkills.length) * 30, 30);
  }

  // 3. Experience Match
  if ((resume.experience || []).length > 0) {
    score += 20;
  } else {
    missing.push('Ажлын туршлага дутуу байна');
  }

  // 4. Education Match
  if ((resume.education || []).length > 0) {
    score += 10;
  } else {
    missing.push('Боловсролын мэдээлэл оруулаагүй байна');
  }

  // Final score capping
  score = Math.round(Math.min(score, 100));

  if (score < 70 && missing.length === 0) {
    missing.push('Ур чадваруудаа илүү тодорхой бичих шаардлагатай');
  }

  return {
    score,
    missing: missing.length > 0 ? missing : ['Бүх шаардлага хангагдсан байна!'],
    advice: score > 80 ? 'Та энэ ажилд маш сайн тохирч байна. Яг одоо анкет илгээхийг зөвлөж байна.' : 'Анкет илгээхээс өмнө CV-гээ бага зэрэг сайжруулахыг зөвлөж байна.'
  };
};
