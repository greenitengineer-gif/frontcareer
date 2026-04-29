import { Resume } from '@/types/cv';

export default function ModernTemplate({ resume }: { resume: Resume }) {
  return (
    <div className="h-full w-full p-12 bg-white text-slate-800 space-y-8 font-sans">
      <div className="flex items-center justify-between border-b-8 border-blue-600 pb-8">
        <div className="flex items-center gap-6">
          {resume.image && (
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-blue-50">
              <img src={resume.image} alt="Profile" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="space-y-2">
            <h1 className="text-5xl font-black tracking-tighter text-slate-900">
              {resume.firstName || 'Нэр'} <span className="text-blue-600">{resume.lastName || 'Овог'}</span>
            </h1>
            <p className="text-2xl font-bold text-slate-500">{resume.jobTitle || 'Мэргэжил'}</p>
          </div>
        </div>
        <div className="text-right space-y-1 font-bold text-slate-400 text-sm">
          <p>{resume.email}</p>
          <p>{resume.phone}</p>
          <p>{resume.address}</p>
          {resume.birthDate && <p>{resume.birthDate}</p>}
          {resume.expectedSalary && <p>{resume.expectedSalary.toLocaleString()}₮</p>}
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-12">
        <div className="col-span-2 space-y-10">
          <section className="space-y-4">
            <h2 className="text-xl font-black uppercase tracking-widest text-blue-600 border-b-2 border-blue-100 pb-2">Experience</h2>
            <div className="space-y-6">
              {resume.experience?.map(exp => (
                <div key={exp.id} className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-lg font-black text-slate-900">{exp.position}</h3>
                    <span className="text-sm font-bold text-slate-400">{exp.startDate} - {exp.isCurrent ? 'Одоо' : exp.endDate}</span>
                  </div>
                  <p className="font-bold text-blue-600">{exp.company}</p>
                  <p className="text-sm text-slate-500 font-medium">{exp.description}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
        <div className="space-y-10">
          <section className="space-y-4">
            <h2 className="text-xl font-black uppercase tracking-widest text-blue-600 border-b-2 border-blue-100 pb-2">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {resume.skills?.map(skill => (
                <span key={skill.id} className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg font-bold text-xs">
                  {skill.name}
                </span>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black uppercase tracking-widest text-blue-600 border-b-2 border-blue-100 pb-2">Languages</h2>
            <div className="space-y-3">
              {resume.languages?.map((lang) => (
                <div key={lang.id} className="flex items-center justify-between bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-xl">
                  <span className="font-bold text-slate-800 text-sm">{lang.name}</span>
                  <span className="font-black text-blue-600 text-xs uppercase tracking-widest">{lang.level}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black uppercase tracking-widest text-blue-600 border-b-2 border-blue-100 pb-2">Certificates</h2>
            <div className="space-y-3">
              {resume.certificates?.map((cert) => (
                <div key={cert.id} className="bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl">
                  <div className="font-black text-slate-900 text-sm leading-tight">{cert.name}</div>
                  <div className="font-bold text-slate-500 text-xs">{cert.issuer}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
