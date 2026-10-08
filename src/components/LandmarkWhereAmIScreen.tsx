import { FIME_PHOTOS } from '../data/photos';
import { ArrowLeft, MapPin } from 'lucide-react';

interface LandmarkWhereAmIScreenProps {
  onSelectOrigin: (nodeId: string) => void;
  onBack: () => void;
}

export const LandmarkWhereAmIScreen: React.FC<LandmarkWhereAmIScreenProps> = ({
  onSelectOrigin,
  onBack
}) => {
  const landmarksList = [
    { id: 'entrance-main', name: 'Entrada Principal FIME', photoKey: 'entrance-main', desc: 'Arco peatonal principal sobre Pedro de Alba' },
    { id: 'jardin-oso-node', name: 'Jardín del Oso', photoKey: 'jardin-oso', desc: 'Monumento al Oso y área verde central' },
    { id: 'cafeteria-node', name: 'Cafetería Central', photoKey: 'cafeteria', desc: 'Comedor y plazoleta de descanso' },
    { id: 'building-7', name: 'Edificio 7', photoKey: 'building-7', desc: 'Fachada frontal del Edificio 7' },
    { id: 'building-6', name: 'Edificio 6 (Física)', photoKey: 'building-6', desc: 'Entrada a laboratorios de física' },
    { id: 'building-2', name: 'Edificio 2', photoKey: 'building-2', desc: 'Frente al pasillo principal' },
    { id: 'building-12', name: 'Edificio 12 / Biblioteca', photoKey: 'building-12', desc: 'Fachada vidriada de Biblioteca Central' },
    { id: 'cidet-node', name: 'CIDET', photoKey: 'cidet', desc: 'Centro de Investigación en extremo norte' }
  ];

  return (
    <div className="w-full max-w-md mx-auto px-4 py-4 space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>

        <span className="text-sm font-extrabold text-slate-900">
          Ubicación por Referencia
        </span>
      </div>

      <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 text-amber-900 space-y-1">
        <h2 className="text-sm font-extrabold flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-amber-600" />
          ¿No sabes dónde estás en FIME?
        </h2>
        <p className="text-xs text-amber-800 leading-relaxed">
          Mira a tu alrededor. Selecciona la foto que más se parezca al lugar donde estás parado y lo usaremos como punto de inicio.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {landmarksList.map((item) => {
          const photo = FIME_PHOTOS[item.photoKey];
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectOrigin(item.id);
                onBack();
              }}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all text-left group"
            >
              <div className="h-28 overflow-hidden bg-slate-100 relative">
                {photo?.url ? (
                  <img
                    src={photo.url}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-bold">
                    [Foto Landmark]
                  </div>
                )}
                <span className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm">
                  Estoy aquí
                </span>
              </div>
              <div className="p-3 space-y-0.5">
                <h3 className="font-extrabold text-xs text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {item.name}
                </h3>
                <p className="text-[11px] text-slate-500 line-clamp-1">
                  {item.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
