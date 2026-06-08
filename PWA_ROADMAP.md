# PaisaTrack PWA Implementation Roadmap

Transforming PaisaTrack into a Progressive Web App (PWA) will allow you to install it directly to your phone's home screen (like your GT 7), removing the browser UI and making it feel like a native application.

Here is the complete roadmap to achieve this in your Next.js 16 (App Router) project:

## Phase 1: Asset Preparation (Icons)

Your device needs app icons of specific sizes to display on the home screen and splash screens.

1. **Create the following images** (you can use your existing favicon to generate these):
   - `public/icon-192x192.png`
   - `public/icon-512x512.png`
   - `public/apple-icon.png` (typically 180x180, for iOS)

> [!TIP]
> You can use a free tool like [Favicon Generator](https://realfavicongenerator.net/) or [PWA Image Generator](https://www.pwabuilder.com/imageGenerator) to automatically generate all required sizes.

## Phase 2: Creating the Manifest

Next.js App Router has native support for generating the `manifest.json`. You can create an `app/manifest.ts` file instead of a static JSON file.

1. **Create `app/manifest.ts`**:
```typescript
import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'PaisaTrack',
    short_name: 'PaisaTrack',
    description: 'Your personal expense manager',
    start_url: '/',
    display: 'standalone',
    background_color: '#0C0C0C',
    theme_color: '#0C0C0C',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
```

## Phase 3: Updating Metadata for PWA (Layout)

You need to tell the browser (especially Safari on iOS) that your app is PWA-capable by adding specific metadata.

1. **Update `app/layout.tsx`** to include `appleWebApp` and `themeColor` in your `viewport` and `metadata` exports:

```typescript
import type { Metadata, Viewport } from 'next'

export const viewport: Viewport = {
  themeColor: '#0C0C0C',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevents zooming on inputs on mobile
}

export const metadata: Metadata = {
  title: 'PaisaTrack',
  description: 'Your personal expense manager',
  manifest: '/manifest.json', // Next.js will auto-resolve this to your manifest.ts
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'PaisaTrack',
  },
  icons: {
    apple: '/apple-icon.png',
  },
}
```

## Phase 4: Service Worker & Offline Support (Optional but Recommended)

If you want the app to load instantly from cache and work offline, you need a Service Worker. For Next.js, the modern and actively maintained library is `@serwist/next`.

1. **Install Serwist**:
```bash
npm install @serwist/next @serwist/workbox-core
```

2. **Configure `next.config.ts`**:
```typescript
import withSerwistInit from "@serwist/next"

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
})

export default withSerwist({
  // Your existing next config here
})
```

3. **Create the Service Worker (`app/sw.ts`)**:
```typescript
import { defaultCache } from "@serwist/next/worker"
import type { PrecacheEntry, SerwistGlobalConfig } from "@serwist/precaching"
import { Serwist } from "@serwist/sw"

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
  }
}

declare const self: ServiceWorkerGlobalScope

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
})

serwist.addEventListeners()
```

## How to Install (Once Implemented)

- **Android / Chrome**: A prompt "Add PaisaTrack to Home Screen" should automatically appear. You can also click the three dots menu > "Install app" or "Add to Home screen".
- **iOS / Safari**: Tap the Share button at the bottom of Safari, then tap "Add to Home Screen".
