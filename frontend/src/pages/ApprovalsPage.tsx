import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  AlertCircle,
  Clock,
  Eye,
  Building2,
  User,
  CheckCircle,
  XCircle,
  Loader2,
  Package,
} from 'lucide-react'
import { ordersApi } from '@/lib/api'
import { formatCurrency, formatDateTime, priorityLabels, priorityColors } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import OrderDetailModal from '@/components/OrderDetailModal'

interface PendingOrder {
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

type PriorityFilter = 'all' | 'high' | 'medium' | 'low'

export default function ApprovalsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all')
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Fetch pending orders from API
  const { data: ordersData, isLoading, error } = useQuery({
    queryKey: ['orders', 'pending'],
    queryFn: () => ordersApi.getPending(),
  })

  const orders: PendingOrder[] = ordersData?.orders ?? []

  // Calculate priority stats
  const priorityStats = useMemo(() => {
    const high = orders.filter(o => o.priority === 'high').length
    const medium = orders.filter(o => o.priority === 'medium').length
    const low = orders.filter(o => o.priority === 'low').length

    return [
      { 
        key: 'high' as PriorityFilter, 
        label: 'Vysoká priorita', 
        value: high, 
        color: 'bg-red-100 text-red-700 border-red-500', 
        icon: AlertCircle 
      },
      { 
        key: 'medium' as PriorityFilter, 
        label: 'Střední priorita', 
        value: medium, 
        color: 'bg-yellow-100 text-yellow-700 border-yellow-500', 
        icon: Clock 
      },
      { 
        key: 'low' as PriorityFilter, 
        label: 'Nízká priorita', 
        value: low, 
        color: 'bg-gray-100 text-gray-600 border-gray-500', 
        icon: Clock 
      },
    ]
  }, [orders])

  // Filter orders by priority and search
  const filteredOrders = useMemo(() => {
    let filtered = [...orders]

    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(o => o.priority === priorityFilter)
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(query) ||
        order.branch.name.toLowerCase().includes(query) ||
        order.createdBy.name.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [orders, priorityFilter, searchQuery])

  // Approve order mutation
  const approveMutation = useMutation({
    mutationFn: (orderId: number) => ordersApi.approve(orderId),
    onSuccess: () => {
      toast({
        title: 'Objednávka schválena',
        description: 'Objednávka byla úspěšně schválena.',
      })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
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

  const handleViewOrder = (orderId: number) => {
    setSelectedOrderId(orderId)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Schvalování objednávek</h1>
        <p className="text-gray-500">Objednávky čekající na vaše schválení</p>
      </div>

      {/* Priority stats */}
      <div className="grid grid-cols-3 gap-4">
        {priorityStats.map((stat) => (
          <Card 
            key={stat.key}
            onClick={() => setPriorityFilter(stat.key)}
            className={cn(
              'cursor-pointer transition-all hover:shadow-md border-l-4',
              priorityFilter === stat.key && 'ring-2 ring-primary',
              stat.color.split(' ')[0] === 'bg-red-100' && 'border-l-red-500',
              stat.color.split(' ')[0] === 'bg-yellow-100' && 'border-l-yellow-500',
              stat.color.split(' ')[0] === 'bg-gray-100' && 'border-l-gray-500'
            )}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center', stat.color.split(' ').slice(0, 2).join(' '))}>
                  <stat.icon className={cn('h-5 w-5', stat.color.split(' ').slice(2).join(' '))} />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Hledat objednávky..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Orders table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-gray-500">
              <p>Nepodařilo se načíst objednávky</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Objednávka</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Hotel</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Žadatel</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Položky</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Celkem</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Priorita</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Akce</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-500">
                        {orders.length === 0 ? (
                          <>
                            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Žádné objednávky čekající na schválení</p>
                          </>
                        ) : (
                          <p>Žádné objednávky neodpovídají filtru</p>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{order.orderNumber}</p>
                            <p className="text-xs text-gray-500">
                              {formatDateTime(order.submittedAt || order.createdAt)}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-700">{order.branch.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-700">{order.createdBy.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-600">{order.itemCount} pol.</td>
                        <td className="py-4 px-4 font-medium text-gray-900">
                          {formatCurrency(order.totalAmount)}
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={cn('text-xs', priorityColors[order.priority])}>
                            {priorityLabels[order.priority]}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => handleViewOrder(order.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => handleApprove(order.id)}
                              disabled={approveMutation.isPending || rejectMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleReject(order.id)}
                              disabled={approveMutation.isPending || rejectMutation.isPending}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
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
