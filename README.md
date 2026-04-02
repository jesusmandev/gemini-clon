# Gemini Clone (Groq Edition) 🚀

Un clon premium de la interfaz de Gemini, potenciado por los modelos más rápidos del mundo a través de la API de **Groq Cloud**. Esta aplicación ofrece una experiencia fluida, multimodal y totalmente responsiva.

## ✨ Características Principales

- **Inteligencia Multimodal**: Soporte nativo para lectura de imágenes utilizando el modelo **Llama 4 Scout**.
- **Streaming en Tiempo Real**: Las respuestas aparecen palabra por palabra instantáneamente, sin tiempos de espera artificiales.
- **Microfóno Inteligente**: Sistema de dictado por voz integrado con auto-parada tras 10 segundos de silencio y comandos de voz (ej: "Enviar").
- **Interfaz Premium**:
  - Modos Claro y Oscuro con transiciones suaves.
  - Barras de desplazamiento (Scrollbars) minimalistas de 6px.
  - Menú de acciones en mensajes: Copiar al portapapeles, Lectura en voz alta (TTS) y Compartir.
- **Privacidad Primero**: Historial de chats persistente guardado localmente en el navegador.

## 🛠️ Stack Tecnológico

- **Frontend**: React 19 + TypeScript + Vite 6
- **Estilos**: Tailwind CSS 4 + Framer Motion (Animaciones)
- **IA**: Groq SDK (`meta-llama/llama-4-scout-17b-16e-instruct` para visión y `llama-3.1-8b-instant` para texto).

## 🚀 Instalación y Uso

1. **Clona el repositorio**:

   ```bash
   git clone https://github.com/jesusmandev/gemini-clon.git
   cd gemini-clon
   ```

2. **Instala las dependencias**:

   ```bash
   npm install
   ```

3. **Configura el entorno**:
   Crea un archivo `.env` basado en el archivo `.env.example` y añade tu API Key de Groq:

   ```env
   VITE_GROQ_API_KEY=tu_gsk_key_aca
   ```

4. **Inicia el servidor de desarrollo**:
   ```bash
   npm run dev
   ```

## ⚖️ Aviso Legal y Educativo

**Esta aplicación es un proyecto desarrollado exclusivamente con fines educativos.** No es una aplicación oficial de Google y no tiene relación comercial con los servicios originales de Gemini.

- **Privacidad de Datos**: Esta aplicación no almacena datos personales en servidores externos. Todas las conversaciones y configuraciones se guardan exclusivamente en el `LocalStorage` del navegador del usuario.
- **Procesamiento de IA**: El procesamiento de las consultas se realiza a través de las APIs oficiales de Groq Cloud, y el uso de las mismas está sujeto a sus propias políticas de privacidad.
- **Precisión**: Al igual que cualquier modelo de lenguaje, las respuestas pueden contener imprecisiones. Verifica siempre la información importante.

---

Desarrollado con ❤️ para la comunidad de aprendizaje de React.
