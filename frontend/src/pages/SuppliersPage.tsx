import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Eye,
  ExternalLink,
  Plus,
  Loader2,
} from 'lucide-react'
import { suppliersApi } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import { getRelativeTime } from '@/lib/utils'
import SupplierDetailModal from '@/components/SupplierDetailModal'
import AddSupplierModal from '@/components/AddSupplierModal'

interface Supplier {
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
  active: { label: 'Aktivní', color: 'bg-green-500', icon: CheckCircle },
  syncing: { label: 'Synchronizace', color: 'bg-blue-500', icon: Loader2 },
  error: { label: 'Chyba', color: 'bg-red-500', icon: AlertCircle },
}

export default function SuppliersPage() {
  const { user } = useAuthStore()
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [syncingId, setSyncingId] = useState<number | null>(null)
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const isAdmin = user?.roles.includes('ROLE_ADMIN')

  // Fetch suppliers from API
  const { data: suppliersData, isLoading, error } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => suppliersApi.list(),
  })

  const suppliers: Supplier[] = suppliersData?.suppliers ?? []
  const stats = suppliersData?.stats ?? { active: 0, withErrors: 0, total: 0 }

  // Sync mutation
  const syncMutation = useMutation({
    mutationFn: (supplierId: number) => {
      setSyncingId(supplierId)
      return suppliersApi.sync(supplierId)
    },
    onSuccess: () => {
      toast({
        title: 'Synchronizace dokončena',
        description: 'Katalog dodavatele byl úspěšně aktualizován.',
      })
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      setSyncingId(null)
    },
    onError: (error: Error) => {
      toast({
        title: 'Chyba synchronizace',
        description: error.message || 'Nepodařilo se synchronizovat katalog',
        variant: 'destructive',
      })
      setSyncingId(null)
    },
  })

  const handleSync = (supplierId: number) => {
    syncMutation.mutate(supplierId)
  }

  const handleViewSupplier = (supplierId: number) => {
    setSelectedSupplierId(supplierId)
  }

  const handleOpenApiEndpoint = (endpoint: string) => {
    window.open(endpoint, '_blank', 'noopener,noreferrer')
  }

  const activeCount = stats.active
  const errorCount = stats.withErrors

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dodavatelé</h1>
          <p className="text-gray-500">Správa napojených API a synchronizace katalogů</p>
        </div>
        {isAdmin && (
          <Button className="bg-primary gap-2" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4" /> Přidat dodavatele
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4">
        <Badge variant="secondary" className="gap-1 px-3 py-1 bg-green-100 text-green-700">
          <CheckCircle className="h-3 w-3" /> {activeCount} aktivních
        </Badge>
        {errorCount > 0 && (
          <Badge variant="secondary" className="gap-1 px-3 py-1 bg-red-100 text-red-700">
            <AlertCircle className="h-3 w-3" /> {errorCount} s chybou
          </Badge>
        )}
      </div>

      {/* Suppliers grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : error ? (
        <div className="text-center py-12 text-gray-500">
          <p>Nepodařilo se načíst dodavatele</p>
        </div>
      ) : suppliers.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>Žádní dodavatelé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map((supplier) => {
            const status = statusConfig[supplier.status as keyof typeof statusConfig]
            const isSyncing = syncingId === supplier.id || supplier.status === 'syncing'
            const hasApiEndpoint = !!supplier.apiEndpoint && supplier.apiEndpoint.trim() !== ''
            const lastSyncText = supplier.lastSyncAt 
              ? getRelativeTime(supplier.lastSyncAt)
              : supplier.status === 'syncing' 
                ? 'Synchronizuji...' 
                : supplier.status === 'error'
                  ? 'Chyba synchronizace'
                  : 'Nikdy'

            return (
              <Card key={supplier.id} className="relative overflow-hidden">
                {/* Status indicator */}
                <div className={cn('absolute top-4 right-4 h-3 w-3 rounded-full', status.color)} />

                <CardContent className="p-6">
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 text-lg">{supplier.name}</h3>
                    <p className="text-sm text-gray-500">{supplier.category || 'Nezadáno'}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{supplier.productCount.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">produktů</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{supplier.ordersPerMonth}</p>
                      <p className="text-xs text-gray-500">objednávek / měsíc</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm mb-4">
                    <span className="text-gray-500">Synchronizace</span>
                    <span className={cn(
                      supplier.status === 'error' ? 'text-red-600' : 'text-gray-700'
                    )}>
                      {lastSyncText}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1 bg-gray-100 rounded-full mb-4 overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        supplier.status === 'error' ? 'bg-red-500' :
                        supplier.status === 'syncing' ? 'bg-blue-500 w-3/4 animate-pulse' :
                        'bg-green-500 w-full'
                      )}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 gap-2"
                      disabled={isSyncing || !hasApiEndpoint}
                      onClick={() => handleSync(supplier.id)}
                    >
                      {isSyncing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                      Synchronizovat
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewSupplier(supplier.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {hasApiEndpoint && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenApiEndpoint(supplier.apiEndpoint!)}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {supplier.status === 'error' && (
                    <div className="mt-4 p-3 bg-red-50 rounded-lg text-sm text-red-700">
                      {hasApiEndpoint
                        ? 'Chyba synchronizace. Zkontrolujte konfiguraci API endpointu.'
                        : 'API endpoint není nastaven.'}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Supplier Detail Modal */}
      <SupplierDetailModal
        supplierId={selectedSupplierId}
        isOpen={selectedSupplierId !== null}
        onClose={() => setSelectedSupplierId(null)}
      />

      {/* Add Supplier Modal */}
      <AddSupplierModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  )
}
