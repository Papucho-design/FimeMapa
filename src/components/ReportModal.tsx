import React, { useState } from 'react';
import { X, Send, CheckCircle2 } from 'lucide-react';
import { sendReport } from '../utils/api';

interface ReportModalProps {
  roomId: string;
  roomLabel: string;
  onClose: () => void;
}

/** Reporte público de una ubicación incorrecta. Llega como Issue al repositorio. */
export const ReportModal: React.FC<ReportModalProps> = ({ roomId, roomLabel, onClose }) => {
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim().length < 5) {
      setError('Cuéntanos un poco más (mínimo 5 caracteres).');
      return;
    }
    setStatus('sending');
    setError('');
    try {
      await sendReport({ roomId, roomLabel, message: message.trim(), contact: contact.trim() || undefined, website });
      setStatus('done');
    } catch (err) {
      setStatus('idle');
      setError(err instanceof Error ? err.message : 'No se pudo enviar el reporte.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 p-4" role="dialog" aria-modal="true" aria-label="Reportar ubicación">
      <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Reportar ubicación</h2>
            <p className="text-xs text-slate-500">Salón {roomLabel}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100" aria-label="Cerrar">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {status === 'done' ? (
          <div className="text-center py-4 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <p className="text-sm font-bold text-slate-900">¡Gracias! Revisaremos el reporte.</p>
            <button onClick={onClose} className="bg-emerald-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl">
              Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <label className="block text-xs font-bold text-slate-700">
              ¿Qué está mal?
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={500}
                rows={4}
                placeholder="Ej. El salón está en el 3.er piso, no en el 2.º."
                className="mt-1 w-full border-2 border-slate-200 focus:border-emerald-600 rounded-xl p-3 text-sm font-normal outline-none"
              />
            </label>
            <label className="block text-xs font-bold text-slate-700">
              Contacto (opcional)
              <input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                maxLength={80}
                placeholder="Correo o matrícula, por si hay dudas"
                className="mt-1 w-full border-2 border-slate-200 focus:border-emerald-600 rounded-xl p-3 text-sm font-normal outline-none"
              />
            </label>
            {/* Honeypot: invisible para personas, los bots lo llenan */}
            <input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute -left-[9999px] w-px h-px opacity-0"
            />
            {error && <p className="text-xs font-semibold text-red-600" role="alert">{error}</p>}
            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-extrabold text-sm py-3 rounded-xl flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {status === 'sending' ? 'Enviando…' : 'Enviar reporte'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
