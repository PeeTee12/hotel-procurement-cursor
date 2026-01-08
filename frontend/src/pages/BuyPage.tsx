import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useCartStore, CartItem } from '@/store/cartStore'
import { useToast } from '@/components/ui/use-toast'
import { productsApi } from '@/lib/api'
import CartModal from '@/components/CartModal'
import {
  Search,
  Home,
  ChevronRight,
  ChevronDown,
  Package,
  Minus,
  Plus,
  ShoppingCart,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Category {
  id: number
  name: string
  icon: string | null
  children: Category[]
  productCount: number
}

interface Product {
  id: number
  name: string
  description: string | null
  unit: string
  image: string | null
  category: { id: number; name: string } | null
  offers: Array<{
    id: number
    price: string
    currency: string
    supplier: { id: number; name: string }
  }>
  bestPrice: string | null
  currency: string
}

// Fallback mock data in case API is not available
// const mockCategories: Category[] = [
//   { id: 1, name: 'Maso', icon: 'box', productCount: 3, children: [
//     { id: 6, name: 'Hovězí', icon: null, productCount: 1, children: [] },
//     { id: 7, name: 'Vepřové', icon: null, productCount: 1, children: [] },
//     { id: 8, name: 'Drůbež', icon: null, productCount: 1, children: [] },
//   ]},
//   { id: 2, name: 'Zelenina', icon: 'box', productCount: 2, children: [] },
//   { id: 3, name: 'Mléčné výrobky', icon: 'box', productCount: 3, children: [
//     { id: 9, name: 'Jogurty', icon: null, productCount: 1, children: [] },
//     { id: 10, name: 'Sýry', icon: null, productCount: 1, children: [] },
//     { id: 11, name: 'Mléko', icon: null, productCount: 1, children: [] },
//   ]},
//   { id: 4, name: 'Pečivo', icon: 'box', productCount: 3, children: [
//     { id: 12, name: 'Chléb', icon: null, productCount: 1, children: [] },
//     { id: 13, name: 'Rohlíky', icon: null, productCount: 1, children: [] },
//     { id: 14, name: 'Sladké', icon: null, productCount: 1, children: [] },
//   ]},
//   { id: 5, name: 'Nápoje', icon: 'box', productCount: 3, children: [
//     { id: 15, name: 'Alkoholické', icon: null, productCount: 1, children: [] },
//     { id: 16, name: 'Nealkoholické', icon: null, productCount: 1, children: [] },
//     { id: 17, name: 'Káva & Čaj', icon: null, productCount: 1, children: [] },
//   ]},
// ]

// const mockProducts: Product[] = [
//   { id: 1, name: 'Bílé víno', description: 'Moravské bílé víno 0.75l', unit: 'ks', image: null, category: { id: 15, name: 'Alkoholické' }, offers: [{ id: 1, price: '149.9', currency: 'CZK', supplier: { id: 1, name: 'Fresh Foods s.r.o.' }}], bestPrice: '149.9', currency: 'CZK' },
//   { id: 2, name: 'Bílý jogurt', description: 'Bílý jogurt 3% tuku', unit: 'ks', image: null, category: { id: 9, name: 'Jogurty' }, offers: [{ id: 2, price: '19.9', currency: 'CZK', supplier: { id: 1, name: 'Fresh Foods s.r.o.' }}], bestPrice: '19.9', currency: 'CZK' },
//   { id: 3, name: 'Celer', description: 'Bulvový celer', unit: 'kg', image: null, category: { id: 2, name: 'Zelenina' }, offers: [{ id: 3, price: '39.9', currency: 'CZK', supplier: { id: 1, name: 'Fresh Foods s.r.o.' }}], bestPrice: '39.9', currency: 'CZK' },
//   { id: 4, name: 'Celozrnný chléb', description: 'Celozrnný žitný chléb', unit: 'ks', image: null, category: { id: 12, name: 'Chléb' }, offers: [{ id: 4, price: '45', currency: 'CZK', supplier: { id: 1, name: 'Fresh Foods s.r.o.' }}], bestPrice: '45', currency: 'CZK' },
//   { id: 5, name: 'Croissant', description: 'Máslový croissant', unit: 'ks', image: null, category: { id: 14, name: 'Sladké' }, offers: [{ id: 5, price: '29.9', currency: 'CZK', supplier: { id: 1, name: 'Fresh Foods s.r.o.' }}], bestPrice: '29.9', currency: 'CZK' },
//   { id: 6, name: 'Eidam 30%', description: 'Eidam plátky 30% tuku', unit: 'bal', image: null, category: { id: 10, name: 'Sýry' }, offers: [{ id: 6, price: '89.9', currency: 'CZK', supplier: { id: 1, name: 'Fresh Foods s.r.o.' }}], bestPrice: '89.9', currency: 'CZK' },
//   { id: 7, name: 'Hovězí svíčková', description: 'Hovězí svíčková čerstvá', unit: 'kg', image: null, category: { id: 6, name: 'Hovězí' }, offers: [{ id: 7, price: '399', currency: 'CZK', supplier: { id: 2, name: 'Premium Meats a.s.' }}], bestPrice: '399', currency: 'CZK' },
//   { id: 8, name: 'Kuřecí prsa', description: 'Kuřecí prsa bez kosti', unit: 'kg', image: null, category: { id: 8, name: 'Drůbež' }, offers: [{ id: 8, price: '189', currency: 'CZK', supplier: { id: 2, name: 'Premium Meats a.s.' }}], bestPrice: '189', currency: 'CZK' },
//   { id: 9, name: 'Mléko plnotučné', description: 'Mléko 3.5% 1l', unit: 'ks', image: null, category: { id: 11, name: 'Mléko' }, offers: [{ id: 9, price: '29.9', currency: 'CZK', supplier: { id: 6, name: 'Dairy Premium CZ' }}], bestPrice: '29.9', currency: 'CZK' },
//   { id: 10, name: 'Pomerančový džus', description: 'Pomerančový džus 100% 1l', unit: 'ks', image: null, category: { id: 16, name: 'Nealkoholické' }, offers: [{ id: 10, price: '49.9', currency: 'CZK', supplier: { id: 1, name: 'Fresh Foods s.r.o.' }}], bestPrice: '49.9', currency: 'CZK' },
//   { id: 11, name: 'Rajčata', description: 'Rajčata cherry', unit: 'kg', image: null, category: { id: 2, name: 'Zelenina' }, offers: [{ id: 11, price: '79.9', currency: 'CZK', supplier: { id: 1, name: 'Fresh Foods s.r.o.' }}], bestPrice: '79.9', currency: 'CZK' },
//   { id: 12, name: 'Rohlík', description: 'Rohlík klasický', unit: 'ks', image: null, category: { id: 13, name: 'Rohlíky' }, offers: [{ id: 12, price: '3.5', currency: 'CZK', supplier: { id: 1, name: 'Fresh Foods s.r.o.' }}], bestPrice: '3.5', currency: 'CZK' },
//   { id: 13, name: 'Vepřová kýta', description: 'Vepřová kýta bez kosti', unit: 'kg', image: null, category: { id: 7, name: 'Vepřové' }, offers: [{ id: 13, price: '159', currency: 'CZK', supplier: { id: 2, name: 'Premium Meats a.s.' }}], bestPrice: '159', currency: 'CZK' },
//   { id: 14, name: 'Zrnková káva', description: 'Zrnková káva Arabica 1kg', unit: 'ks', image: null, category: { id: 17, name: 'Káva & Čaj' }, offers: [{ id: 14, price: '449', currency: 'CZK', supplier: { id: 1, name: 'Fresh Foods s.r.o.' }}], bestPrice: '449', currency: 'CZK' },
// ]

export default function BuyPage() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [quantities, setQuantities] = useState<Record<number, number>>({})
  const [isCartOpen, setIsCartOpen] = useState(false)
  const { addItem, items, getTotal } = useCartStore()
  const { toast } = useToast()

  // Fetch categories from API with fallback
  const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productsApi.getCategories(),
    retry: 1,
    staleTime: 5 * 60 * 1000,
  })

  // Fetch products from API with fallback
  const { data: productsData, isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['products', selectedCategory, searchQuery],
    queryFn: () => productsApi.list(selectedCategory ?? undefined, searchQuery || undefined),
    retry: 1,
    staleTime: 5 * 60 * 1000,
  })

  // Use API data or fallback to mock data
  const categories = categoriesData?.categories ?? []
  const apiProducts = productsData?.products ?? []

  // Filter products locally when using mock data
  const products = useMemo(() => {
    if (!productsError && productsData) {
      return apiProducts
    }
    
    let filtered = [...apiProducts]

    if (selectedCategory !== null) {
      const getAllCategoryIds = (cats: Category[], targetId: number): number[] => {
        for (const cat of cats) {
          if (cat.id === targetId) {
            const collectChildIds = (c: Category): number[] => {
              let childIds = [c.id]
              for (const child of c.children) {
                childIds = [...childIds, ...collectChildIds(child)]
              }
              return childIds
            }
            return collectChildIds(cat)
          }
          const found = getAllCategoryIds(cat.children, targetId)
          if (found.length > 0) return found
        }
        return []
      }
      
      const categoryIds = getAllCategoryIds(categories, selectedCategory)
      filtered = filtered.filter(p => p.category && categoryIds.includes(p.category.id))
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        (p.description?.toLowerCase().includes(query) ?? false)
      )
    }
    
    return filtered
  }, [apiProducts, productsData, productsError, selectedCategory, searchQuery])

  const toggleCategoryExpand = (categoryId: number) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  const handleCategorySelect = (categoryId: number | null) => {
    setSelectedCategory(categoryId)
  }

  const handleQuantityChange = (productId: number, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) + delta),
    }))
  }

  const handleAddToCart = (product: Product) => {
    const quantity = quantities[product.id] || 1
    const bestOffer = product.offers[0]
    
    if (!bestOffer) {
      toast({
        title: 'Chyba',
        description: 'Tento produkt nemá žádnou nabídku',
        variant: 'destructive',
      })
      return
    }

    const cartItem: CartItem = {
      productOfferId: bestOffer.id,
      quantity,
      unitPrice: bestOffer.price,
      totalPrice: (parseFloat(bestOffer.price) * quantity).toFixed(2),
      currency: bestOffer.currency,
      product: {
        id: product.id,
        name: product.name,
        unit: product.unit,
        image: product.image,
      },
      supplier: bestOffer.supplier,
    }
    
    addItem(cartItem)
    setQuantities(prev => ({ ...prev, [product.id]: 1 }))
    
    toast({
      title: 'Přidáno do košíku',
      description: `${product.name} (${quantity}x) bylo přidáno do košíku`,
    })
  }

  // Get total product count
  const getTotalProductCount = (cats: Category[]): number => {
    return cats.reduce((sum, cat) => {
      return sum + cat.productCount + getTotalProductCount(cat.children)
    }, 0)
  }

  // Render category item with children
  const renderCategory = (category: Category, depth = 0) => {
    const hasChildren = category.children.length > 0
    const isExpanded = expandedCategories.has(category.id)
    const isSelected = selectedCategory === category.id

    return (
      <div key={category.id}>
        <button
          onClick={() => {
            handleCategorySelect(category.id)
            if (hasChildren) {
              toggleCategoryExpand(category.id)
            }
          }}
          className={cn(
            'w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors text-left',
            isSelected
              ? 'bg-secondary/20 text-primary font-medium'
              : 'text-gray-600 hover:bg-gray-100',
            depth > 0 && 'ml-4'
          )}
        >
          {hasChildren ? (
            <ChevronDown 
              className={cn(
                'h-4 w-4 transition-transform flex-shrink-0',
                !isExpanded && '-rotate-90'
              )} 
            />
          ) : (
            <Package className="h-4 w-4 flex-shrink-0" />
          )}
          <span className="flex-1 truncate">{category.name}</span>
          <span className="text-xs text-gray-400">{category.productCount}</span>
        </button>
        {hasChildren && isExpanded && (
          <div className="mt-1">
            {category.children.map(child => renderCategory(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  // Get breadcrumb path
  const getBreadcrumb = (): string => {
    if (!selectedCategory) return 'Všechny produkty'
    
    const findCategory = (cats: Category[], id: number): Category | null => {
      for (const cat of cats) {
        if (cat.id === id) return cat
        const found = findCategory(cat.children, id)
        if (found) return found
      }
      return null
    }
    
    const cat = findCategory(categories, selectedCategory)
    return cat?.name ?? 'Všechny produkty'
  }

  const hasError = categoriesError || productsError

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nakoupit</h1>
        <p className="text-gray-500">Vyberte produkty pro vaši objednávku</p>
      </div>

      {/* Error banner */}
      {hasError && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-yellow-800">Používám demo data</p>
            <p className="text-xs text-yellow-600">API není dostupné. Zobrazuji ukázková data.</p>
          </div>
        </div>
      )}

      <div className="flex gap-6">
        {/* Categories sidebar */}
        <div className="w-64 flex-shrink-0">
          <h3 className="font-semibold text-gray-900 mb-4">Kategorie</h3>
          
          {categoriesLoading && !categoriesError ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="space-y-1">
              {/* All products option */}
              <button
                onClick={() => handleCategorySelect(null)}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors text-left',
                  selectedCategory === null
                    ? 'bg-secondary/20 text-primary font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                <Home className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1">Všechny produkty</span>
                <span className="text-xs text-gray-400">{getTotalProductCount(categories)}</span>
              </button>
              
              {/* Category tree */}
              {categories.map(category => renderCategory(category))}
            </div>
          )}
        </div>

        {/* Products */}
        <div className="flex-1">
          {/* Breadcrumb and search */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Home className="h-4 w-4" />
              <ChevronRight className="h-3 w-3" />
              <span>{getBreadcrumb()}</span>
            </div>
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Hledat produkty..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <span className="text-sm text-gray-500">
              {productsLoading && !productsError ? '...' : `${products.length} produktů`}
            </span>
          </div>

          {/* Product grid */}
          {productsLoading && !productsError ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Žádné produkty nenalezeny</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => {
                const quantity = quantities[product.id] || 1
                const hasOffer = product.offers.length > 0
                
                return (
                  <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-40 bg-gradient-to-br from-secondary/10 to-secondary/5 flex items-center justify-center">
                      <Package className="h-16 w-16 text-primary/30" />
                    </div>
                    <CardContent className="p-4">
                      {product.category && (
                        <Badge variant="outline" className="mb-2 text-xs">
                          {product.category.name}
                        </Badge>
                      )}
                      <h3 className="font-semibold text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-500 mb-1">{product.description}</p>
                      <p className="text-xs text-gray-400 mb-3">{product.unit}</p>
                      
                      {hasOffer ? (
                        <>
                          <p className="text-xl font-bold text-gray-900 mb-4">
                            {formatCurrency(product.bestPrice ?? '0')}
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center border rounded-lg">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9"
                                onClick={() => handleQuantityChange(product.id, -1)}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-10 text-center font-medium">{quantity}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9"
                                onClick={() => handleQuantityChange(product.id, 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <Button
                              className="flex-1 bg-primary hover:bg-primary/90"
                              onClick={() => handleAddToCart(product)}
                            >
                              Přidat
                            </Button>
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-gray-400 italic">Není k dispozici</p>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Cart summary */}
      {items.length > 0 && (
        <div className="fixed bottom-6 right-6 bg-white rounded-xl shadow-lg border p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <ShoppingCart className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{items.length} položek v košíku</p>
            <p className="text-sm text-gray-500">Celkem: {formatCurrency(getTotal())}</p>
          </div>
          <Button className="bg-primary" onClick={() => setIsCartOpen(true)}>
            Vytvořit objednávku
          </Button>
        </div>
      )}

      {/* Cart Modal */}
      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  )
}
