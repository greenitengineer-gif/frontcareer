'use client';

import React from 'react';
import { 
  FileText, 
  MessageSquare, 
  Search, 
  TrendingUp, 
  Lightbulb,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Users,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const ADVICE_CATEGORIES = [
  {
    id: 'cv',
    title: 'CV бичих зөвлөгөө',
    description: 'Мэргэжлийн CV хэрхэн бэлдэх, AI-д тохирсон байх тактикууд.',
    icon: FileText,
    color: 'bg-blue-50 text-blue-600',
    borderColor: 'border-blue-100',
    articles: [
      'Мэргэжлийн CV-ний бүтэц ямар байх ёстой вэ?',
      'AI (ATS) системд танигдахуйц CV бэлдэх нь',
      'Ур чадвараа хэрхэн зөв тодорхойлж бичих вэ?',
      'Ажлын туршлагаа үр дүнтэй харуулах аргууд'
    ]
  },
  {
    id: 'interview',
    title: 'Ярилцлагад бэлтгэх',
    description: 'Ажлын ярилцлагад өөрийгөө хэрхэн зөв илэрхийлэх, нийтлэг асуултууд.',
    icon: MessageSquare,
    color: 'bg-emerald-50 text-emerald-600',
    borderColor: 'border-emerald-100',
    articles: [
      'Ярилцлагын үеэр асуугддаг ТОП 10 асуулт',
      'Өөрийн давуу ба сул талыг хэрхэн ярих вэ?',
      'Биеийн хэлэмж ба анхны сэтгэгдэл',
      'Цалингийн хүлээлтээ хэрхэн зөв илэрхийлэх вэ?'
    ]
  },
  {
    id: 'search',
    title: 'Ажил хайх тактик',
    description: 'Хамгийн хурдан хугацаанд тохирох ажлаа олох шилдэг аргууд.',
    icon: Search,
    color: 'bg-purple-50 text-purple-600',
    borderColor: 'border-purple-100',
    articles: [
      'Linkedin-ийг ажил хайхад үр дүнтэй ашиглах',
      'Networking буюу танил талын хүрээгээ ашиглах нь',
      'Хувийн брэндээ хэрхэн хөгжүүлэх вэ?',
      'Remote (Зайнаас) ажил хэрхэн олох вэ?'
    ]
  },
  {
    id: 'career',
    title: 'Карьер хөгжил',
    description: 'Албан тушаал ахих, шинэ ур чадвар эзэмших зөвлөмжүүд.',
    icon: TrendingUp,
    color: 'bg-orange-50 text-orange-600',
    borderColor: 'border-orange-100',
    articles: [
      'Карьераа өөрчлөхөөр шийдсэн бол юуг анхаарах вэ?',
      'Мэргэжлийн өсөлтөд нөлөөлөх зөөлөн ур чадварууд',
      'Цаг төлөвлөлт ба бүтээмжийг нэмэгдүүлэх нь',
      'Урт хугацааны карьер төлөвлөлт'
    ]
  }
];

export default function AdvicePage() {
  return (
    <div className="min-h-screen bg-white py-12 md:py-20 px-4">
      <div className="max-w-5xl mx-auto space-y-20">
        
        {/* Hero Section */}
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 text-primary text-[11px] font-bold uppercase tracking-widest border border-primary/10">
            <Lightbulb className="h-3.5 w-3.5" /> Карьерын хөтөч
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
            Таны карьерт хэрэгтэй <span className="text-primary underline decoration-primary/20 underline-offset-4">мэргэжлийн</span> зөвлөгөө
          </h1>
          <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-2xl mx-auto">
            Бид танд ажил олох, ур чадвараа хөгжүүлэх, амжилттай ярилцлагад ороход тань туслах шилдэг зөвлөмжүүдийг бэлтгэлээ.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {ADVICE_CATEGORIES.map((cat) => (
            <div key={cat.id} className="group bg-white rounded-2xl p-8 border border-slate-100 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500">
              <div className="space-y-8">
                <div className="flex items-start justify-between">
                  <div className={`w-14 h-14 rounded-xl ${cat.color} flex items-center justify-center shadow-sm`}>
                    <cat.icon className="h-7 w-7" />
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 text-slate-200 group-hover:text-primary group-hover:bg-primary/5 transition-all duration-300">
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight group-hover:text-primary transition-colors">{cat.title}</h2>
                  <p className="text-slate-500 font-medium text-sm leading-relaxed">{cat.description}</p>
                </div>

                <div className="space-y-3 pt-6 border-t border-slate-50">
                  {cat.articles.map((article, i) => (
                    <div key={i} className="flex items-center gap-3 text-slate-600 hover:text-primary cursor-pointer group/item transition-all duration-200 py-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-100 group-hover/item:bg-primary transition-all" />
                      <span className="text-sm font-semibold tracking-tight">{article}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Rules Section */}
        <div className="bg-slate-900 rounded-3xl p-10 md:p-16 text-white relative overflow-hidden shadow-2xl shadow-slate-200">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-10">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
                Амжилттай ажил горилогчийн <br />
                <span className="text-primary">алтан дүрмүүд</span>
              </h2>
              <div className="space-y-6">
                {[
                  { icon: Target, title: 'Зорилгоо тодорхойлох', desc: 'Яг ямар чиглэлээр ажиллах хүсэлтэй байгаагаа эхлээд шийд.' },
                  { icon: BookOpen, title: 'Тасралтгүй суралцах', desc: 'Салбарынхаа шинэ тренд, технологиудыг цаг алдалгүй судал.' },
                  { icon: Users, title: 'Networking хийх', desc: 'Мэргэжлийн хүрээнийхэнтэйгээ холбоотой байж, туршлага солилц.' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-5">
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-lg">{item.title}</h4>
                      <p className="text-slate-400 text-sm font-medium leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-10 space-y-8">
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold tracking-tight text-white">CV-гээ бэлдсэн үү?</h3>
                <p className="text-slate-400 font-medium text-sm">Манай AI хөтөчийг ашиглан мэргэжлийн CV үүсгээрэй.</p>
              </div>
              <div className="space-y-4">
                {[
                  'Хэдхэн минутанд бэлэн болно',
                  'Олон төрлийн загварын сонголт',
                  'AI-аар нийцэл шалгах боломж'
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    </div>
                    <span className="font-semibold text-sm tracking-tight">{text}</span>
                  </div>
                ))}
              </div>
              <Button asChild className="w-full h-14 rounded-xl bg-primary hover:opacity-90 text-white font-bold text-base shadow-lg shadow-primary/20 transition-all active:scale-95">
                <Link href="/cv-builder">Одоо эхлэх</Link>
              </Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
