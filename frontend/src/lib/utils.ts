import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: string | number, currency = 'CZK'): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num)
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('cs-CZ', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  }).format(d)
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('cs-CZ', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export function getRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return 'právě teď'
  if (minutes < 60) return `před ${minutes} min`
  if (hours < 24) return `před ${hours} hod`
  if (days < 7) return `před ${days} dny`
  
  return formatDate(d)
}

export const statusLabels: Record<string, string> = {
  draft: 'Koncept',
  submitted: 'Čeká na schválení',
  approved: 'Schváleno',
  rejected: 'Zamítnuto',
  ordered: 'Zpracovává se',
  delivered: 'Doručeno',
  cancelled: 'Zrušeno',
}

export const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  submitted: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  ordered: 'bg-blue-100 text-blue-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-gray-100 text-gray-500',
}

export const priorityLabels: Record<string, string> = {
  low: 'Nízká',
  medium: 'Střední',
  high: 'Vysoká',
}

export const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
}
