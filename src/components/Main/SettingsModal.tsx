import { useContext } from "react";
import { Context } from "../../context/Context";
import { X, Moon, Sun, Trash2, Cpu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const { theme, setTheme, selectedModel, setSelectedModel, clearAllChats } = useContext(Context)!;

  const themes = [
    { id: 'light', icon: Sun, label: 'Claro' },
    { id: 'dark', icon: Moon, label: 'Oscuro' }
  ] as const;

  const models = [
    { id: 'gemini-2.5-flash', label: 'Gemini 1.5 Flash', desc: 'Rápido y eficiente para tareas cotidianas' },
    { id: 'gemini-2.5-pro', label: 'Gemini 1.5 Pro', desc: 'Complejo y razonamiento avanzado' }
  ] as const;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-theme-card border border-theme-border w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-theme-border">
            <h2 className="text-xl font-medium text-theme-text">Configuración</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-theme-sidebar rounded-full transition-colors text-theme-text opacity-70 hover:opacity-100"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar">
            
            {/* Theme Section */}
            <section>
              <h3 className="text-sm font-medium text-theme-text opacity-70 mb-4 uppercase tracking-wider">Apariencia</h3>
              <div className="grid grid-cols-2 gap-3">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
                      theme === t.id 
                        ? 'bg-gemini-blue/10 border-gemini-blue text-gemini-blue' 
                        : 'bg-theme-sidebar border-theme-border text-theme-text opacity-70 hover:opacity-100 hover:border-theme-text'
                    }`}
                  >
                    <t.icon size={20} />
                    <span className="text-xs font-medium">{t.label}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Model Section */}
            <section>
              <h3 className="text-sm font-medium text-theme-text opacity-70 mb-4 uppercase tracking-wider">Modelo de IA</h3>
              <div className="space-y-3">
                {models.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedModel(m.id)}
                    className={`w-full flex items-start gap-4 p-4 rounded-2xl border transition-all text-left ${
                      selectedModel === m.id 
                        ? 'bg-gemini-blue/10 border-gemini-blue' 
                        : 'bg-theme-sidebar border-theme-border hover:border-theme-text'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${selectedModel === m.id ? 'text-gemini-blue' : 'text-theme-text opacity-50'}`}>
                      <Cpu size={20} />
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${selectedModel === m.id ? 'text-theme-text opacity-100' : 'text-theme-text opacity-80'}`}>
                        {m.label}
                      </p>
                      <p className="text-xs text-theme-text opacity-50 mt-1">{m.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Danger Zone */}
            <section className="pt-4 border-t border-theme-border">
              <button
                onClick={() => {
                  if (confirm("¿Estás seguro de que quieres borrar todo el historial? Esta acción no se puede deshacer.")) {
                    clearAllChats();
                    onClose();
                  }
                }}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-all font-medium text-sm"
              >
                <div className="flex items-center gap-3">
                  <Trash2 size={18} />
                  <span>Borrar todo el historial</span>
                </div>
              </button>
            </section>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SettingsModal;
