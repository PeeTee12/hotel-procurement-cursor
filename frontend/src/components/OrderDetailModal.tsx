import { useQuery } from '@tanstack/react-query'
import { ordersApi } from '@/lib/api'
import { formatCurrency, statusLabels, statusColors, priorityLabels, priorityColors } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  X,
  Package,
  Loader2,
  Building2,
  User,
  FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface OrderDetailModalProps {
  orderId: number | null
  isOpen: boolean
  onClose: () => void
}

interface OrderDetail {
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
  items?: Array<{
    id: number
    quantity: number
    unitPrice: string
    totalPrice: string
    product: {
      id: number
      name: string
      unit: string
    }
    supplier: {
      id: number
      name: string
    }
  }>
}

export default function OrderDetailModal({ orderId, isOpen, onClose }: OrderDetailModalProps) {
  // Fetch order detail from API
  const { data: order, isLoading, error } = useQuery<OrderDetail>({
    queryKey: ['order', orderId],
    queryFn: () => ordersApi.get(orderId!),
    enabled: isOpen && !!orderId,
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Detail objednávky</h2>
              {order && (
                <p className="text-sm text-gray-500">{order.orderNumber}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-10 w-10 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-gray-500">
              <p>Nepodařilo se načíst detail objednávky</p>
            </div>
          ) : order ? (
            <div className="space-y-6">
              {/* Order info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Hotel</p>
                    <p className="font-medium text-gray-900">{order.branch.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Vytvořil</p>
                    <p className="font-medium text-gray-900">{order.createdBy.name}</p>
                  </div>
                </div>
              </div>

              {/* Note */}
              {order.note && (
                <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-xl">
                  <p className="text-xs text-yellow-600 mb-1">Poznámka</p>
                  <p className="text-sm text-yellow-800">{order.note}</p>
                </div>
              )}

              {/* Items */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Položky objednávky</h3>
                <div className="space-y-2">
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
                      >
                        {/* Product image placeholder */}
                        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-secondary/20 to-secondary/10 flex items-center justify-center flex-shrink-0">
                          <Package className="h-6 w-6 text-primary/30" />
                        </div>

                        {/* Product info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                          <p className="text-sm text-gray-500">{item.supplier.name}</p>
                        </div>

                        {/* Quantity */}
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Množství</p>
                          <p className="font-medium text-gray-900">{item.quantity} {item.product.unit}</p>
                        </div>

                        {/* Price */}
                        <div className="text-right w-24">
                          <p className="text-sm text-gray-500">Cena</p>
                          <p className="font-semibold text-gray-900">{formatCurrency(item.totalPrice)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Žádné položky</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        {order && (
          <div className="border-t p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge className={cn('text-sm px-3 py-1', statusColors[order.status])}>
                  {statusLabels[order.status]}
                </Badge>
                <Badge className={cn('text-sm px-3 py-1', priorityColors[order.priority])}>
                  {priorityLabels[order.priority]} priorita
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Celkem</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(order.totalAmount)}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
