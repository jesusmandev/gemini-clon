import { useContext, useState } from "react";
import { Context } from "../../context/Context";
import { 
  Menu, 
  Plus, 
  MessageSquare, 
  Settings, 
  HelpCircle,
  Search,
  MoreVertical,
  Trash2,
  Edit2,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import HelpModal from "./HelpModal";

const Sidebar = () => {
  const [extended, setExtended] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [showMenuId, setShowMenuId] = useState<string | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const { 
    chats, 
    activeChatId, 
    newChat, 
    loadChat, 
    deleteChat, 
    renameChat, 
    setIsSettingsOpen,
    isMobileMenuOpen,
    setIsMobileMenuOpen
  } = useContext(Context)!;

  const filteredChats = chats.filter(chat => 
    chat.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRename = (id: string) => {
    if (editTitle.trim()) {
      renameChat(id, editTitle);
      setEditingId(null);
    }
  };

  const renderSidebarContent = () => (
    <div className={`h-full flex flex-col bg-[var(--sidebar)] transition-all duration-300 ease-in-out relative ${extended ? 'w-64' : 'w-16'}`}>
      
      {/* Top Part */}
      <div className="flex flex-col p-4 gap-4 shrink-0">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setExtended(!extended)} 
            className="p-3 w-fit hover:bg-theme-text/10 rounded-full transition-colors"
            style={{ color: 'var(--text)' }}
            title="Menu"
          >
            <Menu size={20} />
          </button>

          {/* Close for Mobile */}
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 hover:bg-theme-text/10 rounded-full md:hidden text-theme-text opacity-70"
          >
            <X size={20} />
          </button>
        </div>

        {/* New Chat Button */}
        <button 
          onClick={() => {
            newChat();
            setIsMobileMenuOpen(false);
          }} 
          className={`mt-4 flex items-center bg-theme-card hover:bg-theme-text/10 transition-all rounded-full p-3 group overflow-hidden border border-theme-border shadow-sm ${extended ? 'w-fit pr-6' : 'w-[44px]'}`}
          style={{ color: 'var(--text)' }}
        >
          <Plus size={20} className="shrink-0" />
          {extended && (
            <span className="ml-3 text-sm font-medium whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">
              Nuevo chat
            </span>
          )}
        </button>

      </div>

      {/* Middle Part (Scrollable History) */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden minimal-scrollbar px-4 min-h-0">
        {extended && (
          <div className="flex flex-col gap-2 mt-4 animate-in fade-in duration-500 pb-4">
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-sm font-medium text-theme-text opacity-90">Chats</span>
              <button 
                onClick={() => setShowSearch(!showSearch)}
                className={`p-1 hover:bg-theme-text/10 rounded-md transition-colors ${showSearch ? 'text-gemini-blue' : 'text-theme-text opacity-50'}`}
              >
                <Search size={14} />
              </button>
            </div>

            {showSearch && (
              <input 
                type="text"
                placeholder="Buscar historial..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mx-3 mb-4 bg-theme-text/5 border border-theme-border text-xs text-theme-text p-2 rounded-lg focus:outline-none focus:border-gemini-blue animate-in slide-in-from-top-1"
                autoFocus
              />
            )}

            {filteredChats.map((chat) => (
              <div 
                key={chat.id} 
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors group relative ${
                  activeChatId === chat.id ? 'bg-[#2e4a73] text-white shadow-lg' : 'hover:bg-theme-text/10 text-theme-text hover:opacity-100 opacity-70'
                }`}
                onClick={() => {
                  loadChat(chat.id);
                  setIsMobileMenuOpen(false);
                }}
              >
                <MessageSquare size={16} className={`shrink-0 ${activeChatId === chat.id ? 'text-white' : 'text-theme-text opacity-50'}`} />
                
                {editingId === chat.id ? (
                  <input 
                    className="bg-transparent border-b border-white/50 text-[13px] outline-none w-full"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={() => handleRename(chat.id)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRename(chat.id)}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <p className="text-[13px] truncate flex-1 font-medium">
                    {chat.title}
                  </p>
                )}

                {/* More Menu */}
                <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenuId(showMenuId === chat.id ? null : chat.id);
                    }}
                    className="p-1 hover:bg-theme-text/10 rounded-md"
                  >
                    <MoreVertical size={14} />
                  </button>

                  {showMenuId === chat.id && (
                    <div className="absolute right-2 top-8 bg-theme-card border border-theme-border rounded-lg shadow-2xl z-20 min-w-[120px] overflow-hidden py-1 animate-in zoom-in-95 duration-200">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingId(chat.id);
                          setEditTitle(chat.title);
                          setShowMenuId(null);
                        }}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-theme-text/10 flex items-center gap-2 font-normal"
                      >
                        <Edit2 size={12} /> Renombrar
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteChat(chat.id);
                          setShowMenuId(null);
                        }}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-theme-text/10 text-red-500 flex items-center gap-2 font-normal"
                      >
                        <Trash2 size={12} /> Eliminar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {filteredChats.length === 0 && (
              <p className="px-3 text-xs text-theme-text opacity-50 italic">
                {searchTerm ? 'No se encontraron chats' : 'No hay historial todavía'}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Bottom Part */}
      <div className="p-4 flex flex-col gap-1 border-t border-theme-border shrink-0">
        <div 
          onClick={() => {
            setIsHelpOpen(true);
            setIsMobileMenuOpen(false);
          }}
          className={`flex items-center p-3 rounded-full hover:bg-theme-text/10 cursor-pointer transition-colors group ${!extended && 'justify-center'}`}
        >
          <HelpCircle size={20} className="text-theme-text opacity-70" />
          {extended && <span className="ml-4 text-sm font-medium text-theme-text opacity-70 group-hover:opacity-100">Ayuda</span>}
        </div>
        <div 

          onClick={() => {
            setIsSettingsOpen(true);
            setIsMobileMenuOpen(false);
          }}
          className={`flex items-center p-3 rounded-full hover:bg-theme-text/10 cursor-pointer transition-colors group ${!extended && 'justify-center'}`}
        >
          <Settings size={20} className="text-theme-text opacity-70" />
          {extended && <span className="ml-4 text-sm font-medium text-theme-text opacity-70 group-hover:opacity-100">Configuración</span>}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-full shrink-0">
        {renderSidebarContent()}
      </div>

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[60] md:hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute left-0 top-0 bottom-0 w-[280px] shadow-2xl overflow-hidden"
            >
              {renderSidebarContent()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
