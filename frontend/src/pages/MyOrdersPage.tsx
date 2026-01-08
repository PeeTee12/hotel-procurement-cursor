import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  FileText,
  Clock,
  CheckCircle,
  Truck,
  Eye,
  Loader2,
  Package,
  XCircleIcon,
} from 'lucide-react'
import { ordersApi } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { formatCurrency, formatDate, statusLabels, statusColors } from '@/lib/utils'
import { cn } from '@/lib/utils'
import OrderDetailModal from '@/components/OrderDetailModal'

interface Order {
  id: number
  orderNumber: string
  status: string
  priority: string
  totalAmount: string
  currency: string
  itemCount: number
  note: string | null
  createdAt: string
  submittedAt: string | null
  approvedAt: string | null
  branch: {
    id: number
    name: string
    organization: {
      id: number
      name: string
    }
  }
  createdBy: {
    id: number
    name: string
  }
}

type FilterType = 'all' | 'pending' | 'approved' | 'delivered' | 'rejected'

export default function MyOrdersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
  const { user } = useAuthStore()

  // Fetch orders from API for the logged in user
  const { data: ordersData, isLoading, error } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: () => ordersApi.list(user?.id),
    enabled: !!user,
  })

  const orders: Order[] = ordersData?.orders ?? []

  // Calculate stats
  const stats = useMemo(() => {
    const all = orders.length
    const pending = orders.filter(o => o.status === 'submitted' || o.status === 'draft').length
    const approved = orders.filter(o => o.status === 'approved' || o.status === 'ordered').length
    const delivered = orders.filter(o => o.status === 'delivered').length
    const rejected = orders.filter(o => o.status === 'rejected').length

    return [
      { key: 'all' as FilterType, label: 'Všechny', value: all, icon: FileText },
      { key: 'pending' as FilterType, label: 'Čekající', value: pending, icon: Clock, color: 'text-yellow-600' },
      { key: 'approved' as FilterType, label: 'Na cestě', value: approved, icon: Truck, color: 'text-green-600' },
      { key: 'delivered' as FilterType, label: 'Doručené', value: delivered, icon: CheckCircle, color: 'text-emerald-600' },
      { key: 'rejected' as FilterType, label: 'Zamítnuté', value: rejected, icon: XCircleIcon, color: 'text-red-600' },
    ]
  }, [orders])

  // Filter orders based on active filter and search
  const filteredOrders = useMemo(() => {
    let filtered = [...orders]

    // Apply category filter
    if (activeFilter === 'pending') {
      filtered = filtered.filter(o => o.status === 'submitted' || o.status === 'draft')
    } else if (activeFilter === 'approved') {
      filtered = filtered.filter(o => o.status === 'approved' || o.status === 'ordered')
    } else if (activeFilter === 'delivered') {
      filtered = filtered.filter(o => o.status === 'delivered')
    } else if (activeFilter === 'rejected') {
      filtered = filtered.filter(o => o.status === 'rejected')
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(query) ||
        order.branch.name.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [orders, activeFilter, searchQuery])

  const handleViewOrder = (orderId: number) => {
    setSelectedOrderId(orderId)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Moje nákupy</h1>
        <p className="text-gray-500">Přehled vašich objednávek a možnost jejich úpravy</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        {stats.map((stat) => (
          <Card
            key={stat.key}
            onClick={() => setActiveFilter(stat.key)}
            className={cn(
              'cursor-pointer transition-all hover:shadow-md',
              activeFilter === stat.key && 'border-primary bg-primary/5'
            )}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div className={cn(
                'h-10 w-10 rounded-lg flex items-center justify-center',
                activeFilter === stat.key ? 'bg-primary/10' : 'bg-gray-100'
              )}>
                <stat.icon className={cn('h-5 w-5', stat.color || 'text-gray-600')} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Hledat podle ID nebo hotelu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Orders table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Objednávky</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-gray-500">
              <p>Nepodařilo se načíst objednávky</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Žádné objednávky nenalezeny</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Objednávka</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Hotel</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Datum</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Položky</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Celkem</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Akce</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <span className="font-medium text-gray-900">{order.orderNumber}</span>
                      </td>
                      <td className="py-4 px-4 text-gray-600">{order.branch.name}</td>
                      <td className="py-4 px-4 text-gray-600">{formatDate(order.createdAt)}</td>
                      <td className="py-4 px-4 text-gray-600">{order.itemCount} pol.</td>
                      <td className="py-4 px-4 font-medium text-gray-900">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={cn('text-xs', statusColors[order.status])}>
                          {statusLabels[order.status]}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleViewOrder(order.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Modal */}
      <OrderDetailModal
        orderId={selectedOrderId}
        isOpen={selectedOrderId !== null}
        onClose={() => setSelectedOrderId(null)}
      />
    </div>
  )
}
