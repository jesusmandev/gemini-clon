import { useState, useEffect, useRef, useCallback } from 'react';

interface UseSpeechToTextProps {
  onResult: (text: string) => void;
  onCommandEnviar?: () => void;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SpeechRecognition?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    webkitSpeechRecognition?: any;
  }
}

export const useSpeechToText = ({ onResult, onCommandEnviar }: UseSpeechToTextProps) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Store callbacks in refs so they never cause the effect to re-run
  const onResultRef = useRef(onResult);
  const onCommandEnviarRef = useRef(onCommandEnviar);
  useEffect(() => { onResultRef.current = onResult; }, [onResult]);
  useEffect(() => { onCommandEnviarRef.current = onCommandEnviar; }, [onCommandEnviar]);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    setIsListening(false);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    try { recognitionRef.current?.stop(); } catch { /* ignore */ }
  }, []);

  const resetSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(() => {
      console.log("Se detuvo por 10 segundos de silencio");
      stopListening();
    }, 10000); // 10 segundos exactos como pidió el usuario
  }, [stopListening]);
  // Initialize recognition ONCE
  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      const t = setTimeout(() => setError("Tu navegador no soporta reconocimiento de voz."), 0);
      return () => clearTimeout(t);
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = 'es-ES';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log("Speech Recognition: Iniciado");
      setError(null);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      console.log("Speech Recognition: Resultado recibido", event.results);
      resetSilenceTimer(); 
      
      let fullTranscript = '';
      for (let i = 0; i < event.results.length; ++i) {
        fullTranscript += event.results[i][0].transcript;
      }

      if (fullTranscript.trim()) {
        onResultRef.current(fullTranscript);
        
        const lastPart = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
        if (lastPart === 'enviar') {
          onCommandEnviarRef.current?.();
          stopListening();
        }
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      console.error("Speech Recognition Error:", event.error, event);
      if (event.error === 'not-allowed') {
        setError("Microfono bloqueado. Por favor, permite el acceso en tu navegador.");
      } else if (event.error === 'no-speech') {
        // Ignoramos el error de 'no-speech' para que no cierre el micro bruscamente
        return;
      } else if (event.error !== 'aborted') {
        setError(`Error del micro: ${event.error}`);
      }
      isListeningRef.current = false;
      setIsListening(false);
    };

    recognition.onend = () => {
      console.log("Speech Recognition: Finalizado");
      if (isListeningRef.current) {
        // Si se detuvo solo pero deberia seguir escuchando, lo reiniciamos
        try { recognition.start(); } catch { /* ignore */ }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      try { recognition.stop(); } catch { /* ignore */ }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only runs once on mount

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListeningRef.current) return;
    setError(null);
    try {
      recognitionRef.current.start();
      isListeningRef.current = true;
      setIsListening(true);
      resetSilenceTimer(); // Iniciamos el contador al activar el micro
    } catch (err: unknown) {
      const e = err as Error;
      console.error("Speech recognition could not start:", e);
      setError("No se pudo iniciar el micrófono. Asegúrate de que no esté siendo usado por otra aplicación.");
      setIsListening(false);
      isListeningRef.current = false;
    }
  }, [resetSilenceTimer]);

  const toggleListening = useCallback(() => {
    if (isListeningRef.current) {
      stopListening();
    } else {
      startListening();
    }   
  }, [startListening, stopListening]);

  return { isListening, toggleListening, error };
};
