import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { shipmentsApi } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import {
  Package,
  Loader2,
  Edit,
  Check,
  Truck,
  Calendar,
  FileText,
} from 'lucide-react'
import EditShipmentModal from '@/components/EditShipmentModal'

interface Shipment {
  id: number
  orderNumber: string | null
  trackingNumber: string | null
  createdAt: string
  updatedAt: string | null
  deliveredAt: string | null
  order: { id: number; orderNumber: string } | null
}

type ShipmentStatus = 'new' | 'pending' | 'delivered'
type FilterType = 'all' | 'new' | 'pending' | 'delivered'

function getShipmentStatus(shipment: Shipment): ShipmentStatus {
  if (shipment.deliveredAt) {
    return 'delivered'
  }
  if (shipment.orderNumber || shipment.trackingNumber) {
    return 'pending'
  }
  return 'new'
}

function getStatusLabel(status: ShipmentStatus): string {
  switch (status) {
    case 'new':
      return 'Nový'
    case 'pending':
      return 'Na cestě'
    case 'delivered':
      return 'Doručeno'
  }
}

function getStatusColor(status: ShipmentStatus): string {
  switch (status) {
    case 'new':
      return 'bg-gray-100 text-gray-700'
    case 'pending':
      return 'bg-yellow-100 text-yellow-700'
    case 'delivered':
      return 'bg-green-100 text-green-700'
  }
}

export default function ShipmentsPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null)
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')

  const { data: shipmentsData, isLoading } = useQuery({
    queryKey: ['shipments'],
    queryFn: () => shipmentsApi.list(),
  })

  const shipments: Shipment[] = shipmentsData?.shipments ?? []

  // Calculate stats
  const stats = useMemo(() => {
    const all = shipments.length
    const newCount = shipments.filter(s => getShipmentStatus(s) === 'new').length
    const pendingCount = shipments.filter(s => getShipmentStatus(s) === 'pending').length
    const deliveredCount = shipments.filter(s => getShipmentStatus(s) === 'delivered').length

    return [
      { key: 'all' as FilterType, label: 'Všechny', value: all, icon: FileText },
      { key: 'new' as FilterType, label: 'Nové zásilky', value: newCount, icon: Package, color: 'text-gray-600' },
      { key: 'pending' as FilterType, label: 'Na cestě', value: pendingCount, icon: Truck, color: 'text-yellow-600' },
      { key: 'delivered' as FilterType, label: 'Doručené', value: deliveredCount, icon: Check, color: 'text-green-600' },
    ]
  }, [shipments])

  // Filter shipments based on active filter
  const filteredShipments = useMemo(() => {
    if (activeFilter === 'all') {
      return shipments
    }
    return shipments.filter(s => getShipmentStatus(s) === activeFilter)
  }, [shipments, activeFilter])

  const deliverMutation = useMutation({
    mutationFn: (id: number) => shipmentsApi.deliver(id),
    onSuccess: () => {
      toast({
        title: 'Zásilka označena jako doručená',
        description: 'Zásilka byla úspěšně označena jako doručená.',
      })
      queryClient.invalidateQueries({ queryKey: ['shipments'] })
    },
    onError: (error: Error) => {
      toast({
        title: 'Chyba',
        description: error.message || 'Nepodařilo se označit zásilku jako doručenou',
        variant: 'destructive',
      })
    },
  })

  const handleDeliver = (shipmentId: number) => {
    deliverMutation.mutate(shipmentId)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Zásilky</h1>
        <p className="text-gray-500">Správa zásilek a jejich sledování</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
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

      {/* Shipments List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Seznam zásilek</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredShipments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Žádné zásilky</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Číslo objednávky</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Sledovací číslo</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Vytvořeno</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Doručeno</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Akce</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredShipments.map((shipment) => {
                    const status = getShipmentStatus(shipment)
                    return (
                      <tr key={shipment.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-4 px-4 text-sm text-gray-900">
                          {shipment.order?.orderNumber || (
                            <span className="text-gray-400 italic">Neuvedeno</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-900">
                          {shipment.trackingNumber || (
                            <span className="text-gray-400 italic">Neuvedeno</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={cn('text-xs', getStatusColor(status))}>
                            {getStatusLabel(status)}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          {formatDate(shipment.createdAt)}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          {shipment.deliveredAt ? (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(shipment.deliveredAt)}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {status !== 'delivered' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingShipment(shipment)}
                                className="gap-2"
                                title={'Upravit'}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            {status === 'pending' && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleDeliver(shipment.id)}
                                disabled={deliverMutation.isPending}
                                className="gap-2 bg-green-600 hover:bg-green-700"
                                title={'Označit jako doručené'}
                              >
                                {deliverMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Check className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                            {status === 'delivered' && (
                              <span className="text-sm text-gray-500 italic">Doručeno</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <EditShipmentModal
        shipment={editingShipment}
        isOpen={!!editingShipment}
        onClose={() => setEditingShipment(null)}
      />
    </div>
  )
}
