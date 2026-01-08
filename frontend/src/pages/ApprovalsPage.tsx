import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
} from 'lucide-react'
import { formatCurrency, formatDateTime, priorityLabels, priorityColors } from '@/lib/utils'
import { cn } from '@/lib/utils'

// Mock data
const pendingOrders = [
  {
    id: 1,
    orderNumber: 'OBJ-2024-001',
    date: '2024-01-15T10:30:00',
    hotel: 'OREA Hotel Pyramida',
    requester: 'Jan Novák',
    itemCount: 3,
    totalAmount: '4028',
    priority: 'medium',
  },
]

const priorityStats = [
  { label: 'Vysoká priorita', value: 0, color: 'bg-red-100 text-red-700', icon: AlertCircle },
  { label: 'Střední priorita', value: 1, color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  { label: 'Nízká priorita', value: 0, color: 'bg-gray-100 text-gray-600', icon: Clock },
]

export default function ApprovalsPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredOrders = pendingOrders.filter(order =>
    order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.hotel.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.requester.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
          <Card key={stat.label} className={cn('border-l-4', stat.color.replace('text-', 'border-l-'))}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center', stat.color)}>
                  <stat.icon className="h-5 w-5" />
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
                      Žádné objednávky čekající na schválení
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{order.orderNumber}</p>
                          <p className="text-xs text-gray-500">{formatDateTime(order.date)}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-700">{order.hotel}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-700">{order.requester}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-600">{order.itemCount}</td>
                      <td className="py-4 px-4 font-medium text-gray-900">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={cn('text-xs', priorityColors[order.priority])}>
                          {priorityLabels[order.priority]}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
