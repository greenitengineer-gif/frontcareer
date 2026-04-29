import { Resume } from '@/types/cv';
import { Mail, Phone, MapPin, Globe, Briefcase, GraduationCap, Star, Award, Calendar, DollarSign, Linkedin, Github, ExternalLink, Trophy, Users, Heart, BookOpen } from 'lucide-react';

export default function LambdaTemplate({ resume }: { resume: Resume }) {
  const brandColor = resume.brandColor || '#2563EB';

  return (
    <div className="h-full w-full flex font-sans text-slate-800 bg-white shadow-inner">
      {/* Sidebar (Deep Blue) */}
      <div className="w-[32%] bg-[#1E293B] text-white p-10 flex flex-col gap-10 overflow-y-auto">
        {/* Photo Container */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-[2rem] overflow-hidden border-4 border-white/10 bg-white/5 flex items-center justify-center shrink-0 rotate-3 transition-transform hover:rotate-0 duration-500">
              {resume.image ? (
                <img src={resume.image} alt="Profile" className="w-full h-full object-cover -rotate-3 hover:rotate-0 transition-transform duration-500" />
              ) : (
                <div className="text-4xl font-black text-white/10 uppercase">
                  {resume.firstName?.[0]}{resume.lastName?.[0]}
                </div>
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-4 border-[#1E293B] flex items-center justify-center" style={{ backgroundColor: brandColor }}>
               <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            </div>
          </div>
        </div>

        {/* Identity */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-black tracking-tight leading-tight">
            {resume.lastName || 'Овог'}<br/>
            <span style={{ color: brandColor }}>{resume.firstName || 'Нэр'}</span>
          </h1>
          <div className="inline-block px-3 py-1 bg-white/5 rounded-full">
            <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em]">
              {resume.jobTitle || 'Албан тушаал'}
            </p>
          </div>
        </div>

        {/* Contact Matrix */}
        <div className="space-y-4 pt-4">
          <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] border-b border-white/5 pb-2">Contact</p>
          <div className="space-y-3 text-xs">
            {resume.linkedin && (
              <div className="flex items-center gap-3 group cursor-pointer">
                <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center transition-all" style={{ backgroundColor: brandColor + '20' }}>
                  <Linkedin className="h-3.5 w-3.5 text-white/60" style={{ color: brandColor }} />
                </div>
                <span className="text-white/70 group-hover:text-white transition-colors truncate">{resume.linkedin.replace('https://', '')}</span>
              </div>
            )}
            {resume.email && (
              <div className="flex items-center gap-3 group cursor-pointer">
                <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center transition-all" style={{ backgroundColor: brandColor + '20' }}>
                  <Mail className="h-3.5 w-3.5 text-white/60" style={{ color: brandColor }} />
                </div>
                <span className="text-white/70 group-hover:text-white transition-colors truncate">{resume.email}</span>
              </div>
            )}
            {resume.phone && (
              <div className="flex items-center gap-3 group">
                <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center">
                  <Phone className="h-3.5 w-3.5 text-white/60" />
                </div>
                <span className="text-white/70">{resume.phone}</span>
              </div>
            )}
            {resume.address && (
              <div className="flex items-center gap-3 group">
                <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center">
                  <MapPin className="h-3.5 w-3.5 text-white/60" />
                </div>
                <span className="text-white/70 leading-snug">{resume.address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Core Competencies */}
        {resume.skills && resume.skills.length > 0 && (
          <div className="space-y-5">
            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] border-b border-white/5 pb-2">Expertise</p>
            <div className="flex flex-wrap gap-2">
              {resume.skills.map((skill) => (
                <div key={skill.id} className="px-3 py-1.5 bg-white/5 rounded-lg text-[11px] font-bold text-white/80 border border-white/5 hover:bg-white/10 transition-all cursor-default">
                  {skill.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Linguistic Proficiency */}
        {resume.languages && resume.languages.length > 0 && (
          <div className="space-y-5">
            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] border-b border-white/5 pb-2">Languages</p>
            <div className="space-y-4">
              {resume.languages.map((lang) => (
                <div key={lang.id} className="space-y-2">
                  <div className="flex justify-between items-center text-[11px] font-bold">
                    <span className="text-white/90">{lang.name}</span>
                    <span className="text-blue-400 uppercase text-[9px] tracking-widest">{lang.level}</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full" 
                      style={{ 
                        width: lang.level === 'native' ? '100%' : 
                               lang.level === 'fluent' ? '90%' : 
                               lang.level === 'intermediate' ? '65%' : '35%' 
                      }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Body (Clean Canvas) */}
      <div className="flex-1 p-16 space-y-12 overflow-y-auto bg-white">
        {/* Executive Summary */}
        <div className="space-y-4 relative group/section cursor-default">
          <div className="absolute -left-6 top-0 w-1 h-full bg-blue-600/10 group-hover/section:bg-blue-600 rounded-full transition-all duration-300" />
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black text-blue-600 uppercase tracking-[0.3em]">Profile</h2>
            <div className="opacity-0 group-hover/section:opacity-100 transition-opacity bg-blue-50 text-blue-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">Мэдээлэл хэсгээс засах</div>
          </div>
          <p className="text-sm text-slate-600 leading-[1.8] font-medium max-w-2xl group-hover/section:text-slate-900 transition-colors">
            {resume.summary || 'Describe your professional journey and key achievements here...'}
          </p>
        </div>

        {/* Professional Experience */}
        <div className="space-y-8 group/section cursor-default">
          <div className="flex items-center gap-4">
            <h2 className="text-xs font-black text-blue-600 uppercase tracking-[0.3em]">Experience</h2>
            <div className="h-[1px] flex-1 bg-slate-100 group-hover/section:bg-blue-100 transition-colors" />
            <div className="opacity-0 group-hover/section:opacity-100 transition-opacity bg-blue-50 text-blue-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">Мэдээлэл хэсгээс засах</div>
          </div>
          <div className="space-y-10">
            {resume.experience?.map((exp) => (
              <div key={exp.id} className="grid grid-cols-[140px_1fr] gap-8 group/item">
                <div className="text-right pt-1">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider group-hover/item:text-blue-500 transition-colors">{exp.startDate} — {exp.isCurrent ? 'Present' : exp.endDate}</p>
                  <p className="text-[10px] font-bold text-blue-500 mt-1">{exp.location}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-base font-black text-slate-900 group-hover/item:text-blue-600 transition-colors">{exp.position}</h3>
                  <p className="text-sm font-bold text-slate-500">{exp.company}</p>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium pt-1">{exp.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Academic Background */}
        <div className="space-y-8 group/section cursor-default">
          <div className="flex items-center gap-4">
            <h2 className="text-xs font-black text-blue-600 uppercase tracking-[0.3em]">Education</h2>
            <div className="h-[1px] flex-1 bg-slate-100 group-hover/section:bg-blue-100 transition-colors" />
            <div className="opacity-0 group-hover/section:opacity-100 transition-opacity bg-blue-50 text-blue-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">Мэдээлэл хэсгээс засах</div>
          </div>
          <div className="space-y-8">
            {resume.education?.map((edu) => (
              <div key={edu.id} className="grid grid-cols-[140px_1fr] gap-8 group/item">
                <div className="text-right pt-1">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider group-hover/item:text-blue-500 transition-colors">{edu.startDate} — {edu.endDate}</p>
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-black text-slate-900 group-hover/item:text-blue-600 transition-colors">{edu.degree || edu.fieldOfStudy}</h3>
                  <p className="text-sm font-bold text-slate-500">{edu.institution}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strategic Projects */}
        {resume.projects && resume.projects.length > 0 && (
          <div className="space-y-8 group/section cursor-default">
            <div className="flex items-center gap-4">
              <h2 className="text-xs font-black text-blue-600 uppercase tracking-[0.3em]">Key Projects</h2>
              <div className="h-[1px] flex-1 bg-slate-100 group-hover/section:bg-blue-100 transition-colors" />
              <div className="opacity-0 group-hover/section:opacity-100 transition-opacity bg-blue-50 text-blue-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">Мэдээлэл хэсгээс засах</div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {resume.projects.map((p) => (
                <div key={p.id} className="p-5 rounded-2xl bg-slate-50/50 border border-slate-100 space-y-3 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 ring-1 ring-transparent hover:ring-blue-100">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-black text-slate-900">{p.name}</h3>
                    <p className="text-[9px] font-black text-slate-400">{p.startDate}</p>
                  </div>
                  {p.link && (
                    <a href={p.link} className="flex items-center gap-1.5 text-[10px] font-bold text-blue-500 hover:text-blue-600 transition-colors">
                      <ExternalLink className="h-3 w-3" /> View Project
                    </a>
                  )}
                  <p className="text-[11px] text-slate-500 leading-relaxed font-medium line-clamp-3">{p.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
