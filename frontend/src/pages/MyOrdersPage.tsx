import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  FileText,
  Clock,
  CheckCircle,
  Truck,
  Eye,
  RefreshCw,
  Edit,
} from 'lucide-react'
import { formatCurrency, formatDate, statusLabels, statusColors } from '@/lib/utils'
import { cn } from '@/lib/utils'

// Mock data
const orders = [
  {
    id: 1,
    orderNumber: 'OBJ-2024-001',
    date: '2024-01-15',
    itemCount: 3,
    totalAmount: '4028',
    status: 'submitted',
  },
  {
    id: 2,
    orderNumber: 'OBJ-2024-002',
    date: '2024-01-14',
    itemCount: 2,
    totalAmount: '2602',
    status: 'approved',
  },
  {
    id: 3,
    orderNumber: 'OBJ-2024-003',
    date: '2024-01-13',
    itemCount: 1,
    totalAmount: '1780',
    status: 'delivered',
  },
  {
    id: 4,
    orderNumber: 'OBJ-2024-004',
    date: '2024-01-12',
    itemCount: 2,
    totalAmount: '3600',
    status: 'rejected',
  },
  {
    id: 5,
    orderNumber: 'OBJ-2024-005',
    date: '2024-01-11',
    itemCount: 1,
    totalAmount: '640',
    status: 'ordered',
  },
]

const stats = [
  { label: 'Všechny', value: 5, icon: FileText, active: true },
  { label: 'Čekající', value: 1, icon: Clock, color: 'text-yellow-600' },
  { label: 'Schválené', value: 1, icon: CheckCircle, color: 'text-green-600' },
  { label: 'Doručené', value: 1, icon: Truck, color: 'text-emerald-600' },
]

export default function MyOrdersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Moje nákupy</h1>
        <p className="text-gray-500">Přehled vašich objednávek a možnost jejich úpravy</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card
            key={stat.label}
            className={cn(
              'cursor-pointer transition-all hover:shadow-md',
              index === 0 && 'border-primary bg-primary/5'
            )}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div className={cn(
                'h-10 w-10 rounded-lg flex items-center justify-center',
                index === 0 ? 'bg-primary/10' : 'bg-gray-100'
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
              placeholder="Hledat podle ID nebo produktu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Všechny stavy" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Všechny stavy</SelectItem>
            <SelectItem value="draft">Koncept</SelectItem>
            <SelectItem value="submitted">Čeká na schválení</SelectItem>
            <SelectItem value="approved">Schváleno</SelectItem>
            <SelectItem value="rejected">Zamítnuto</SelectItem>
            <SelectItem value="ordered">Zpracovává se</SelectItem>
            <SelectItem value="delivered">Doručeno</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Objednávky</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Objednávka</th>
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
                    <td className="py-4 px-4 text-gray-600">{formatDate(order.date)}</td>
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
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {order.status === 'draft' && (
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {(order.status === 'approved' || order.status === 'delivered') && (
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
