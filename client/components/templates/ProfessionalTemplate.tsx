import { Resume } from '@/types/cv';
import { Mail, Phone, MapPin, Globe, Briefcase, GraduationCap, Star, Award, Calendar, DollarSign } from 'lucide-react';

export default function ProfessionalTemplate({ resume }: { resume: Resume }) {
  return (
    <div className="h-full w-full flex flex-col font-serif text-slate-800 bg-white">
      {/* Header */}
      <div className="p-12 bg-slate-900 text-white flex items-center gap-8">
        {resume.image && (
          <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-slate-800 shrink-0">
            <img src={resume.image} alt="Profile" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex-1 space-y-2">
          <h1 className="text-4xl font-black tracking-tight">
            {resume.firstName || 'Нэр'} {resume.lastName || 'Овог'}
          </h1>
          <p className="text-blue-400 font-bold text-xl uppercase tracking-widest">
            {resume.jobTitle || 'Мэргэжил'}
          </p>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 pt-4 text-slate-300 text-[11px] font-black uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-400" /> {resume.email || 'email@example.com'}
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-blue-400" /> {resume.phone || 'Утас'}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-400" /> {resume.address || 'Байршил'}
            </div>
            {resume.birthDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-400" /> {resume.birthDate}
              </div>
            )}
            {resume.expectedSalary && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-blue-400" /> {resume.expectedSalary.toLocaleString()}₮
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12">
        {/* Main Content */}
        <div className="col-span-8 p-12 space-y-10 border-r border-slate-100">
          {/* Summary */}
          {resume.summary && (
            <div className="space-y-4">
              <h2 className="text-lg font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                Өөрийн тухай
              </h2>
              <p className="text-sm leading-relaxed text-slate-600 font-medium whitespace-pre-wrap italic">
                "{resume.summary}"
              </p>
            </div>
          )}

          {/* Experience */}
          <div className="space-y-6">
            <h2 className="text-lg font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
              Ажлын туршлага
            </h2>
            <div className="space-y-8">
              {resume.experience?.map((exp) => (
                <div key={exp.id} className="relative pl-6 border-l-2 border-slate-100 space-y-2">
                  <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-white border-4 border-blue-600 shadow-sm" />
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-slate-900">{exp.position}</h3>
                    <span className="text-[11px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-md">
                      {exp.startDate} - {exp.isCurrent ? 'Одоо' : exp.endDate}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-500 flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5" /> {exp.company}
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    {exp.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div className="space-y-6">
            <h2 className="text-lg font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
              Боловсрол
            </h2>
            <div className="space-y-8">
              {resume.education?.map((edu) => (
                <div key={edu.id} className="relative pl-6 border-l-2 border-slate-100 space-y-2">
                  <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-white border-4 border-slate-300 shadow-sm" />
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-slate-900">{edu.degree || edu.fieldOfStudy}</h3>
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                      {edu.startDate} - {edu.endDate}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-500 flex items-center gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5" /> {edu.institution}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-span-4 p-10 bg-slate-50 space-y-10">
          {/* Skills */}
          <div className="space-y-6">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
              <Star className="h-4 w-4 text-blue-600" />
              Ур чадвар
            </h2>
            <div className="flex flex-wrap gap-2">
              {resume.skills?.map((skill) => (
                <span key={skill.id} className="text-[11px] font-black text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
                  {skill.name}
                </span>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div className="space-y-6">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
              <Globe className="h-4 w-4 text-blue-600" />
              Гадаад хэл
            </h2>
            <div className="space-y-4">
              {resume.languages?.map((lang) => (
                <div key={lang.id} className="space-y-2">
                  <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                    <span className="text-slate-900">{lang.name}</span>
                    <span className="text-blue-600">{lang.level}</span>
                  </div>
                  <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600" 
                      style={{ width: lang.level === 'native' ? '100%' : lang.level === 'fluent' ? '85%' : lang.level === 'intermediate' ? '60%' : '30%' }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certificates */}
          <div className="space-y-6">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
              <Award className="h-4 w-4 text-blue-600" />
              Сертификат
            </h2>
            <div className="space-y-4">
              {resume.certificates?.map((cert) => (
                <div key={cert.id} className="space-y-1">
                  <h4 className="text-xs font-black text-slate-900 leading-tight">{cert.name}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{cert.issuer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
