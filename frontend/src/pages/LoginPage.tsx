import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

// Demo users for quick login
const demoUsers = [
  {
    id: 1,
    name: 'Lukáš Malík',
    email: 'admin@orea.cz',
    role: 'Administrátor',
    roleKey: 'admin',
  },
  {
    id: 2,
    name: 'Jan Novák',
    email: 'jan.novak@orea.cz',
    role: 'Nákupčí',
    roleKey: 'purchase_manager',
  },
  {
    id: 3,
    name: 'Marie Svobodová',
    email: 'marie.svobodova@orea.cz',
    role: 'Manažer pobočky',
    roleKey: 'branch_manager',
  },
]

export default function LoginPage() {
  const navigate = useNavigate()
  const { user, setUser } = useAuthStore()
  const [loading, setLoading] = useState<number | null>(null)

  useEffect(() => {
    if (user) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  const handleQuickLogin = async (demoUser: typeof demoUsers[0]) => {
    setLoading(demoUser.id)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Set user directly (in real app, this would come from API)
    setUser({
      id: demoUser.id,
      email: demoUser.email,
      name: demoUser.name,
      avatar: null,
      roles: demoUser.roleKey === 'admin' ? ['ROLE_ADMIN', 'ROLE_USER'] : ['ROLE_USER'],
      organizations: [
        {
          id: 1,
          name: 'OREA Hotels',
          role: demoUser.roleKey,
          primaryColor: '#2D4739',
          secondaryColor: '#C9A227',
          branch: demoUser.roleKey !== 'admin' ? {
            id: demoUser.id,
            name: demoUser.id === 2 ? 'OREA Hotel Pyramida' : 'OREA Hotel Voroněž',
          } : null,
        },
      ],
    })

    setLoading(null)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2D4739] via-[#3a5a49] to-[#2D4739] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center text-white font-bold text-xl border border-white/20">
              P
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-white">ProcureX</h1>
              <p className="text-sm text-white/70">Hotel Procurement Hub</p>
            </div>
          </div>
        </div>

        <Card className="border-0 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl">Přihlášení</CardTitle>
            <CardDescription>
              Vyberte účet pro rychlé přihlášení
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {demoUsers.map((demoUser) => (
                <button
                  key={demoUser.id}
                  onClick={() => handleQuickLogin(demoUser)}
                  disabled={loading !== null}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-primary hover:bg-primary/5 transition-all text-left disabled:opacity-50"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {demoUser.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900">{demoUser.name}</div>
                    <div className="text-sm text-gray-500 truncate">{demoUser.email}</div>
                  </div>
                  <Badge
                    variant={demoUser.roleKey === 'admin' ? 'default' : 'secondary'}
                    className="flex-shrink-0"
                  >
                    {demoUser.role}
                  </Badge>
                </button>
              ))}
            </div>

            <Separator className="my-6" />

            <div className="text-center text-sm text-gray-500">
              <p>Demo verze pro testování</p>
              <p className="mt-1">Všechna hesla jsou: <code className="bg-gray-100 px-2 py-0.5 rounded">password</code></p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-white/50 text-sm mt-6">
          © 2024 ProcureX. Všechna práva vyhrazena.
        </p>
      </div>
    </div>
  )
}
