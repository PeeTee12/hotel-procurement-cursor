import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface UserOrganization {
  id: number
  name: string
  role: string
  primaryColor?: string
  secondaryColor?: string
  branch?: {
    id: number
    name: string
  } | null
}

export interface User {
  id: number
  email: string
  name: string
  avatar?: string | null
  roles: string[]
  organizations: UserOrganization[]
}

interface AuthState {
  user: User | null
  currentOrganization: UserOrganization | null
  setUser: (user: User | null) => void
  setCurrentOrganization: (org: UserOrganization | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      currentOrganization: null,
      setUser: (user) => {
        set({ 
          user,
          currentOrganization: user?.organizations[0] || null 
        })
      },
      setCurrentOrganization: (org) => set({ currentOrganization: org }),
      logout: () => set({ user: null, currentOrganization: null }),
    }),
    {
      name: 'procurex-auth',
    }
  )
)
