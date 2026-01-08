import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  ClipboardCheck,
  Truck,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  Bell,
  Search,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Nakoupit', href: '/buy', icon: ShoppingCart },
  { name: 'Moje nákupy', href: '/my-orders', icon: Package },
  { name: 'Schvalování', href: '/approvals', icon: ClipboardCheck, badge: true },
  { name: 'Dodavatelé', href: '/suppliers', icon: Truck },
  { name: 'Reporty', href: '/reports', icon: BarChart3 },
  { name: 'Nastavení', href: '/settings', icon: Settings },
]

export default function Layout() {
  const { user, currentOrganization, logout } = useAuthStore()
  const { getItemCount } = useCartStore()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const cartCount = getItemCount()
  const isAdmin = user?.roles.includes('ROLE_ADMIN')

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={cn(
          'bg-white border-r border-gray-200 flex flex-col transition-all duration-300',
          collapsed ? 'w-20' : 'w-64'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white font-bold">
                P
              </div>
              <div>
                <div className="font-semibold text-gray-900">ProcureX</div>
                <div className="text-xs text-gray-500">Orea Platform</div>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-400 hover:text-gray-600"
          >
            <ChevronLeft className={cn('h-5 w-5 transition-transform', collapsed && 'rotate-180')} />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            // Hide approvals for non-admin
            if (item.href === '/approvals' && !isAdmin) return null

            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )
                }
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1">{item.name}</span>
                    {item.badge && isAdmin && (
                      <Badge className="bg-secondary text-secondary-foreground text-xs px-2 py-0.5">
                        1
                      </Badge>
                    )}
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-gray-100">
          <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-gray-100 text-gray-600 text-sm">
                {user?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">{user?.name}</div>
                <div className="text-xs text-gray-500 truncate">
                  {currentOrganization?.role === 'admin' ? 'Administrátor' : 'Uživatel'}
                </div>
              </div>
            )}
            {!collapsed && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-gray-400 hover:text-gray-600"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Hledat produkty, objednávky..."
                className="pl-10 bg-gray-50 border-gray-200"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-gray-500" />
            </Button>
            {cartCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/buy')}
                className="gap-2"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>{cartCount} položek</span>
              </Button>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
