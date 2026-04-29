import { Resume } from "@/types/cv";

export const calculateCVCompleteness = (resume: Partial<Resume> | null): number => {
  if (!resume) return 0;
  
  let score = 0;
  // Personal Info (max 25)
  if (resume.firstName) score += 4;
  if (resume.lastName) score += 4;
  if (resume.email) score += 4;
  if (resume.phone) score += 4;
  if (resume.address) score += 3;
  if (resume.jobTitle) score += 3;
  if (resume.image) score += 3;

  // Summary (max 15)
  if (resume.summary && resume.summary.length > 50) score += 15;
  else if (resume.summary) score += 8;

  // Experience (max 20)
  if (resume.experience && resume.experience.length > 0) {
    score += Math.min(resume.experience.length * 10, 20);
  }

  // Education (max 15)
  if (resume.education && resume.education.length > 0) {
    score += 15;
  }

  // Skills (max 15)
  if (resume.skills && resume.skills.length > 0) {
    score += Math.min(resume.skills.length * 3, 15);
  }

  // Languages (max 10)
  if (resume.languages && resume.languages.length > 0) {
    score += Math.min(resume.languages.length * 5, 10);
  }
  
  return Math.round(Math.min(score, 100));
};

export const getCVCompletenessTips = (resume: Partial<Resume> | null) => {
  if (!resume) return [];
  
  const tips = [];
  
  // Personal Info
  if (!resume.firstName || !resume.lastName) tips.push({ label: 'Овог нэрээ оруулах', points: 8 });
  if (!resume.email) tips.push({ label: 'И-мэйл хаягаа баталгаажуулах', points: 4 });
  if (!resume.phone) tips.push({ label: 'Утасны дугаараа оруулах', points: 4 });
  if (!resume.address) tips.push({ label: 'Гэрийн хаягаа оруулах', points: 3 });
  if (!resume.jobTitle) tips.push({ label: 'Мэргэжил, албан тушаалаа бичих', points: 3 });
  if (!resume.image) tips.push({ label: 'Профайл зураг оруулах', points: 3 });

  // Summary
  if (!resume.summary) tips.push({ label: 'Өөрийн тухай товч намтар бичих', points: 15 });
  else if (resume.summary.length <= 50) tips.push({ label: 'Товч намтраа илүү дэлгэрэнгүй болгох', points: 7 });

  // Experience
  if (!resume.experience || resume.experience.length === 0) tips.push({ label: 'Ажлын туршлага нэмэх', points: 20 });
  else if (resume.experience.length === 1) tips.push({ label: 'Нэмэлт ажлын туршлага нэмэх (2+ ажил)', points: 10 });

  // Education
  if (!resume.education || resume.education.length === 0) tips.push({ label: 'Боловсролын мэдээлэл оруулах', points: 15 });

  // Skills
  const skillCount = resume.skills?.length || 0;
  if (skillCount === 0) tips.push({ label: 'Ур чадваруудаа нэмэх', points: 15 });
  else if (skillCount < 5) tips.push({ label: `Ур чадвараа 5 хүртэл нэмэгдүүлэх (одоо ${skillCount})`, points: (5 - skillCount) * 3 });

  // Languages
  const langCount = resume.languages?.length || 0;
  if (langCount === 0) tips.push({ label: 'Гадаад хэлний мэдлэгээ нэмэх', points: 10 });
  else if (langCount < 2) tips.push({ label: 'Нэмэлт хэл нэмэх (2+ хэл)', points: 5 });

  return tips.sort((a, b) => b.points - a.points);
};
