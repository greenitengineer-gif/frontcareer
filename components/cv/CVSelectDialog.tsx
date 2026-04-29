'use client';

import { Resume } from '@/types/cv';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, CheckCircle2, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface CVSelectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  resumes: Resume[];
  onApply: (resumeId: string) => void;
  isApplying: boolean;
}

export default function CVSelectDialog({ isOpen, onClose, resumes, onApply, isApplying }: CVSelectDialogProps) {
  const [selectedId, setSelectedId] = useState<string | null>(resumes[0]?.id || null);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-[2rem] p-8 border-none shadow-2xl">
        <DialogHeader className="space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileText className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <DialogTitle className="text-2xl font-black text-slate-900">Анкет илгээх</DialogTitle>
            <DialogDescription className="text-slate-500 font-bold">
              Та энэ ажилд илгээх CV-гээ сонгоно уу.
            </DialogDescription>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[300px] pr-4 mt-6">
          <div className="space-y-3">
            {resumes.map((resume) => (
              <div 
                key={resume.id}
                onClick={() => setSelectedId(resume.id)}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between group ${
                  selectedId === resume.id 
                    ? "border-blue-600 bg-blue-50/50" 
                    : "border-slate-100 bg-white hover:border-blue-100"
                }`}
              >
                <div className="space-y-1">
                  <p className={`font-black transition-colors ${selectedId === resume.id ? "text-blue-600" : "text-slate-900"}`}>
                    {resume.title}
                  </p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {resume.jobTitle || 'Мэргэжил тодорхойгүй'}
                  </p>
                </div>
                {selectedId === resume.id && (
                  <CheckCircle2 className="h-6 w-6 text-blue-600 animate-in zoom-in duration-300" />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter className="mt-8 flex gap-3">
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="flex-1 h-14 rounded-2xl font-black text-slate-400 hover:text-slate-900 hover:bg-slate-50"
          >
            Цуцлах
          </Button>
          <Button 
            onClick={() => selectedId && onApply(selectedId)}
            disabled={!selectedId || isApplying}
            className="flex-2 h-14 rounded-2xl font-black bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/20 transition-all px-10"
          >
            {isApplying ? <Loader2 className="h-5 w-5 animate-spin" /> : "Анкет илгээх"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
