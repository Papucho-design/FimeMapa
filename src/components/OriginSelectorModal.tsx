import { MapPin, X, Check } from 'lucide-react';

interface OriginSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedOriginId: string;
  onSelectOrigin: (nodeId: string) => void;
}

export const OriginSelectorModal: React.FC<OriginSelectorModalProps> = ({
  isOpen,
  onClose,
  selectedOriginId,
  onSelectOrigin
}) => {
  if (!isOpen) return null;

  const originOptions = [
    { id: 'entrance-main',     label: 'Entrada Principal FIME',   category: 'Acceso' },
    { id: 'cafeteria-node',    label: 'Cafetería & Snack FIME',   category: 'Servicios' },
    { id: 'jardin-oso-node',   label: 'Jardín del Oso de FIME',   category: 'Punto de referencia' },
    { id: 'building-1',        label: 'Edificio 1',               category: 'Aulas' },
    { id: 'building-2',        label: 'Edificio 2',               category: 'Aulas' },
    { id: 'building-3',        label: 'Edificio 3',               category: 'Aulas' },
    { id: 'building-4',        label: 'Edificio 4',               category: 'Aulas' },
    { id: 'building-5',        label: 'Edificio 5',               category: 'Laboratorios' },
    { id: 'building-6',        label: 'Edificio 6',               category: 'Laboratorios' },
    { id: 'building-7',        label: 'Edificio 7',               category: 'Aulas / Laboratorios' },
    { id: 'building-8',        label: 'Edificio 8',               category: 'Talleres' },
    { id: 'building-9',        label: 'Edificio 9',               category: 'Aulas' },
    { id: 'building-11',       label: 'Edificio 11',              category: 'Servicios' },
    { id: 'building-12',       label: 'Biblioteca (Edificio 12)', category: 'Biblioteca' },
    { id: 'building-cidet',    label: 'CIDET',                    category: 'Investigación' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 p-5 space-y-4 max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-700" />
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                ¿Dónde estás ubicado?
              </h2>
              <p className="text-xs text-slate-500">Selecciona tu punto de partida en FIME</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto space-y-2 pr-1 flex-1">
          {originOptions.map((opt) => {
            const isSelected = selectedOriginId === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => {
                  onSelectOrigin(opt.id);
                  onClose();
                }}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold shadow-sm'
                    : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100 text-slate-800'
                }`}
              >
                <div>
                  <span className="text-xs font-bold block">{opt.label}</span>
                  <span className="text-[10px] text-slate-500 font-medium">{opt.category}</span>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
