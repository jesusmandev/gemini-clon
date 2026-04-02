import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import SettingsModal from './SettingsModal';
import { Context } from "../../context/Context";
import ChatBubble from "./ChatBubble";
import {
  Plus,
  Mic,
  Send,
  Menu,
  Paperclip,
  X,
  Image as ImageIcon,
  Sun,
  Moon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSpeechToText } from "../../hooks/useSpeechToText";
import { fileToGenerativePart } from "../../config/gemini";

const ALL_SUGGESTIONS = [
  { text: "Explícame la computación cuántica de forma sencilla" },
  { text: "Dame 3 ideas de desayunos saludables y rápidos" },
  { text: "¿Cómo puedo mejorar mi concentración al estudiar?" },
  { text: "Redacta un correo profesional pidiendo una reunión" },
  { text: "Genera una rutina de ejercicios en casa de 20 minutos" },
  { text: "¿Cuáles son las mejores estrategias para ahorrar dinero?" },
  { text: "Explícame cómo funciona la inteligencia artificial general" },
  { text: "Dime un dato curioso sobre la historia del internet" }
];

const Main = () => {
  const {
    onSent,
    stopGeneration,
    showResult,
    loading,
    messages,
    setInput,
    input,
    isSettingsOpen,
    setIsSettingsOpen,
    activeChatId,
    chats,
    newChat,
    setIsMobileMenuOpen,
    theme,
    setTheme
  } = useContext(Context)!;

  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [speechToast, setSpeechToast] = useState<string | null>(null);

  // Actualizamos el input cuando el dictado de voz nos devuelve texto.
  const handleSpeechResult = useCallback((text: string) => {
    setInput(text);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSpeechEnviar = useCallback(() => {
    onSent("");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { isListening, toggleListening, error: speechError } = useSpeechToText({
    onResult: handleSpeechResult,
    onCommandEnviar: handleSpeechEnviar,
  });

  useEffect(() => {
    if (speechError) {
      setSpeechToast(speechError);
      const t = setTimeout(() => setSpeechToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [speechError]);

  const activeChat = chats.find(c => c.id === activeChatId);
  const displayWelcome = !activeChat || activeChat.messages.length === 0 || !showResult;

  const suggestions = useMemo(() => {
    const shuffled = [...ALL_SUGGESTIONS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 4);
  }, []);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll: Cada vez que hay mensajes nuevos o el bot está escribiendo,
  // nos aseguramos de que la vista baje hasta el final automáticamente.
  useEffect(() => {
    if (!chatContainerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });

    resizeObserver.observe(chatContainerRef.current);
    return () => resizeObserver.disconnect();
  }, [messages]);




  // Manejo de archivos. Si es imagen, la previsualizamos; si es otro tipo,
  // simplemente añadimos una etiqueta al texto (simulación).
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedImage(file);
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setInput((prev) => prev + ` [Archivo: ${file.name}] `);
      }
      setShowAttachmentMenu(false);
    }
  };

  const removeImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedImage(null);
    setPreviewUrl(null);
  };

  // Función para enviar el mensaje final. Procesa la imagen a Base64 si existe
  // y llama a la función onSent del contexto.
  const handleSent = async (prompt?: string) => {
    const text = prompt || input;
    if (!text && !selectedImage) return;

    let imageData;
    if (selectedImage) {
      imageData = await fileToGenerativePart(selectedImage);
    }

    onSent(text, imageData?.inlineData);
    removeImage();
  };

  return (
    <div className="flex-1 h-screen overflow-hidden flex flex-col items-center relative transition-colors duration-300 bg-theme-bg text-theme-text">

      {/* Speech Error Toast */}
      <AnimatePresence>
        {speechToast && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 bg-red-900/90 border border-red-700 text-red-100 text-sm px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2"
          >
            🎙️ {speechToast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navbar */}
      <header className="w-full flex items-center justify-between p-4 md:px-8 shrink-0 z-10 border-b border-[var(--border)]">
        <div className="flex items-center gap-3 group">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -ml-2 hover:bg-theme-text/10 rounded-full md:hidden transition-colors"
          >
            <Menu size={20} className="text-theme-text opacity-70" />
          </button>
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => newChat()}>
            <img src={`${import.meta.env.BASE_URL}gemini-color.svg`} alt="Gemini" className="w-7 h-7 group-hover:scale-110 transition-transform" />
            <h1 className="text-xl font-medium text-theme-text tracking-tight">Gemini</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 hover:bg-theme-text/10 rounded-full transition-colors text-theme-text opacity-70 hover:opacity-100"
            title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-4xl px-4 flex-1 flex flex-col overflow-y-auto minimal-scrollbar py-8">
        {displayWelcome ? (
          <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
            <div className="mb-8 flex flex-col items-center">
              <div className="p-4 bg-[var(--card)] rounded-3xl mb-4 border border-[var(--border)] shadow-xl shadow-gemini-blue/5">
                <img src={`${import.meta.env.BASE_URL}gemini-color.svg`} alt="Gemini" className="w-12 h-12" />
              </div>
              <h2 className="text-4xl md:text-[56px] font-medium tracking-tight text-center text-[#0d47a1] dark:text-gray-100 mb-2">
                Hola
              </h2>
              <p className="text-4xl md:text-[56px] font-medium tracking-tight text-center text-[#174ea6]/70 dark:text-gray-500">¿En que puedo ayudarte hoy?</p>
            </div>

            {/* Dynamic Suggestions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl mb-16 mt-8">
              {suggestions.map((s, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.4, ease: "easeOut" }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSent(s.text)}
                  className="flex flex-col items-start gap-3 text-left p-6 rounded-[24px] bg-[#e8f0fe] dark:bg-[#1e1f20] hover:bg-[#d2e3fc] dark:hover:bg-[#2a2b2f] transition-colors shadow-sm"
                >
                  <span className="text-[16px] font-medium text-[#041e49] dark:text-[#e3e3e3] leading-relaxed">
                    {s.text}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <div ref={chatContainerRef} className="space-y-4 pb-20">
            {messages.map((msg, index) => (
              <ChatBubble key={`${activeChatId}-${index}`} message={msg} />
            ))}
            {loading && (
              <div className="flex justify-start items-center gap-2 text-theme-text opacity-50 animate-pulse ml-4 mb-8">
                <img src={`${import.meta.env.BASE_URL}gemini-color.svg`} alt="Thinking" className="w-5 h-5 animate-spin duration-slow" />
                <span className="text-sm">Gemini está pensando...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        )}
      </main>

      {/* Floating Input Area */}
      <footer className="w-full max-w-4xl px-4 pb-8 shrink-0" role="contentinfo">
        <div className="bg-[#f0f4f9] dark:bg-[#1e1f20] rounded-[2rem] p-2 flex flex-col gap-2 transition-all duration-300 focus-within:ring-2 focus-within:ring-blue-500/20 group">
          <div className="flex items-center px-4 py-2">
            {/* Image Preview */}
            <AnimatePresence>
              {previewUrl && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  className="px-4 pt-2 flex"
                >
                  <div className="relative group/img">
                    <img 
                      src={previewUrl} 
                      alt="Vista previa de la imagen seleccionada" 
                      className="h-20 w-20 object-cover rounded-xl border border-theme-border shadow-lg" 
                    />
                    <button 
                      onClick={removeImage}
                      aria-label="Eliminar imagen seleccionada"
                      className="absolute -top-2 -right-2 bg-theme-sidebar border border-theme-border text-theme-text p-1 rounded-full opacity-0 group-hover/img:opacity-100 transition-opacity shadow-xl"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <textarea
              rows={1}
              onChange={(e) => setInput(e.target.value)}
              value={input}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSent();
                }
              }}
              placeholder="¿Qué tienes en mente?"
              aria-label="Entrada de mensaje para Gemini"
              className="flex-1 bg-transparent border-none outline-none text-lg text-[#041e49] dark:text-gray-100 placeholder-[#174ea6]/60 dark:placeholder-gray-400 resize-none minimal-scrollbar h-full max-h-48 py-2"
            />
            <div className="flex items-center gap-3 text-theme-text opacity-70 relative">
              {/* Attachment Menu Popup */}
              <AnimatePresence>
                {showAttachmentMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: -20 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    role="menu"
                    className="absolute bottom-full left-0 mb-4 bg-theme-card border border-theme-border rounded-2xl p-2 shadow-2xl z-50 min-w-[200px]"
                  >
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      role="menuitem"
                      className="w-full flex items-center gap-3 p-3 hover:bg-theme-text/10 rounded-xl transition-colors text-theme-text opacity-80 hover:opacity-100"
                    >
                      <Paperclip size={18} />
                      <span className="text-sm font-medium">Subir archivos</span>
                    </button>
                    <button 
                      onClick={() => photoInputRef.current?.click()}
                      role="menuitem"
                      className="w-full flex items-center gap-3 p-3 hover:bg-theme-text/10 rounded-xl transition-colors text-theme-text opacity-80 hover:opacity-100"
                    >
                      <ImageIcon size={18} />
                      <span className="text-sm font-medium">Fotos</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Hidden Inputs */}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileUpload} 
                aria-hidden="true"
              />
              <input 
                type="file" 
                accept="image/*" 
                ref={photoInputRef} 
                className="hidden" 
                onChange={handleFileUpload} 
                aria-hidden="true"
              />

              <button 
                title="Adjuntar" 
                aria-label="Abrir menú de adjuntos"
                aria-expanded={showAttachmentMenu}
                onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                className={`p-2 hover:bg-theme-text/10 rounded-full transition-all ${showAttachmentMenu ? 'bg-theme-text/10 text-theme-text rotate-45' : ''}`}
              >
                <Plus size={22} />
              </button>
              
              <motion.button 
                aria-label={isListening ? "Detener dictado de voz" : "Iniciar dictado de voz"}
                title={isListening ? "Escuchando..." : "Grabar audio"}
                onClick={toggleListening}
                animate={isListening ? {
                  scale: [1, 1.2, 1],
                  backgroundColor: ["#3f3f46", "#ef4444", "#3f3f46"]
                } : { scale: 1 }}
                transition={isListening ? {
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                } : {}}
                className={`p-2 rounded-full transition-colors ${isListening ? 'text-theme-bg' : 'hover:bg-theme-text/10 text-theme-text opacity-70'}`}
              >
                <Mic size={22} color={isListening ? "#fff" : "currentColor"} />
              </motion.button>
              <AnimatePresence mode="popLayout">
                {loading ? (
                  <motion.button 
                    key="stop-btn"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    onClick={stopGeneration}
                    className="p-1 rounded-full hover:bg-theme-text/10 transition-all transform active:scale-95 ml-1"
                    aria-label="Detener generación de respuesta"
                    title="Detener generación"
                  >
                    <img src={`${import.meta.env.BASE_URL}boton-detener.png`} alt="Detener" className="w-8 h-8 object-contain" />
                  </motion.button>
                ) : (input.trim() || selectedImage) ? (
                  <motion.button 
                    key="send-btn"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    aria-label="Enviar mensaje"
                    title="Enviar" 
                    onClick={() => handleSent()}
                    className="p-2 bg-theme-text text-theme-bg rounded-full hover:opacity-80 transition-all transform active:scale-95 ml-1"
                  >
                    <Send size={18} />
                  </motion.button>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        </div>
        <p className="text-[10px] text-theme-text opacity-60 text-center mt-3 uppercase tracking-widest font-medium">
          Gemini puede ofrecer información imprecisa. Verifica siempre los datos.
        </p>
      </footer>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
};

export default Main;
