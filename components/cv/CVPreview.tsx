'use client';

import { useCVStore } from '@/lib/cv-store';
import ProfessionalTemplate from '@/components/templates/ProfessionalTemplate';
import ModernTemplate from '@/components/templates/ModernTemplate';
import MinimalTemplate from '@/components/templates/MinimalTemplate';
import LambdaTemplate from '@/components/templates/LambdaTemplate';

export default function CVPreview() {
  const { currentResume } = useCVStore();

  if (!currentResume) return null;

  const renderTemplate = () => {
    switch (currentResume.template) {
      case 'modern':
        return <ModernTemplate resume={currentResume as any} />;
      case 'minimal':
        return <MinimalTemplate resume={currentResume as any} />;
      case 'lambda':
        return <LambdaTemplate resume={currentResume as any} />;
      case 'professional':
      default:
        return <ProfessionalTemplate resume={currentResume as any} />;
    }
  };

  return (
    <div className="w-full bg-slate-100 p-8 flex justify-center">
      <div className="w-full max-w-[800px] aspect-[1/1.4142] bg-white shadow-2xl origin-top">
        {renderTemplate()}
      </div>
    </div>
  );
}
