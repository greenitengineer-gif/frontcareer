'use client';

import { useCVStore } from '@/lib/cv-store';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  PlusCircle, 
  Trash2, 
  Building2, 
  GraduationCap, 
  Star,
  Globe,
  Award,
  Sparkles,
  Zap,
  Loader2,
  Briefcase,
  DollarSign,
  Camera,
  Users,
  Linkedin,
  Heart,
  BookOpen,
  CheckCircle2,
  Info,
  ChevronDown,
  Plus,
  FileText
} from 'lucide-react';
import { Resume, CVTemplate } from '@/types/cv';
import { toast } from 'sonner';

import { generateAISummary, suggestSkills } from '@/utils/ai-helpers';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { getCVCompletenessTips, calculateCVCompleteness } from '@/lib/cv-utils';

interface AccordionSectionProps {
  id: string;
  title: string;
  icon: any;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  completed?: boolean;
}

const AccordionSection = ({ title, icon: Icon, isOpen, onToggle, children, completed }: AccordionSectionProps) => (
  <div className={`border-b border-slate-100 transition-all duration-500 ${isOpen ? 'bg-slate-50/50' : 'hover:bg-slate-50/30'}`}>
    <button 
      onClick={onToggle}
      className="w-full flex items-center justify-between py-5 px-4 transition-all group"
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${
          isOpen 
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 rotate-0' 
            : 'bg-white text-slate-400 border border-slate-100 group-hover:border-blue-200 group-hover:text-blue-500'
        }`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex flex-col items-start">
          <span className={`text-sm font-black tracking-tight transition-colors ${isOpen ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-900'}`}>{title}</span>
          {completed && !isOpen && <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-0.5">Бөглөсөн</span>}
        </div>
      </div>
      <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 ${isOpen ? 'bg-blue-50 text-blue-600 rotate-180' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600'}`}>
        <ChevronDown className="h-3.5 w-3.5" />
      </div>
    </button>
    <div className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
      <div className="pb-8 px-6 space-y-6 animate-in fade-in slide-in-from-top-2 duration-500">
        {children}
      </div>
    </div>
  </div>
);

export default function CVFormSteps() {
  const { user, refreshUser } = useAuth();
  const { 
    currentResume, 
    updateResumeData,
    addEducation,
    removeEducation,
    addExperience,
    removeExperience,
    addSkill,
    removeSkill,
    addLanguage,
    removeLanguage,
    addCertificate,
    removeCertificate,
    addProject,
    removeProject,
    addAward,
    removeAward,
    addVolunteer,
    removeVolunteer,
    addHobby,
    removeHobby,
    addMembership,
    removeMembership
  } = useCVStore();

  const [openSection, setOpenSection] = useState<string | null>('personal');
  const [aiLoading, setAiLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  // Local state for new entries
  const [newExp, setNewExp] = useState({ company: '', position: '', startDate: '', endDate: '', description: '', isCurrent: false });
  const [newEdu, setNewEdu] = useState({ institution: '', degree: '', startDate: '', endDate: '' });
  const [newSkill, setNewSkill] = useState('');
  const [newLang, setNewLang] = useState({ name: '', level: 'basic' });
  const [newCert, setNewCert] = useState({ name: '', issuer: '' });
  const [newProject, setNewProject] = useState({ name: '', link: '', description: '', startDate: '', endDate: '' });
  const [newAward, setNewAward] = useState({ name: '', issuer: '' });
  const [newVolunteer, setNewVolunteer] = useState({ name: '', role: '', startDate: '', endDate: '' });
  const [newHobby, setNewHobby] = useState('');
  const [newMembership, setNewMembership] = useState({ name: '', organization: '' });

  if (!currentResume) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    updateResumeData({ [e.target.name]: e.target.value });
  };

  const handleAISummary = async () => {
    if (!currentResume.jobTitle) {
      toast.error('Эхлээд мэргэжлээ оруулна уу');
      return;
    }
    setAiLoading(true);
    try {
      const summary = await generateAISummary(currentResume.jobTitle, currentResume.experience || []);
      updateResumeData({ summary });
      toast.success('AI Summary generated');
    } catch (error) {
      toast.error('AI Summary error');
    } finally {
      setAiLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formDataUpload,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      updateResumeData({ image: data.url });
      toast.success('Photo updated');
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setImageUploading(false);
    }
  };

  return (
    <div className="space-y-1">
      {/* Personal Information */}
      <AccordionSection 
        id="personal" 
        title="Хувийн мэдээлэл" 
        icon={User} 
        isOpen={openSection === 'personal'} 
        onToggle={() => setOpenSection(openSection === 'personal' ? null : 'personal')}
        completed={!!(currentResume.firstName && currentResume.email)}
      >
        <div className="flex justify-center mb-4">
          <div className="relative group">
            <div className="w-20 h-20 rounded-2xl bg-slate-100 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center transition-all group-hover:border-blue-100">
              {currentResume.image ? (
                <img src={currentResume.image} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <Camera className="h-6 w-6 text-slate-300" />
              )}
              {imageUploading && <div className="absolute inset-0 bg-white/60 flex items-center justify-center"><Loader2 className="h-4 w-4 animate-spin text-blue-600" /></div>}
            </div>
            <label className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1.5 rounded-lg shadow-md cursor-pointer hover:bg-blue-700 transition-all">
              <Plus className="h-3 w-3" />
              <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
            </label>
          </div>
        </div>

        <div className="space-y-1.5 mb-4">
          <Label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">CV-ийн нэр</Label>
          <Input name="title" value={currentResume.title || ''} onChange={handleInputChange} className="h-9 text-sm rounded-lg border-blue-100 bg-blue-50/20" placeholder="Жишээ: Миний үндсэн CV" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Нэр</Label>
            <Input name="firstName" value={currentResume.firstName || ''} onChange={handleInputChange} className="h-9 text-sm rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Овог</Label>
            <Input name="lastName" value={currentResume.lastName || ''} onChange={handleInputChange} className="h-9 text-sm rounded-lg" />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Албан тушаал</Label>
          <Input name="jobTitle" value={currentResume.jobTitle || ''} onChange={handleInputChange} className="h-9 text-sm rounded-lg" placeholder="Жишээ: Ахлах хөгжүүлэгч" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">И-мэйл</Label>
            <Input name="email" value={currentResume.email || ''} onChange={handleInputChange} className="h-9 text-sm rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Утас</Label>
            <Input name="phone" value={currentResume.phone || ''} onChange={handleInputChange} className="h-9 text-sm rounded-lg" />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Хаяг</Label>
          <Input name="address" value={currentResume.address || ''} onChange={handleInputChange} className="h-9 text-sm rounded-lg" />
        </div>

        <div className="space-y-1.5">
          <Label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">LinkedIn</Label>
          <Input name="linkedin" value={currentResume.linkedin || ''} onChange={handleInputChange} className="h-9 text-sm rounded-lg" placeholder="linkedin.com/in/username" />
        </div>
      </AccordionSection>

      {/* Summary */}
      <AccordionSection 
        id="summary" 
        title="Товч танилцуулга" 
        icon={FileText} 
        isOpen={openSection === 'summary'} 
        onToggle={() => setOpenSection(openSection === 'summary' ? null : 'summary')}
        completed={!!currentResume.summary}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Өөрийн тухай</Label>
            <Button variant="ghost" size="sm" onClick={handleAISummary} disabled={aiLoading} className="h-6 text-[9px] text-blue-600 hover:bg-blue-50 uppercase font-black tracking-widest">
              {aiLoading ? <Loader2 className="h-2 w-2 animate-spin mr-1" /> : <Zap className="h-2 w-2 mr-1" />}
              AI-аар бичих
            </Button>
          </div>
          <Textarea name="summary" value={currentResume.summary || ''} onChange={handleInputChange} className="min-h-[120px] text-sm rounded-xl resize-none" placeholder="Өөрийн туршлага, ур чадвараа товч тайлбарла..." />
        </div>
      </AccordionSection>

      {/* Experience */}
      <AccordionSection 
        id="experience" 
        title="Ажлын туршлага" 
        icon={Briefcase} 
        isOpen={openSection === 'experience'} 
        onToggle={() => setOpenSection(openSection === 'experience' ? null : 'experience')}
        completed={currentResume.experience && currentResume.experience.length > 0}
      >
        <div className="space-y-4">
          {currentResume.experience?.map((exp) => (
            <div key={exp.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 relative group">
              <button onClick={() => removeExperience(exp.id)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="h-3.5 w-3.5" /></button>
              <p className="text-xs font-bold text-slate-900">{exp.position}</p>
              <p className="text-[10px] text-slate-500">{exp.company} • {exp.startDate} - {exp.isCurrent ? 'Одоо' : exp.endDate}</p>
            </div>
          ))}
          <div className="p-4 rounded-xl border-2 border-dashed border-slate-100 space-y-3 bg-white/50">
            <Input value={newExp.position} onChange={(e) => setNewExp({ ...newExp, position: e.target.value })} placeholder="Албан тушаал" className="h-8 text-xs" />
            <Input value={newExp.company} onChange={(e) => setNewExp({ ...newExp, company: e.target.value })} placeholder="Компани" className="h-8 text-xs" />
            <div className="grid grid-cols-2 gap-2">
              <Input type="month" value={newExp.startDate} onChange={(e) => setNewExp({ ...newExp, startDate: e.target.value })} className="h-8 text-xs" />
              <Input type="month" value={newExp.endDate} onChange={(e) => setNewExp({ ...newExp, endDate: e.target.value })} className="h-8 text-xs" />
            </div>
            <Button 
              onClick={() => {
                if (newExp.position && newExp.company) {
                  addExperience(newExp);
                  setNewExp({ company: '', position: '', startDate: '', endDate: '', description: '', isCurrent: false });
                }
              }}
              className="w-full h-8 text-[10px] font-bold bg-blue-600 hover:bg-blue-700"
            >
              Туршлага нэмэх
            </Button>
          </div>
        </div>
      </AccordionSection>

      {/* Education */}
      <AccordionSection 
        id="education" 
        title="Боловсрол" 
        icon={GraduationCap} 
        isOpen={openSection === 'education'} 
        onToggle={() => setOpenSection(openSection === 'education' ? null : 'education')}
        completed={currentResume.education && currentResume.education.length > 0}
      >
        <div className="space-y-4">
          {currentResume.education?.map((edu) => (
            <div key={edu.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 relative group">
              <button onClick={() => removeEducation(edu.id)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="h-3.5 w-3.5" /></button>
              <p className="text-xs font-bold text-slate-900">{edu.degree}</p>
              <p className="text-[10px] text-slate-500">{edu.institution} • {edu.startDate} - {edu.endDate}</p>
            </div>
          ))}
          <div className="p-4 rounded-xl border-2 border-dashed border-slate-100 space-y-3 bg-white/50">
            <Input value={newEdu.degree} onChange={(e) => setNewEdu({ ...newEdu, degree: e.target.value })} placeholder="Зэрэг / Мэргэжил" className="h-8 text-xs" />
            <Input value={newEdu.institution} onChange={(e) => setNewEdu({ ...newEdu, institution: e.target.value })} placeholder="Сургууль" className="h-8 text-xs" />
            <div className="grid grid-cols-2 gap-2">
              <Input type="month" value={newEdu.startDate} onChange={(e) => setNewEdu({ ...newEdu, startDate: e.target.value })} className="h-8 text-xs" />
              <Input type="month" value={newEdu.endDate} onChange={(e) => setNewEdu({ ...newEdu, endDate: e.target.value })} className="h-8 text-xs" />
            </div>
            <Button 
              onClick={() => {
                if (newEdu.degree && newEdu.institution) {
                  addEducation(newEdu);
                  setNewEdu({ institution: '', degree: '', startDate: '', endDate: '' });
                }
              }}
              className="w-full h-8 text-[10px] font-bold bg-blue-600 hover:bg-blue-700"
            >
              Боловсрол нэмэх
            </Button>
          </div>
        </div>
      </AccordionSection>

      {/* Skills */}
      <AccordionSection 
        id="skills" 
        title="Ур чадвар" 
        icon={Star} 
        isOpen={openSection === 'skills'} 
        onToggle={() => setOpenSection(openSection === 'skills' ? null : 'skills')}
        completed={currentResume.skills && currentResume.skills.length > 0}
      >
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {currentResume.skills?.map((skill) => (
              <div key={skill.id} className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold border border-blue-100">
                {skill.name}
                <button onClick={() => removeSkill(skill.id)}><Trash2 className="h-2.5 w-2.5 hover:text-red-500" /></button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="Ур чадвар нэмэх..." className="h-8 text-xs" />
            <Button onClick={() => { if (newSkill) { addSkill({ name: newSkill }); setNewSkill(''); } }} className="h-8 px-3 bg-blue-600"><Plus className="h-3.5 w-3.5" /></Button>
          </div>
        </div>
      </AccordionSection>

      {/* Languages */}
      <AccordionSection 
        id="languages" 
        title="Хэлний мэдлэг" 
        icon={Globe} 
        isOpen={openSection === 'languages'} 
        onToggle={() => setOpenSection(openSection === 'languages' ? null : 'languages')}
        completed={currentResume.languages && currentResume.languages.length > 0}
      >
        <div className="space-y-4">
          {currentResume.languages?.map((lang) => (
            <div key={lang.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-xs">
              <span className="font-bold">{lang.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-blue-600 uppercase font-bold">{lang.level}</span>
                <button onClick={() => removeLanguage(lang.id)} className="text-slate-300 hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
              </div>
            </div>
          ))}
          <div className="p-3 rounded-xl border-2 border-dashed border-slate-100 space-y-2 bg-white/50">
            <Input value={newLang.name} onChange={(e) => setNewLang({ ...newLang, name: e.target.value })} placeholder="Хэл" className="h-8 text-xs" />
            <select value={newLang.level} onChange={(e) => setNewLang({ ...newLang, level: e.target.value as any })} className="w-full h-8 text-[10px] rounded-md border border-slate-200 bg-white px-2">
              <option value="basic">Анхан шат</option>
              <option value="intermediate">Дунд шат</option>
              <option value="fluent">Ахисан шат</option>
              <option value="native">Төрөлх хэл</option>
            </select>
            <Button onClick={() => { if (newLang.name) { addLanguage(newLang); setNewLang({ name: '', level: 'basic' }); } }} className="w-full h-8 text-[10px] font-bold bg-blue-600">Хэл нэмэх</Button>
          </div>
        </div>
      </AccordionSection>

      {/* Projects */}
      <AccordionSection 
        id="projects" 
        title="Төслүүд" 
        icon={PlusCircle} 
        isOpen={openSection === 'projects'} 
        onToggle={() => setOpenSection(openSection === 'projects' ? null : 'projects')}
        completed={currentResume.projects && currentResume.projects.length > 0}
      >
        <div className="space-y-4">
          {currentResume.projects?.map((p) => (
            <div key={p.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 relative group">
              <button onClick={() => removeProject(p.id)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="h-3.5 w-3.5" /></button>
              <p className="text-xs font-bold text-slate-900">{p.name}</p>
              {p.link && <p className="text-[9px] text-blue-500 truncate">{p.link}</p>}
            </div>
          ))}
          <div className="p-3 rounded-xl border-2 border-dashed border-slate-100 space-y-2 bg-white/50">
            <Input value={newProject.name} onChange={(e) => setNewProject({ ...newProject, name: e.target.value })} placeholder="Төслийн нэр" className="h-8 text-xs" />
            <Input value={newProject.link} onChange={(e) => setNewProject({ ...newProject, link: e.target.value })} placeholder="Линк (заавал биш)" className="h-8 text-xs" />
            <Button onClick={() => { if (newProject.name) { addProject(newProject); setNewProject({ name: '', link: '', description: '', startDate: '', endDate: '' }); } }} className="w-full h-8 text-[10px] font-bold bg-blue-600">Төсөл нэмэх</Button>
          </div>
        </div>
      </AccordionSection>

      {/* Extra Sections Toggle */}
      <div className="pt-6 mt-6 border-t border-slate-100 px-2">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Нэмэлт хэсгүүд</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'awards', label: 'Шагнал', icon: Award },
            { id: 'volunteers', label: 'Сайн дурын ажил', icon: Heart },
            { id: 'hobbies', label: 'Хобби', icon: BookOpen },
            { id: 'memberships', label: 'Гишүүнчлэл', icon: Users }
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setOpenSection(item.id)}
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all gap-2 group"
            >
              <item.icon className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-all" />
              <span className="text-[9px] font-bold text-slate-500 group-hover:text-slate-900 transition-all">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
