import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useCartStore } from '@/store/cartStore'
import { branchesApi, ordersApi } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  X,
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
  Building2,
  FileText,
  Loader2,
  Package,
} from 'lucide-react'

interface CartModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartModal({ isOpen, onClose }: CartModalProps) {
  const { items, updateQuantity, removeItem, clearCart, getTotal } = useCartStore()
  const [selectedBranch, setSelectedBranch] = useState<string>('')
  const [note, setNote] = useState('')
  const { toast } = useToast()

  // Fetch branches
  const { data: branchesData, isLoading: branchesLoading } = useQuery({
    queryKey: ['branches'],
    queryFn: () => branchesApi.list(),
    enabled: isOpen,
  })

  const branches = branchesData?.branches ?? []

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async () => {
      if (!selectedBranch) {
        throw new Error('Vyberte prosím hotel')
      }

      const orderData = {
        branchId: parseInt(selectedBranch),
        items: items.map(item => ({
          productOfferId: item.productOfferId,
          quantity: item.quantity,
        })),
        note: note || undefined,
      }

      // Create order
      const result = await ordersApi.create(orderData)
      
      // Submit order immediately
      if (result.order?.id) {
        await ordersApi.submit(result.order.id)
      }
      
      return result
    },
    onSuccess: (data) => {
      toast({
        title: 'Objednávka vytvořena',
        description: `Objednávka ${data.order?.orderNumber} byla úspěšně odeslána ke schválení.`,
      })
      clearCart()
      setNote('')
      setSelectedBranch('')
      onClose()
    },
    onError: (error: Error) => {
      toast({
        title: 'Chyba',
        description: error.message || 'Nepodařilo se vytvořit objednávku',
        variant: 'destructive',
      })
    },
  })

  const handleQuantityChange = (productOfferId: number, currentQuantity: number, delta: number) => {
    const newQuantity = Math.max(1, currentQuantity + delta)
    updateQuantity(productOfferId, newQuantity)
  }

  const handleSubmit = () => {
    if (!selectedBranch) {
      toast({
        title: 'Chyba',
        description: 'Vyberte prosím hotel pro doručení',
        variant: 'destructive',
      })
      return
    }

    if (items.length === 0) {
      toast({
        title: 'Chyba',
        description: 'Košík je prázdný',
        variant: 'destructive',
      })
      return
    }

    createOrderMutation.mutate()
  }

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
              <ShoppingCart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Košík</h2>
              <p className="text-sm text-gray-500">{items.length} položek</p>
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
          {items.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Košík je prázdný</p>
              <p className="text-sm text-gray-400 mt-1">Přidejte produkty z katalogu</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Cart items */}
              {items.map((item) => (
                <div
                  key={item.productOfferId}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
                >
                  {/* Product image placeholder */}
                  <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-secondary/20 to-secondary/10 flex items-center justify-center flex-shrink-0">
                    <Package className="h-8 w-8 text-primary/30" />
                  </div>

                  {/* Product info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{item.product.name}</h3>
                    <p className="text-sm text-gray-500">{item.supplier.name}</p>
                    <p className="text-sm text-primary font-medium">
                      {formatCurrency(item.unitPrice)} / {item.product.unit}
                    </p>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border rounded-lg bg-white">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleQuantityChange(item.productOfferId, item.quantity, -1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleQuantityChange(item.productOfferId, item.quantity, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Item total */}
                  <div className="text-right w-24">
                    <p className="font-semibold text-gray-900">{formatCurrency(item.totalPrice)}</p>
                  </div>

                  {/* Remove button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-red-500"
                    onClick={() => removeItem(item.productOfferId)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {/* Branch selection */}
              <div className="pt-4 border-t">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Building2 className="h-4 w-4" />
                  Hotel pro doručení
                </label>
                {branchesLoading ? (
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Načítám hotely...
                  </div>
                ) : (
                  <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Vyberte hotel" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id.toString()}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Note */}
              <div className="pt-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <FileText className="h-4 w-4" />
                  Poznámka k objednávce
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Zadejte poznámku k objednávce (volitelné)..."
                  className="w-full px-3 py-2 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  rows={3}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-6">
          {/* Total */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-600">Celkem</span>
            <span className="text-2xl font-bold text-gray-900">{formatCurrency(getTotal())}</span>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Pokračovat v nákupu
            </Button>
            <Button
              className="flex-1 bg-primary hover:bg-primary/90"
              onClick={handleSubmit}
              disabled={items.length === 0 || !selectedBranch || createOrderMutation.isPending}
            >
              {createOrderMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Odesílám...
                </>
              ) : (
                'Odeslat objednávku'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
