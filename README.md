# BETA-Novelador

Aplicación web progresiva (PWA) para escribir novelas en ordenador y móvil. Stack: React + Vite + TypeScript + Tiptap + IndexedDB + Supabase.

## Requisitos
- Node.js 20 o superior
- npm

## Arranque local
```bash
npm ci
npm run dev
```
Abre la URL que indique Vite. Sin variables de Supabase, el guardado funciona localmente en ese navegador. Para sincronizar, configura `.env.local` con los valores de `.env.example`.

## Funcionalidades
- Editor de texto enriquecido con negrita, cursiva, encabezados y listas.
- Ajustes de tipografía, tamaño e interlineado de lectura.
- Varios proyectos independientes con autoguardado local en IndexedDB; se pueden renombrar y eliminar. La novela existente se migra a **Fiambre**.
- Gestión de capítulos, estados, resúmenes y navegación; permite eliminar capítulos y fijar hasta tres fotos de referencia por capítulo.
- Fichas de personajes con arquetipo y avatares geométricos de diez colores.
- Lienzo de Mapeo con notas pastel arrastrables, pegatinas, conexiones y zoom.
- Exportación del manuscrito como DOCX, TXT o PDF, además de copias JSON; compartir el texto desde dispositivos compatibles.
- Tirada aleatoria de los dos dados narrativos, respetando el orden original de encuentros y arquetipos.
- Exportación y restauración de copias JSON.
- Nueve temas visuales, incluido Pistacho y Melocotón, con selector accesible en móvil.
- Diseño adaptable a ordenador y móvil e instalación PWA.

## MUY IMPORTANTE: estado de las copias
Todos los cambios se guardan automáticamente en IndexedDB. Si Supabase está configurado, también se sincronizan los proyectos de la cuenta y puedes abrirlos en otro dispositivo iniciando sesión con el mismo correo. La sincronización requiere conexión; si falla, los cambios permanecen guardados localmente y puedes usar **Reintentar sincronización**. Descarga copias JSON periódicas como respaldo.

## Configurar Supabase para sincronizar entre dispositivos
1. Crea un proyecto en Supabase y ejecuta `supabase/schema.sql` en el SQL Editor.
   Si ya habías creado la tabla y aparece `permission denied for table novels`, ejecuta allí `GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.novels TO authenticated;`. Las políticas RLS siguen limitando cada operación a los proyectos del usuario autenticado.
2. Activa el acceso por correo (enlace de acceso/OTP) en **Authentication → Providers → Email**.
3. En **Authentication → URL Configuration**, configura la URL de GitHub Pages como *Site URL* y añádela a *Redirect URLs*. El formato de un repositorio normal es `https://USUARIO.github.io/REPOSITORIO/`.
4. Copia la URL del proyecto y la clave pública `anon`/publishable. Nunca uses ni publiques la clave `service_role`.
5. Para desarrollo local, guarda ambos valores en `.env.local`:
   ```dotenv
   VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
   VITE_SUPABASE_ANON_KEY=TU_CLAVE_PUBLICA
   ```
6. La app envía un enlace de acceso al correo. Inicia sesión con ese mismo correo en cada dispositivo; cada proyecto y sus datos quedan protegidos por las políticas RLS del esquema.

La clave `anon`/publishable se incluye en el JavaScript del sitio, como es habitual en una app cliente. La seguridad depende de la autenticación y de RLS; nunca configures una clave `service_role` en `VITE_*`.

## Publicar en GitHub Pages
El workflow `.github/workflows/deploy.yml` compila y publica el sitio al hacer push a `main`. En **Settings → Pages**, elige **GitHub Actions** como fuente.

Para activar la sincronización en la versión publicada, añade estos *Repository secrets* en **Settings → Secrets and variables → Actions**:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

La ruta base se detecta automáticamente a partir del nombre del repositorio. Si el repositorio usa otra rama principal, actualiza la rama configurada en el workflow. Sin los secretos, el sitio se publica en modo local por dispositivo.

## Privacidad y sincronización
Los proyectos se guardan en filas independientes asociadas al usuario autenticado; RLS impide leer o modificar proyectos de otras cuentas. Al iniciar sesión, las versiones locales y remotas se comparan por fecha de actualización. La sincronización no combina ediciones simultáneas del mismo proyecto; conserva la versión más reciente al sincronizar.


## Novedades de la versión 0.2.0

- Se unifica el índice de capítulos dentro de **Estructura**.
- Nuevo panel de **Estadísticas**: tiempo con la app visible, palabras, páginas estimadas y objetivo editable. La estimación usa las cinco equivalencias de extensión incluidas en la app.
- Siete temas visuales: Claro, Oscuro, Arena, Bosque, Marino, Hoguera y Obsidiana.
- Nuevo espacio de **Investigación** para notas, imágenes locales y enlaces con tarjeta de previsualización, etiquetas de estado y guardado local.
- Generador de writing prompts con 1.440 variaciones basadas en permutaciones de los seis colores/personajes.

El tiempo de uso se contabiliza mientras la pestaña de Novelador está visible. Los adjuntos de investigación y el resto del proyecto se guardan en el almacenamiento local del navegador; exporta copias JSON periódicamente. Los enlaces se muestran como tarjetas con dominio y URL (no se descargan automáticamente metadatos de terceros).

## Cambios de BETA-Novelador
- Proyectos independientes con migración de la novela anterior a **Fiambre**.
- Lienzo de Mapeo persistente con notas pastel arrastrables, hasta tres pegatinas por nota y conexiones con flechas.
- Exportación del manuscrito a Word, TXT o PDF y opción de compartirlo desde dispositivos compatibles.
- Acceso por enlace de correo y sincronización privada de proyectos mediante Supabase.
- Despliegue automatizado en GitHub Pages con soporte para la ruta del repositorio.
- Identidad visual actualizada a **BETA-Novelador**.
