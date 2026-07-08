# Nuestro Tiempo App

Aplicación móvil construida con **Expo (React Native) + TypeScript + Expo Router** para **Nuestro Tiempo**, una app pensada para parejas donde vincularse, crear álbumes compartidos y subir fotos juntos. Consume la API [`nuestro-tiempo-api`](../nuestro-tiempo-api).

## ✨ Estado actual

- Navegación por archivos con **Expo Router** (`app/`), con grupos `(auth)` (login, registro) y `(tabs)` (inicio, álbumes, cuenta).
- Componentes UI propios en `features/common` (Button, Card, Input, Title, CounterCards, ImageCarousel).
- Formularios de auth en `features/auth` (`LoginForm`, `RegisterForm`) — de momento sin conexión real a la API (la navegación se simula).
- Tipografías propias vía `@expo-google-fonts/inter` y `@expo-google-fonts/playwrite-au-qld`.
- Alias de imports `@/*` apuntando a la raíz del proyecto (`tsconfig.json`).

## 🧱 Stack técnico

- **Expo SDK 54** (`expo` ~54.0.33) + **React Native 0.81** + **React 19**
- **Expo Router 6** (file-based routing, `typedRoutes` activado)
- **TypeScript 5.9** en modo `strict`
- **React Compiler** activado (`experiments.reactCompiler`)
- **EAS Build** para compilaciones en la nube (perfiles `development`, `preview`, `production`)
- `expo-dev-client` incluido como dependencia, pensado para builds de desarrollo con módulos nativos propios

## 📋 Requisitos previos

- **Node.js** >= 20.x
- **npm** (el proyecto usa `package-lock.json`)
- **Expo Go** instalada en el móvil ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)) — solo necesaria para el flujo "Expo Go"
- **EAS CLI** para builds en la nube o generar development builds: `npm install -g eas-cli`
- Para builds nativos locales (`expo run:android` / `expo run:ios`):
  - **Android Studio** + SDK de Android (y un emulador o dispositivo con depuración USB)
  - **Xcode** (solo macOS) para iOS
- Cuenta de [Expo](https://expo.dev) vinculada al proyecto (`owner: esteban894`, `projectId` en `app.json`) si vas a usar EAS Build/Submit

## 🧩 Variables de entorno

El proyecto todavía no tiene wiring real hacia la API, pero la convención recomendada de Expo es usar variables con el prefijo `EXPO_PUBLIC_` (se embeben en el bundle en tiempo de compilación y son accesibles vía `process.env`).

Crea un `.env` en la raíz cuando se integre la conexión a la API:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api/v1
```

> ⚠️ Nunca pongas secretos reales aquí: todo lo que empieza por `EXPO_PUBLIC_` queda embebido en el binario/bundle y es visible para cualquiera que lo inspeccione.

**Notas para probar contra la API local (`nuestro-tiempo-api`) desde un dispositivo real:**

- `localhost` solo funciona desde el emulador iOS o Metro. Para emulador Android usa `10.0.2.2` en vez de `localhost`.
- Para un dispositivo físico en la misma red, usa la IP local de tu máquina (ej. `http://192.168.1.50:3000/api/v1`) y asegúrate de que el firewall permite conexiones entrantes al puerto `3000`.
- Alternativa con Android + cable USB: `adb reverse tcp:3000 tcp:3000` y usa `http://localhost:3000/api/v1`.

## 🚀 Puesta en marcha

```bash
# 1. Clonar e instalar dependencias
git clone <repository-url>
cd nuestro-tiempo-app
npm install

# 2. (Opcional) configurar variables de entorno
cp .env.example .env   # cuando exista

# 3. Arrancar el servidor de desarrollo (Metro)
npx expo start
```

Esto abre el **Dev Tools** en la terminal con un código QR y opciones para elegir dónde abrir la app.

## 📱 Modos de desarrollo local

### A) Expo Go (el más rápido, sin compilar nada nativo)

Ideal para iterar rápido en pantallas/UI que no dependen de módulos nativos custom.

```bash
npx expo start
```

- Escanea el QR con la app **Expo Go** (Android) o con la cámara (iOS).
- Pulsa `a` para abrir en un emulador Android o `i` para un simulador iOS (si están instalados y configurados).
- Pulsa `w` para abrir la versión web (`react-native-web`).

Limitación: Expo Go solo soporta el runtime y los módulos incluidos en el SDK de Expo. Si en el futuro se añade un módulo nativo no soportado por Expo Go, hay que pasar a un **development build**.

### B) Development build (con `expo-dev-client`)

El proyecto ya incluye `expo-dev-client`, pensado para cuando se necesiten módulos nativos que Expo Go no soporta. Genera un binario propio que sustituye a Expo Go en tu dispositivo/emulador.

```bash
# Generar el development build (una vez, o cada vez que cambien módulos nativos)
eas build --profile development --platform android   # o ios

# Instala el .apk/.ipa generado en tu dispositivo/emulador y luego:
npx expo start --dev-client
```

### C) Build nativo 100% local (sin EAS, requiere Android Studio/Xcode)

Genera las carpetas nativas `android/` e `ios/` (vía prebuild) y compila localmente:

```bash
npx expo run:android
# o
npx expo run:ios
```

> Estas carpetas están en `.gitignore` porque el proyecto usa el flujo **Continuous Native Generation (CNG)**: se regeneran a partir de `app.json`/config plugins con `npx expo prebuild` en vez de mantenerse versionadas.

### D) Web

```bash
npx expo start --web
```

## 🏗️ Builds con EAS (preview y producción)

El archivo `eas.json` define tres perfiles:

| Perfil        | Distribución | Uso                                                                    |
| ------------- | ------------ | ---------------------------------------------------------------------- |
| `development` | `internal`   | Development client (`expo-dev-client`) para probar con módulos nativos |
| `preview`     | `internal`   | Build interna para testers (QA, TestFlight interno / APK directo)      |
| `production`  | tienda       | Build final para Play Store / App Store (`autoIncrement` activado)     |

```bash
# Autenticarse en Expo (una vez)
eas login

# Build de preview (Android e iOS)
eas build --profile preview --platform android
eas build --profile preview --platform ios

# Build de producción
eas build --profile production --platform all

# Enviar a las tiendas (usa el perfil "submit" -> "production")
eas submit --platform android
eas submit --platform ios
```

Notas:

- Los builds de `preview` y `production` no llevan `expo-dev-client`; son binarios "standalone" listos para instalar o subir a tienda.
- `appVersionSource: "remote"` (en `eas.json`) hace que EAS gestione el número de build remotamente; no hace falta tocarlo a mano en cada release.
- Para builds locales sin depender de la nube de EAS, se puede añadir `--local` a cualquier comando `eas build` (requiere el entorno nativo instalado, igual que en la opción C).

## 🛠️ Scripts disponibles

| Comando           | Descripción                                               |
| ----------------- | --------------------------------------------------------- |
| `npm run start`   | Arranca Metro / Expo Dev Tools                            |
| `npm run android` | Compila y ejecuta en Android (build nativo local)         |
| `npm run ios`     | Compila y ejecuta en iOS (build nativo local, solo macOS) |
| `npm run web`     | Arranca la versión web                                    |
| `npm run lint`    | Ejecuta ESLint (`eslint-config-expo`)                     |

## 📁 Estructura del proyecto

```
app/                      # Rutas (Expo Router, file-based routing)
├── _layout.tsx           # Layout raíz: fuentes, splash screen, Stack navigator
├── (auth)/               # Grupo de rutas de autenticación
│   ├── _layout.tsx
│   ├── login.tsx
│   └── register.tsx
└── (tabs)/               # Grupo de rutas con tabs (zona autenticada)
    ├── _layout.tsx
    ├── index.tsx         # Inicio
    ├── albums.tsx        # Álbumes
    └── account.tsx       # Cuenta

features/                 # Código de dominio, organizado por feature
├── auth/
│   ├── components/       # LoginForm, RegisterForm
│   └── index.ts
└── common/
    ├── components/ui/    # Button, Card, Input, Title, CounterCards, ImageCarousel
    └── index.ts

constants/
└── colors.ts              # Paleta de colores compartida

assets/                    # Fuentes e imágenes (icon, splash, favicon, etc.)
```

Convenciones:

- Import alias `@/*` → raíz del proyecto (p. ej. `@/constants/colors`, `@/features/common`).
- Cada carpeta de `features/*` expone su API pública vía un `index.ts` (barrel export).

## 🐛 Troubleshooting

**El QR no conecta desde el móvil**

- Asegúrate de que el móvil y el ordenador están en la misma red Wi-Fi.
- Si sigue sin funcionar, usa modo túnel: `npx expo start --tunnel`.

**Cambié un módulo nativo y Expo Go no lo soporta**

- Necesitas un development build (ver opción B más arriba) en vez de Expo Go.

**No conecta con `nuestro-tiempo-api` en local**

- Revisa la sección de [variables de entorno](#-variables-de-entorno): `localhost` no funciona igual en emulador Android, iOS y dispositivo físico.
- Confirma que la API está arrancada (`pnpm run start:dev` en `nuestro-tiempo-api`) y escuchando en el puerto esperado.

**Error de caché de Metro / algo raro tras cambiar dependencias**

```bash
npx expo start --clear
```

## 👨‍💻 Autor

- **esteban894**

## 📄 Licencia

UNLICENSED — Proyecto privado.
