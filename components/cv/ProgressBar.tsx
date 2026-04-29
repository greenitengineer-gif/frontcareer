'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  steps: { id: number; name: string }[];
  currentStep: number;
  onStepClick?: (stepId: number) => void;
}

export default function ProgressBar({ steps, currentStep, onStepClick }: ProgressBarProps) {
  return (
    <div className="w-full py-8">
      <div className="relative flex justify-between items-center">
        {/* Progress Line */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 transition-all duration-500 ease-in-out"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {/* Steps */}
        {steps.map((step) => {
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;
          const canClick = !!onStepClick && step.id <= currentStep;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={() => (canClick ? onStepClick?.(step.id) : undefined)}
                disabled={!canClick}
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 border-4",
                  isCompleted ? "bg-blue-600 border-blue-100 text-white" : 
                  isActive ? "bg-white border-blue-600 text-blue-600 shadow-xl shadow-blue-600/20 scale-110" : 
                  "bg-white border-slate-100 text-slate-300",
                  canClick ? "cursor-pointer" : "cursor-default"
                )}
              >
                {isCompleted ? (
                  <Check className="h-6 w-6 stroke-[3px]" />
                ) : (
                  <span className="text-lg font-black">{step.id}</span>
                )}
              </button>
              <span 
                className={cn(
                  "hidden md:block text-[11px] font-black uppercase tracking-widest transition-colors duration-500",
                  isActive ? "text-blue-600" : isCompleted ? "text-slate-900" : "text-slate-400"
                )}
              >
                {step.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
