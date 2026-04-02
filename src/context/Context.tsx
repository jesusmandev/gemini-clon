/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, type ReactNode, useRef, useMemo, useCallback } from "react";
import { runChat } from "../config/gemini";

export interface Message {
  role: "user" | "model";
  text: string;
  type?: "text" | "image";
  image?: {
    data: string;
    mimeType: string;
  };
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  timestamp: number;
  model: "gemini-2.5-flash" | "gemini-2.5-pro";
}

interface ContextProps {
  chats: Chat[];
  activeChatId: string | null;
  onSent: (prompt: string, imageData?: { data: string, mimeType: string }) => Promise<void>;
  stopGeneration: () => void;
  recentPrompt: string;
  setRecentPrompt: React.Dispatch<React.SetStateAction<string>>;
  showResult: boolean;
  loading: boolean;
  messages: Message[];
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  newChat: () => void;
  loadChat: (id: string) => void;
  deleteChat: (id: string) => void;
  renameChat: (id: string, newTitle: string) => void;
  clearAllChats: () => void;
  setShowResult: React.Dispatch<React.SetStateAction<boolean>>;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  selectedModel: "gemini-2.5-flash" | "gemini-2.5-pro";
  setSelectedModel: (model: "gemini-2.5-flash" | "gemini-2.5-pro") => void;
  regenerate: () => Promise<void>;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  apiKey: string;
  setApiKey: (key: string) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Context = createContext<ContextProps | undefined>(undefined);

const ContextProvider = ({ children }: { children: ReactNode }) => {
  const [input, setInput] = useState("");
  const [recentPrompt, setRecentPrompt] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem("gemini_api_key") || "";
  });
  
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const [chats, setChats] = useState<Chat[]>(() => {
    const saved = localStorage.getItem("gemini_chats");
    return saved ? JSON.parse(saved) : [];
  });
  
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  
  const [theme, setThemeState] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem("gemini_theme") as 'dark' | 'light') || 'dark';
  });

  const [selectedModel, setSelectedModel] = useState<"gemini-2.5-flash" | "gemini-2.5-pro">("gemini-2.5-flash");

  useEffect(() => {
    localStorage.setItem("gemini_chats", JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem("gemini_theme", theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("gemini_api_key", apiKey);
  }, [apiKey]);

  const newChat = useCallback(() => {
    setLoading(false);
    setShowResult(false);
    setActiveChatId(null);
    setInput("");
  }, []);

  const loadChat = useCallback((id: string) => {
    setActiveChatId(id);
    setShowResult(true);
  }, []);

  const deleteChat = useCallback((id: string) => {
    setChats(prev => prev.filter(chat => chat.id !== id));
    if (activeChatId === id) newChat();
  }, [activeChatId, newChat]);

  const renameChat = useCallback((id: string, newTitle: string) => {
    setChats(prev => prev.map(chat => chat.id === id ? { ...chat, title: newTitle } : chat));
  }, []);

  const clearAllChats = useCallback(() => {
    setChats([]);
    newChat();
  }, [newChat]);

  const onSent = useCallback(async (prompt: string, imageData?: { data: string, mimeType: string }) => {
    const currentPrompt = prompt || input;
    if (!currentPrompt || loading) return;

    setLoading(true);
    setShowResult(true);
    setInput("");
    setRecentPrompt(currentPrompt);

    const userMsg: Message = { role: "user", text: currentPrompt, image: imageData };
    let currentId = activeChatId;

    if (!currentId) {
      currentId = Date.now().toString();
      const newChatObj: Chat = {
        id: currentId,
        title: currentPrompt.slice(0, 30) + (currentPrompt.length > 30 ? "..." : ""),
        messages: [userMsg],
        timestamp: Date.now(),
        model: selectedModel
      };
      setChats(prev => [newChatObj, ...prev]);
      setActiveChatId(currentId);
    } else {
      setChats(prev => prev.map(chat => 
        chat.id === currentId 
          ? { ...chat, messages: [...chat.messages, userMsg], timestamp: Date.now() } 
          : chat
      ));
    }

    setChats(prev => prev.map(chat => 
      chat.id === currentId 
        ? { ...chat, messages: [...chat.messages, { role: "model", text: "" }] } 
        : chat
    ));

    if (abortControllerRef.current) abortControllerRef.current.abort();
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const effectiveApiKey = apiKey || import.meta.env.VITE_GROQ_API_KEY;

    try {
      const activeChat = chats.find(c => c.id === currentId);
      const chatHistory = activeChat ? activeChat.messages : [];
      
      await runChat(currentPrompt, chatHistory, imageData, abortController.signal, effectiveApiKey, (tokenText: string) => {
        setChats(prev => prev.map(chat => {
          if (chat.id === currentId) {
            const updatedMessages = [...chat.messages];
            const lastMessage = updatedMessages[updatedMessages.length - 1];
            if (lastMessage.role === 'model') {
              lastMessage.text = tokenText;
            }
            return { ...chat, messages: updatedMessages };
          }
          return chat;
        }));
      });
    } catch (err: unknown) {
      if ((err as Error).name === 'AbortError') return;
      console.error(err);
      
      let friendlyMsg = "Error inesperado. Inténtalo de nuevo.";
      const errorText = (err as Error).message || "";
      
      if (errorText.includes("401") || errorText.includes("invalid_api_key")) {
        friendlyMsg = "API Key inválida. Por favor, verifícala en Configuración.";
      } else if (errorText.includes("429")) {
        friendlyMsg = "Límite de peticiones alcanzado. Espera un momento antes de continuar.";
      } else if (errorText.includes("503") || errorText.includes("overloaded")) {
        friendlyMsg = "El servidor está sobrecargado. Inténtalo en unos segundos.";
      } else {
        friendlyMsg = "Error: " + errorText;
      }

      const errorMsg: Message = { role: "model", text: friendlyMsg };
      setChats(prev => prev.map(chat => 
        chat.id === currentId 
          ? { ...chat, messages: [...chat.messages, errorMsg] } 
          : chat
      ));
    } finally {
      setLoading(false);
    }
  }, [apiKey, input, loading, activeChatId, selectedModel, chats]);

  const regenerate = useCallback(async () => {
    if (!activeChatId || loading) return;
    const activeChat = chats.find(c => c.id === activeChatId);
    if (!activeChat) return;

    const userMessages = activeChat.messages.filter(m => m.role === 'user');
    if (userMessages.length === 0) return;
    const lastPrompt = userMessages[userMessages.length - 1].text;

    setChats(prev => prev.map(chat => {
      if (chat.id === activeChatId && chat.messages[chat.messages.length - 1].role === 'model') {
        return { ...chat, messages: chat.messages.slice(0, -1) };
      }
      return chat;
    }));

    setLoading(true);
    setChats(prev => prev.map(chat => 
      chat.id === activeChatId 
        ? { ...chat, messages: [...chat.messages, { role: "model", text: "" }] } 
        : chat
    ));

    if (abortControllerRef.current) abortControllerRef.current.abort();
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const effectiveApiKey = apiKey || import.meta.env.VITE_GROQ_API_KEY;

    try {
      const lastUserIndex = activeChat.messages.map(m => m.role).lastIndexOf('user');
      const historyBeforeRetry = lastUserIndex >= 0 ? activeChat.messages.slice(0, lastUserIndex) : [];
      
      await runChat(lastPrompt, historyBeforeRetry, undefined, abortController.signal, effectiveApiKey, (tokenText) => {
        setChats(prev => prev.map(chat => {
          if (chat.id === activeChatId) {
            const updatedMessages = [...chat.messages];
            const lastMessage = updatedMessages[updatedMessages.length - 1];
            if (lastMessage.role === 'model') lastMessage.text = tokenText;
            return { ...chat, messages: updatedMessages };
          }
          return chat;
        }));
      });
    } catch (err: unknown) {
      if ((err as Error).name === 'AbortError') return;
      console.error(err);
      alert("Error: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [activeChatId, apiKey, chats, loading]);

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setLoading(false);
  }, []);

  // Usamos useMemo para el valor del contexto. Esto es CRUCIAL para el rendimiento.
  // Sin esto, cada vez que cambia CUALQUIER estado (como el input al escribir), 
  // TODO el árbol de componentes se volvería a renderizar innecesariamente.
  const contextValue = useMemo(() => {
    const activeChat = chats.find(c => c.id === activeChatId);
    const messages = activeChat ? activeChat.messages : [];

    return {
      chats,
      activeChatId,
      onSent,
      stopGeneration,
      setRecentPrompt,
      recentPrompt,
      showResult,
      loading,
      messages,
      input,
      setInput,
      newChat,
      loadChat,
      deleteChat,
      renameChat,
      clearAllChats,
      setShowResult,
      theme,
      setTheme: setThemeState,
      selectedModel,
      setSelectedModel,
      regenerate,
      isSettingsOpen,
      setIsSettingsOpen,
      isMobileMenuOpen,
      setIsMobileMenuOpen,
      apiKey,
      setApiKey
    };
  }, [
    chats, activeChatId, onSent, stopGeneration, 
    recentPrompt, showResult, loading, 
    input, newChat, loadChat, deleteChat, 
    renameChat, clearAllChats, theme, 
    selectedModel, regenerate, isSettingsOpen, 
    isMobileMenuOpen, apiKey
  ]);

  return (
    <Context.Provider value={contextValue}>{children}</Context.Provider>
  );
};

export default ContextProvider;
