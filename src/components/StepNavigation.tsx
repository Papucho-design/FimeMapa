import React, { useState } from 'react';
import type { NavigationStep } from '../types';
import { FimeMap } from './FimeMap';
import { ArrowLeft, ChevronLeft, ChevronRight, Map, HelpCircle, CheckCircle } from 'lucide-react';

interface StepNavigationProps {
  targetRoomTitle: string;
  buildingId: string;
  pathNodeIds: string[];
  startNodeId: string;
  steps: NavigationStep[];
  onBack: () => void;
  onOpenFullMap: () => void;
}

export const StepNavigation: React.FC<StepNavigationProps> = ({
  targetRoomTitle,
  buildingId,
  pathNodeIds,
  startNodeId,
  steps,
  onBack,
  onOpenFullMap
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showPhotoModal, setShowPhotoModal] = useState(true);

  if (!steps || steps.length === 0) return null;

  const currentStep = steps[currentStepIndex];
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === steps.length - 1;

  const handleNext = () => {
    if (!isLast) setCurrentStepIndex(prev => prev + 1);
  };

  const handlePrev = () => {
    if (!isFirst) setCurrentStepIndex(prev => prev - 1);
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-4 space-y-4 pb-20">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>

        <div className="text-right">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Navegando hacia
          </span>
          <span className="text-sm font-extrabold text-emerald-700">
            {targetRoomTitle}
          </span>
        </div>
      </div>

      {/* Mini Map View Container */}
      <div className="relative h-48 rounded-2xl overflow-hidden shadow-md border border-slate-200">
        <FimeMap
          selectedBuildingId={buildingId}
          targetRoomName={targetRoomTitle}
          pathNodeIds={pathNodeIds}
          startNodeId={startNodeId}
          interactive={false}
        />

        <button
          onClick={onOpenFullMap}
          className="absolute bottom-2.5 right-2.5 z-10 bg-slate-900/90 hover:bg-slate-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl border border-slate-700 shadow-md backdrop-blur-md flex items-center gap-1.5 transition-all"
        >
          <Map className="w-3.5 h-3.5 text-amber-400" />
          Ver mapa completo
        </button>
      </div>

      {/* Progress Step Counter Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Paso {currentStep.stepNumber} de {currentStep.totalSteps}
          </span>
          <span className="text-slate-400 text-[11px]">
            {Math.round(((currentStepIndex + 1) / steps.length) * 100)}% completado
          </span>
        </div>

        {/* Progress Bar Line */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-emerald-600 h-full transition-all duration-300 rounded-full"
            style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Step Title & Instruction */}
        <div className="space-y-1.5 pt-1">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            {currentStep.isDestination && <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />}
            {currentStep.title}
          </h2>
          <p className="text-sm font-medium text-slate-700 leading-relaxed">
            {currentStep.instruction}
          </p>
        </div>

        {/* Photo Reference Card ("¿No estás seguro de dónde estás?") */}
        {currentStep.photoUrl && (
          <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                ¿No estás seguro de dónde estás?
              </span>
              <button
                onClick={() => setShowPhotoModal(!showPhotoModal)}
                className="text-[11px] font-bold text-emerald-700 hover:underline"
              >
                {showPhotoModal ? 'Ocultar foto' : 'Mostrar foto'}
              </button>
            </div>

            {showPhotoModal && (
              <div className="bg-slate-50 rounded-2xl p-2.5 border border-slate-200 space-y-1.5">
                <img
                  src={currentStep.photoUrl}
                  alt={currentStep.title}
                  className="w-full h-36 object-cover rounded-xl shadow-sm border border-slate-200"
                />
                <p className="text-[11px] font-semibold text-slate-500 text-center">
                  📷 {currentStep.photoCaption || 'Foto de referencia de las instalaciones'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Navigation Step Control Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={handlePrev}
            disabled={isFirst}
            className="flex-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-800 font-bold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>

          <button
            onClick={handleNext}
            disabled={isLast}
            className="flex-1 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-xs py-3 rounded-xl shadow-sm shadow-emerald-700/20 transition-all flex items-center justify-center gap-1"
          >
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
