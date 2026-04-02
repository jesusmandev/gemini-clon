import { useState, useContext, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, Copy, ThumbsUp, ThumbsDown, RotateCcw, MoreVertical, Volume2, Share2 } from 'lucide-react';
import { Context, type Message } from '../../context/Context';

interface ChatBubbleProps {
  message: Message;
}

const ChatBubble = ({ message }: ChatBubbleProps) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [likeStatus, setLikeStatus] = useState<'none' | 'liked' | 'disliked'>('none');
  const { regenerate, loading, chats, activeChatId } = useContext(Context)!;
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMore(false);
      }
    };
    if (showMore) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMore]);

  const activeChat = chats.find(c => c.id === activeChatId);
  const isLastMessage = activeChat && activeChat.messages[activeChat.messages.length - 1] === message;
  const isTyping = !isUser && isLastMessage && loading;

  // Función sencilla para copiar texto al portapapeles con un feedback de 2 segundos.
  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Manejamos las reacciones (Like/Dislike). Si haces clic de nuevo, se quita la reacción.
  const handleLike = () => {
    setLikeStatus(prev => prev === 'liked' ? 'none' : 'liked');
  };

  const handleDislike = () => {
    setLikeStatus(prev => prev === 'disliked' ? 'none' : 'disliked');
  };

  // Activa la síntesis de voz del navegador para leer el mensaje.
  const handleListen = () => {
    const utterance = new SpeechSynthesisUtterance(message.text);
    utterance.lang = 'es-ES';
    window.speechSynthesis.speak(utterance);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Mensaje de Gemini',
        text: message.text,
      }).catch(console.error);
    } else {
      alert("La función de compartir no está disponible en este navegador.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} group mb-6`}
    >
      <div className={`flex flex-col max-w-[85%] md:max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          {/* Avatar del usuario o icono de Gemini */}
          <div className={`mt-1 shrink-0 ${isUser ? 'order-1' : ''}`}>
            {isUser ? (
              <img src={`${import.meta.env.BASE_URL}user_icon.png`} alt="Tú" className="w-8 h-8 rounded-full border border-theme-border shadow-sm" />
            ) : (
              <div className="w-8 h-8 bg-theme-sidebar border border-theme-border rounded-full flex items-center justify-center shadow-sm">
                <img src={`${import.meta.env.BASE_URL}gemini-color.svg`} alt="IA" className="w-5 h-5" />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1 w-full">
            {/* Burbuja de mensaje principal */}
            <div className={`
              px-5 py-3 rounded-[24px] text-[16px] leading-relaxed shadow-sm transition-all duration-300
              ${isUser 
                ? 'bg-[#e8f0fe] text-[#041e49] dark:bg-[#202124] dark:text-[#e2e8f0] border border-[#d2e3fc] dark:border-white/5 rounded-tr-[4px]' 
                : 'bg-transparent text-theme-text rounded-tl-[4px]'}
            `}>
              {message.image && (
                <div className="mb-3 rounded-xl overflow-hidden border border-theme-border">
                  <img src={`data:${message.image.mimeType};base64,${message.image.data}`} alt="Imagen adjunta" className="w-full max-h-[300px] object-contain bg-black/5" />
                </div>
              )}
              
              <div className="prose dark:prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-theme-sidebar prose-pre:border prose-pre:border-theme-border prose-pre:rounded-2xl">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    code({ className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || '');
                      const isInline = !match;
                      const codeString = String(children).replace(/\n$/, '');

                      if (!isInline) {
                        return (
                          <div className="relative group/code my-4">
                            <div className="absolute right-3 top-3 z-10 opacity-0 group-hover/code:opacity-100 transition-opacity">
                              <button 
                                onClick={() => copyToClipboard(codeString)}
                                className="p-1.5 bg-theme-card border border-theme-border rounded-md text-theme-text opacity-70 hover:opacity-100"
                              >
                                {copied ? <Check size={14} /> : <Copy size={14} />}
                              </button>
                            </div>
                            <SyntaxHighlighter
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              style={vscDarkPlus as any}
                              language={match[1]}
                              PreTag="div"
                              className="rounded-xl !bg-theme-sidebar !p-4 border border-theme-border shadow-lg"
                              {...props}
                            >
                              {codeString}
                            </SyntaxHighlighter>
                          </div>
                        );
                      }
                      return (
                        <code className="bg-theme-card px-1.5 py-0.5 rounded text-sm font-mono text-gemini-red" {...props}>
                          {children}
                        </code>
                      );
                    },
                    p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
                  }}
                >
                  {message.text}
                </ReactMarkdown>
                
                <AnimatePresence>
                  {isTyping && (
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="inline-block w-2 h-4 bg-theme-text opacity-50 animate-pulse ml-1 align-middle" 
                    />
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Menú de acciones y reacciones */}
            {!isUser && !isTyping && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-1 mt-4 ml-[-8px]"
              >
                <button 
                  onClick={handleLike}
                  className={`p-2 hover:bg-theme-text/10 rounded-full transition-colors ${likeStatus === 'liked' ? 'text-gemini-blue bg-gemini-blue/10' : 'text-theme-text opacity-60 hover:opacity-100'}`} 
                  title="Buenísima respuesta"
                  aria-label="Me gusta"
                >
                  <ThumbsUp size={16} fill={likeStatus === 'liked' ? "currentColor" : "none"} />
                </button>
                <button 
                  onClick={handleDislike}
                  className={`p-2 hover:bg-theme-text/10 rounded-full transition-colors ${likeStatus === 'disliked' ? 'text-gemini-red bg-gemini-red/10' : 'text-theme-text opacity-60 hover:opacity-100'}`} 
                  title="Mala respuesta"
                  aria-label="No me gusta"
                >
                  <ThumbsDown size={16} fill={likeStatus === 'disliked' ? "currentColor" : "none"} />
                </button>
                <button 
                  onClick={() => regenerate()}
                  disabled={loading}
                  className={`p-2 hover:bg-theme-text/10 rounded-full transition-colors text-theme-text opacity-60 hover:opacity-100 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`} 
                  title="Regenerar respuesta"
                  aria-label="Regenerar"
                >
                  <RotateCcw size={16} className={loading ? 'animate-spin' : ''} />
                </button>
                <div className="relative" ref={menuRef}>
                  <button 
                    onClick={() => setShowMore(!showMore)}
                    className={`p-2 hover:bg-theme-text/10 rounded-full transition-colors text-theme-text ${showMore ? 'opacity-100 bg-theme-text/10' : 'opacity-60 hover:opacity-100'}`}
                    title="Más opciones"
                    aria-label="Más opciones"
                    aria-expanded={showMore}
                  >
                    <MoreVertical size={16} />
                  </button>

                  <AnimatePresence>
                    {showMore && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 10, x: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10, x: -10 }}
                        className="absolute bottom-full left-0 mb-2 w-48 bg-theme-sidebar border border-theme-border rounded-xl shadow-2xl z-30 py-1 overflow-hidden"
                        role="menu"
                      >
                        <button 
                          onClick={() => {
                            copyToClipboard(message.text);
                            setShowMore(false);
                          }}
                          role="menuitem"
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-theme-text hover:bg-theme-text/10 transition-colors"
                        >
                          <Copy size={14} className="opacity-70" /> {copied ? '¡Copiado!' : 'Copiar texto'}
                        </button>
                        <button 
                          onClick={() => {
                            handleListen();
                            setShowMore(false);
                          }}
                          role="menuitem"
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-theme-text hover:bg-theme-text/10 transition-colors"
                        >
                          <Volume2 size={14} className="opacity-70" /> Escuchar
                        </button>
                        <button 
                          onClick={() => {
                            handleShare();
                            setShowMore(false);
                          }}
                          role="menuitem"
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-theme-text hover:bg-theme-text/10 transition-colors"
                        >
                          <Share2 size={14} className="opacity-70" /> Compartir
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatBubble;
