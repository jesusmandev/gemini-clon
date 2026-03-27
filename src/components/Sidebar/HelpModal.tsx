import { X, HelpCircle, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const faqs = [
  {
    question: "¿Qué es este clon de Gemini?",
    answer: "Es una recreación de la interfaz de Google Gemini, construida con React, Tailwind CSS y la API de google/generative-ai para demostrar capacidades de clones de UI y peticiones a la API."
  },
  {
    question: "¿Cómo uso la transcripción de voz (micrófono)?",
    answer: "Haz clic en el ícono del micrófono en la barra de entrada. Se te pedirán permisos; una vez concedidos, simplemente habla y tu texto se transcribirá."
  },
  {
    question: "¿Puedo subir imágenes?",
    answer: "¡Sí! Utiliza el ícono de '+' o 'Imágenes' a la izquierda para seleccionar un archivo. Por ahora admite modelos que soporten envío multimodal."
  },
  {
    question: "¿Cómo borro mi historial?",
    answer: "Ve a Configuración (ícono del engranaje en la barra lateral) y en la parte inferior encontrarás un botón rojo para borrar todo el historial."
  }
];

const HelpModal = ({ isOpen, onClose }: HelpModalProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-theme-card border border-theme-border w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-theme-border bg-theme-sidebar sticky top-0 z-10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gemini-blue/10 text-gemini-blue rounded-xl">
                <HelpCircle size={20} />
              </div>
              <h2 className="text-xl font-medium text-theme-text">Preguntas Frecuentes</h2>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-theme-text/10 rounded-full transition-colors text-theme-text opacity-70 hover:opacity-100"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-4 overflow-y-auto no-scrollbar flex-1">
            <div className="space-y-2">
              {faqs.map((faq, index) => {
                const isOpen = openIndex === index;
                return (
                  <div 
                    key={index} 
                    className={`border transition-all duration-200 rounded-2xl overflow-hidden ${
                      isOpen ? 'border-theme-text/30 bg-theme-text/5' : 'border-theme-border hover:bg-theme-text/5'
                    }`}
                  >
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                      className="w-full text-left p-4 flex items-center justify-between group"
                    >
                      <span className={`text-sm font-medium transition-colors ${isOpen ? 'text-theme-text' : 'text-theme-text opacity-80 group-hover:opacity-100'}`}>
                        {faq.question}
                      </span>
                      <ChevronRight 
                        size={18} 
                        className={`text-theme-text opacity-50 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} 
                      />
                    </button>
                    
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="px-4 pb-4 pt-1 text-sm text-theme-text opacity-70 leading-relaxed border-t border-theme-text/10">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default HelpModal;
