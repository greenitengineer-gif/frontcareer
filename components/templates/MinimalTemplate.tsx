import { Resume } from '@/types/cv';

export default function MinimalTemplate({ resume }: { resume: Resume }) {
  return (
    <div className="h-full w-full p-16 bg-white text-slate-800 space-y-12 font-serif text-center">
      <div className="space-y-4 border-b border-slate-200 pb-12">
        <h1 className="text-6xl font-black tracking-tight text-slate-900">
          {resume.firstName || 'Нэр'} {resume.lastName || 'Овог'}
        </h1>
        <p className="text-2xl font-bold text-blue-600 uppercase tracking-widest">{resume.jobTitle || 'Мэргэжил'}</p>
        <div className="flex items-center justify-center gap-6 text-sm font-bold text-slate-400 uppercase tracking-widest">
          <span>{resume.email}</span>
          <div className="w-1 h-1 rounded-full bg-slate-300" />
          <span>{resume.phone}</span>
          <div className="w-1 h-1 rounded-full bg-slate-300" />
          <span>{resume.address}</span>
        </div>
      </div>
      
      <div className="max-w-3xl mx-auto space-y-12">
        <section className="space-y-6">
          <h2 className="text-2xl font-black text-slate-900 border-b border-slate-100 pb-4">Experience</h2>
          <div className="space-y-8 text-left">
            {resume.experience?.map(exp => (
              <div key={exp.id} className="grid grid-cols-4 gap-8">
                <div className="col-span-1 text-right text-sm font-bold text-slate-400 pt-1">
                  {exp.startDate} - {exp.isCurrent ? 'Одоо' : exp.endDate}
                </div>
                <div className="col-span-3 space-y-2">
                  <h3 className="text-xl font-black text-slate-900">{exp.position}</h3>
                  <p className="text-lg font-bold text-blue-600">{exp.company}</p>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">{exp.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6 text-left">
          <h2 className="text-2xl font-black text-slate-900 border-b border-slate-100 pb-4">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {resume.skills?.map((skill) => (
              <span key={skill.id} className="text-[11px] font-black text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
                {skill.name}
              </span>
            ))}
          </div>
        </section>

        <section className="space-y-6 text-left">
          <h2 className="text-2xl font-black text-slate-900 border-b border-slate-100 pb-4">Languages</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {resume.languages?.map((lang) => (
              <div key={lang.id} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
                <span className="font-black text-slate-900">{lang.name}</span>
                <span className="text-[11px] font-black text-blue-600 uppercase tracking-widest">{lang.level}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6 text-left">
          <h2 className="text-2xl font-black text-slate-900 border-b border-slate-100 pb-4">Certificates</h2>
          <div className="space-y-3">
            {resume.certificates?.map((cert) => (
              <div key={cert.id} className="bg-slate-50 border border-slate-200 rounded-lg px-5 py-4">
                <div className="font-black text-slate-900">{cert.name}</div>
                <div className="text-sm font-bold text-slate-500">{cert.issuer}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
