import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { dashboardApi, ordersApi } from '@/lib/api'
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
  Loader2,
} from 'lucide-react'
import { formatCurrency, getRelativeTime, statusLabels, statusColors } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { Link } from 'react-router-dom'

interface Order {
  id: number
  orderNumber: string
  status: string
  priority: string
  totalAmount: string
  currency: string
  itemCount: number
  createdAt: string
  submittedAt: string | null
  branch: {
    id: number
    name: string
  }
  createdBy: {
    id: number
    name: string
  }
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const isAdmin = user?.roles.includes('ROLE_ADMIN')

  // Fetch dashboard stats (for admin) or user orders (for regular users)
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.get(),
    enabled: isAdmin,
  })

  // Fetch user's own orders for non-admin users
  const { data: userOrdersData, isLoading: userOrdersLoading } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: () => ordersApi.list(user?.id),
    enabled: !isAdmin && !!user,
  })

  // Fetch pending orders for admin
  const { data: pendingOrdersData, isLoading: pendingLoading } = useQuery({
    queryKey: ['orders', 'pending'],
    queryFn: () => ordersApi.getPending(),
    enabled: isAdmin,
  })

  // Get recent orders - admin sees from dashboard, regular users see their own
  const recentOrders: Order[] = isAdmin 
    ? (dashboardData?.recentOrders ?? [])
    : (userOrdersData?.orders?.slice(0, 10) ?? [])

  // Get pending approval orders - only for admin
  const pendingApproval: Order[] = isAdmin 
    ? (pendingOrdersData?.orders ?? [])
    : []

  // Get stats - admin from dashboard API, regular users calculate from their orders
  const stats = isAdmin && dashboardData
    ? dashboardData.stats
    : {
        totalOrders: userOrdersData?.orders?.length ?? 0,
        totalAmount: userOrdersData?.orders?.reduce((sum: number, o: Order) => sum + parseFloat(o.totalAmount), 0).toFixed(2) ?? '0',
        pendingApproval: userOrdersData?.orders?.filter((o: Order) => o.status === 'submitted' || o.status === 'draft').length ?? 0,
        approvedToday: 0,
        urgentOrders: userOrdersData?.orders?.filter((o: Order) => o.priority === 'high' && (o.status === 'submitted' || o.status === 'draft')).length ?? 0,
      }

  const isLoading = isAdmin 
    ? (dashboardLoading || pendingLoading)
    : userOrdersLoading

  // Approve order mutation
  const approveMutation = useMutation({
    mutationFn: (orderId: number) => ordersApi.approve(orderId),
    onSuccess: () => {
      toast({
        title: 'Objednávka schválena',
        description: 'Objednávka byla úspěšně schválena.',
      })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: (error: Error) => {
      toast({
        title: 'Chyba',
        description: error.message || 'Nepodařilo se schválit objednávku',
        variant: 'destructive',
      })
    },
  })

  // Reject order mutation
  const rejectMutation = useMutation({
    mutationFn: (orderId: number) => ordersApi.reject(orderId),
    onSuccess: () => {
      toast({
        title: 'Objednávka zamítnuta',
        description: 'Objednávka byla zamítnuta.',
      })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: (error: Error) => {
      toast({
        title: 'Chyba',
        description: error.message || 'Nepodařilo se zamítnout objednávku',
        variant: 'destructive',
      })
    },
  })

  const handleApprove = (orderId: number) => {
    approveMutation.mutate(orderId)
  }

  const handleReject = (orderId: number) => {
    if (confirm('Opravdu chcete zamítnout tuto objednávku?')) {
      rejectMutation.mutate(orderId)
    }
  }

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
                <p className="text-sm text-gray-500">Čekající na schválení</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.pendingApproval}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {stats.urgentOrders > 0 ? `${stats.urgentOrders} urgentní` : 'Žádné urgentní'}
                </p>
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
              <p className="text-sm text-gray-500">
                {isAdmin ? 'Přehled nedávných objednávek' : 'Vaše nedávné objednávky'}
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/my-orders" className="gap-1">
                Zobrazit vše <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Žádné objednávky</p>
              </div>
            ) : (
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
            )}
          </CardContent>
        </Card>

        {/* Pending Approval - Only for Admin */}
        {isAdmin && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">Čekající na schválení</CardTitle>
                <Badge variant="secondary" className="bg-secondary/20 text-secondary-foreground">
                  {pendingApproval.length}
                </Badge>
              </div>
              <p className="text-sm text-gray-500">Objednávky vyžadující vaši pozornost</p>
            </CardHeader>
            <CardContent>
              {pendingLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : pendingApproval.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Žádné čekající objednávky</p>
              ) : (
                <div className="space-y-4">
                  {pendingApproval.slice(0, 5).map((order) => (
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
                          {getRelativeTime(order.submittedAt || order.createdAt)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Od: {order.createdBy.name}</p>
                        <p className="font-semibold text-gray-900">{formatCurrency(order.totalAmount)}</p>
                        <p className="text-xs text-gray-500">{order.itemCount} položek</p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 gap-1"
                          onClick={() => handleReject(order.id)}
                          disabled={approveMutation.isPending || rejectMutation.isPending}
                        >
                          <X className="h-4 w-4" /> Zamítnout
                        </Button>
                        <Button 
                          size="sm" 
                          className="flex-1 gap-1 bg-primary"
                          onClick={() => handleApprove(order.id)}
                          disabled={approveMutation.isPending || rejectMutation.isPending}
                        >
                          <Check className="h-4 w-4" /> Schválit
                        </Button>
                      </div>
                    </div>
                  ))}
                  {pendingApproval.length > 5 && (
                    <Button variant="ghost" size="sm" className="w-full" asChild>
                      <Link to="/approvals">
                        Zobrazit všechny ({pendingApproval.length})
                      </Link>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
