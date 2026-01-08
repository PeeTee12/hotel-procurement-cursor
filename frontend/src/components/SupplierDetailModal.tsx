import { useQuery } from '@tanstack/react-query'
import { suppliersApi } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import {
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getRelativeTime } from '@/lib/utils'

interface SupplierDetailModalProps {
  supplierId: number | null
  isOpen: boolean
  onClose: () => void
}

interface SupplierDetail {
  id: number
  name: string
  category: string | null
  productCount: number
  ordersPerMonth: number
  status: string
  apiEndpoint: string | null
  lastSyncAt: string | null
}

const statusConfig = {
  active: { label: 'Aktivní', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  syncing: { label: 'Synchronizace', color: 'bg-blue-100 text-blue-700', icon: Loader2 },
  error: { label: 'Chyba', color: 'bg-red-100 text-red-700', icon: AlertCircle },
}

export default function SupplierDetailModal({ supplierId, isOpen, onClose }: SupplierDetailModalProps) {
  // Fetch supplier detail from API
  const { data: supplier, isLoading, error } = useQuery<SupplierDetail>({
    queryKey: ['supplier', supplierId],
    queryFn: () => suppliersApi.get(supplierId!),
    enabled: isOpen && !!supplierId,
  })

  if (!isOpen) return null

  const status = supplier ? statusConfig[supplier.status as keyof typeof statusConfig] : null

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
              {status && <status.icon className={cn('h-5 w-5', status.color.split(' ')[1])} />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Detail dodavatele</h2>
              {supplier && (
                <p className="text-sm text-gray-500">{supplier.name}</p>
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
              <p>Nepodařilo se načíst detail dodavatele</p>
            </div>
          ) : supplier ? (
            <div className="space-y-6">
              {/* Status */}
              <div className="flex items-center gap-3">
                <Badge className={cn('text-sm px-3 py-1', status?.color)}>
                  {status?.label}
                </Badge>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Kategorie</p>
                  <p className="font-medium text-gray-900">{supplier.category || 'Nezadáno'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Produktů</p>
                  <p className="font-medium text-gray-900">{supplier.productCount.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Objednávek / měsíc</p>
                  <p className="font-medium text-gray-900">{supplier.ordersPerMonth}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Poslední synchronizace</p>
                  <p className="font-medium text-gray-900">
                    {supplier.lastSyncAt ? getRelativeTime(supplier.lastSyncAt) : 'Nikdy'}
                  </p>
                </div>
              </div>

              {/* API Endpoint */}
              {supplier.apiEndpoint && (
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                  <p className="text-xs text-blue-600 mb-1">API Endpoint</p>
                  <p className="text-sm text-blue-800 break-all">{supplier.apiEndpoint}</p>
                </div>
              )}

              {/* Error message if status is error */}
              {supplier.status === 'error' && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                  <p className="text-sm text-red-700">
                    Došlo k chybě při synchronizaci. Zkontrolujte konfiguraci API endpointu.
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
