import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'PaisaTrack - Personal Expense Manager',
    short_name: 'PaisaTrack',
    description: 'Track your daily expenses, manage your balance, set budgets, and stay on top of recurring payments — all in one place.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0C0C0C',
    theme_color: '#0C0C0C',
    categories: ['finance', 'productivity'],
    lang: 'en',
    dir: 'ltr',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        // Maskable icon: used on Android adaptive icon slots
        // Same image but declared as maskable so Android applies its own shape
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    screenshots: [
      {
        src: '/screenshot-wide.png',
        sizes: '1280x720',
        type: 'image/png',
        // @ts-ignore – form_factor is valid but not yet in all TS types
        form_factor: 'wide',
        label: 'PaisaTrack Dashboard — desktop view',
      },
      {
        src: '/screenshot-narrow.png',
        sizes: '750x1334',
        type: 'image/png',
        // @ts-ignore
        form_factor: 'narrow',
        label: 'PaisaTrack Dashboard — mobile view',
      },
    ],
    shortcuts: [
      {
        name: 'Add Expense',
        short_name: 'Add',
        description: 'Quickly log a new expense',
        url: '/expenses',
        icons: [{ src: '/icon-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'View Balance',
        short_name: 'Balance',
        description: 'Check your current balance',
        url: '/balance',
        icons: [{ src: '/icon-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'Recurring Payments',
        short_name: 'Recurring',
        description: 'Manage recurring payments',
        url: '/recurring',
        icons: [{ src: '/icon-192x192.png', sizes: '192x192' }],
      },
    ],
  }
}
