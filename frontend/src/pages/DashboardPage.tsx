import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ShoppingCart,
  Clock,
  CheckCircle,
  Package,
  ArrowRight,
  X,
  Check,
} from 'lucide-react'
import { formatCurrency, formatDateTime, getRelativeTime, statusLabels, statusColors } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Link } from 'react-router-dom'

export default function DashboardPage() {
  const { user, currentOrganization } = useAuthStore()
  const isAdmin = user?.roles.includes('ROLE_ADMIN')

  // Use mock data for now since API might not be connected
  const stats = {
    totalOrders: 5,
    totalAmount: '12650',
    pendingApproval: 1,
    approvedToday: 0,
    urgentOrders: 0,
  }

  const recentOrders = [
    {
      id: 1,
      orderNumber: 'OBJ-2024-001',
      status: 'submitted',
      totalAmount: '4028',
      itemCount: 3,
      createdAt: new Date().toISOString(),
      branch: { name: 'OREA Hotel Pyramida' },
      createdBy: { name: 'Jan Novák' },
    },
    {
      id: 2,
      orderNumber: 'OBJ-2024-002',
      status: 'approved',
      totalAmount: '2602',
      itemCount: 2,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      branch: { name: 'OREA Hotel Pyramida' },
      createdBy: { name: 'Jan Novák' },
    },
    {
      id: 3,
      orderNumber: 'OBJ-2024-003',
      status: 'delivered',
      totalAmount: '1780',
      itemCount: 1,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      branch: { name: 'OREA Hotel Voroněž' },
      createdBy: { name: 'Marie Svobodová' },
    },
    {
      id: 4,
      orderNumber: 'OBJ-2024-004',
      status: 'rejected',
      totalAmount: '3600',
      itemCount: 2,
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      branch: { name: 'OREA Resort Devět Skal' },
      createdBy: { name: 'Jan Novák' },
    },
  ]

  const pendingApproval = recentOrders.filter(o => o.status === 'submitted')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Vítejte zpět v ProcureX platformě</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Celkem objednávek</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalOrders}</p>
                <p className="text-sm text-primary mt-1">
                  Celková hodnota: {formatCurrency(stats.totalAmount)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Čekající schválení</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.pendingApproval}</p>
                <p className="text-sm text-gray-500 mt-1">Žádné urgentní</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Schváleno dnes</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.approvedToday}</p>
                <p className="text-sm text-gray-500 mt-1">Automaticky + manuálně</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Poslední objednávky</CardTitle>
              <p className="text-sm text-gray-500">Přehled nedávných objednávek</p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/my-orders" className="gap-1">
                Zobrazit vše <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center gap-4 p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Package className="h-5 w-5 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{order.orderNumber}</span>
                      <Badge className={cn('text-xs', statusColors[order.status])}>
                        {statusLabels[order.status]}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">{order.branch.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatCurrency(order.totalAmount)}</p>
                    <p className="text-sm text-gray-500">{order.itemCount} položek</p>
                  </div>
                  <div className="text-right text-sm text-gray-500 w-24">
                    {getRelativeTime(order.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Approval */}
        {isAdmin && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">Čekající schválení</CardTitle>
                <Badge variant="secondary" className="bg-secondary/20 text-secondary-foreground">
                  {pendingApproval.length}
                </Badge>
              </div>
              <p className="text-sm text-gray-500">Objednávky vyžadující vaši pozornost</p>
            </CardHeader>
            <CardContent>
              {pendingApproval.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Žádné čekající objednávky</p>
              ) : (
                <div className="space-y-4">
                  {pendingApproval.map((order) => (
                    <div
                      key={order.id}
                      className="p-4 rounded-lg border border-gray-200 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{order.orderNumber}</p>
                          <p className="text-sm text-gray-500">{order.branch.name}</p>
                        </div>
                        <span className="text-xs text-gray-400">
                          {getRelativeTime(order.createdAt)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Od: {order.createdBy.name}</p>
                        <p className="font-semibold text-gray-900">{formatCurrency(order.totalAmount)}</p>
                        <p className="text-xs text-gray-500">{order.itemCount} položek</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 gap-1">
                          <X className="h-4 w-4" /> Zamítnout
                        </Button>
                        <Button size="sm" className="flex-1 gap-1 bg-primary">
                          <Check className="h-4 w-4" /> Schválit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
