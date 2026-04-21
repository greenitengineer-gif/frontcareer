import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CV } from '@/types';
import { Label } from '@/components/ui/label';
import { PlusCircle, FileText, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CVSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  cvs: CV[];
  onSelect: (cvId: string) => void;
  onSetPrimary: (cvId: string) => Promise<void>;
  primaryCvId?: string | null;
}

export const CVSelectionModal = ({ isOpen, onClose, cvs, onSelect, onSetPrimary, primaryCvId }: CVSelectionModalProps) => {
  const router = useRouter();
  const [selectedCv, setSelectedCv] = useState<string | undefined>(primaryCvId || undefined);

  useEffect(() => {
    setSelectedCv(primaryCvId || undefined);
  }, [primaryCvId, isOpen]);

  const handleContinue = () => {
    if (selectedCv) {
      onSelect(selectedCv);
    }
  };

  const handleSetPrimaryAndContinue = async () => {
    if (selectedCv) {
      await onSetPrimary(selectedCv);
      onSelect(selectedCv);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-8 rounded-3xl border-none shadow-2xl">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold text-slate-900 tracking-tight">CV-гээ сонгоно уу</DialogTitle>
          <DialogDescription className="text-slate-500 font-medium leading-relaxed">
            Үргэлжлүүлэхийн тулд ашиглах CV-гээ сонгоно уу. Та нэгийг нь үндсэн CV болгож тохируулж болно.
          </DialogDescription>
        </DialogHeader>
        <div className="py-6 space-y-3">
          {cvs.length > 0 ? (
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {cvs.map(cv => (
                <div 
                  key={cv.id} 
                  onClick={() => setSelectedCv(cv.id)}
                  className={`group flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedCv === cv.id 
                    ? 'border-primary bg-primary/5 shadow-md shadow-primary/5' 
                    : 'border-slate-100 bg-slate-50/50 hover:border-slate-200 hover:bg-white'
                  }`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    selectedCv === cv.id ? 'bg-primary text-white' : 'bg-white text-slate-400 border border-slate-100'
                  }`}>
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold truncate ${selectedCv === cv.id ? 'text-slate-900' : 'text-slate-600'}`}>
                      {cv.title || (cv.lastName && cv.firstName ? `${cv.lastName} ${cv.firstName}` : cv.summary?.substring(0, 30) || 'Гарчиггүй CV')}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                      {new Date(cv.updatedAt).toLocaleDateString()} шинэчилсэн
                    </p>
                  </div>
                  {selectedCv === cv.id && (
                    <CheckCircle2 className="h-5 w-5 text-primary animate-in zoom-in" />
                  )}
                  {cv.id === primaryCvId && selectedCv !== cv.id && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg uppercase tracking-wider">Үндсэн</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 space-y-6">
              <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner">
                <FileText className="h-8 w-8 text-slate-300" />
              </div>
              <div className="space-y-2">
                <p className="font-bold text-slate-900">Танд CV үүсээгүй байна</p>
                <p className="text-sm text-slate-400 font-medium">Ажилд орохын тулд эхлээд CV-гээ үүсгэнэ үү.</p>
              </div>
              <Button onClick={() => router.push('/cv-builder')} className="rounded-xl h-12 px-8 font-bold bg-primary hover:bg-primary/90">
                <PlusCircle className="h-4 w-4 mr-2" />
                Шинэ CV үүсгэх
              </Button>
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} className="flex-1 h-12 rounded-xl font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-900">Болих</Button>
          {selectedCv && selectedCv !== primaryCvId ? (
            <Button onClick={handleSetPrimaryAndContinue} className="flex-1 h-12 rounded-xl font-bold bg-slate-900 hover:bg-slate-800 shadow-xl shadow-slate-200">Үндсэн болгоод үргэлжлүүлэх</Button>
          ) : (
            <Button onClick={handleContinue} disabled={!selectedCv} className="flex-1 h-12 rounded-xl font-bold bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20">Үргэлжлүүлэх</Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};