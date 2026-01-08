import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Palette,
  Building2,
  Users,
  Tag,
  GitBranch,
  Bell,
  Shield,
  Upload,
  Check,
  Plus,
  Edit,
  Save,
  X,
  Loader2,
  MapPin,
  User as UserIcon,
  Mail,
} from 'lucide-react'
import { cn, applyColorScheme, loadColorScheme } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { settingsApi, branchesApi } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'

const colorSchemes = [
  { id: 'orea-original', name: 'Orea Original', primary: '#2D4739', secondary: '#C9A227' },
  { id: 'ocean-blue', name: 'Ocean Blue', primary: '#1E40AF', secondary: '#A78BFA' },
  { id: 'royal-purple', name: 'Royal Purple', primary: '#7C3AED', secondary: '#F472B6' },
  { id: 'warm-terra', name: 'Warm Terra', primary: '#B45309', secondary: '#FBBF24' },
  { id: 'modern-gray', name: 'Modern Gray', primary: '#374151', secondary: '#F59E0B' },
  { id: 'fresh-mint', name: 'Fresh Mint', primary: '#059669', secondary: '#FBBF24' },
]

const tabs = [
  { id: 'branding', label: 'Branding', icon: Palette, public: true },
  { id: 'organization', label: 'Organizace', icon: Building2, public: false },
  { id: 'users', label: 'Uživatelé', icon: Users, public: false },
  { id: 'categories', label: 'Kategorie', icon: Tag, public: false },
  { id: 'workflow', label: 'Workflow', icon: GitBranch, public: false },
  { id: 'notifications', label: 'Notifikace', icon: Bell, public: true },
  { id: 'security', label: 'Zabezpečení', icon: Shield, public: true },
]

export default function SettingsPage() {
  const { user } = useAuthStore()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const isAdmin = user?.roles.includes('ROLE_ADMIN')

  // Fetch branding settings from API
  const { data: brandingData } = useQuery({
    queryKey: ['settings', 'branding'],
    queryFn: () => settingsApi.getBranding(),
  })

  // Initialize colors from saved data or API
  const savedColors = loadColorScheme()
  const defaultPrimary = brandingData?.primaryColor || savedColors?.primaryColor || '#2D4739'
  const defaultSecondary = brandingData?.secondaryColor || savedColors?.secondaryColor || '#C9A227'

  const [selectedScheme, setSelectedScheme] = useState<string | null>(null)
  const [primaryColor, setPrimaryColor] = useState(defaultPrimary)
  const [secondaryColor, setSecondaryColor] = useState(defaultSecondary)
  const [domain, setDomain] = useState(brandingData?.domain || 'procure.orea.cz')
  const [originalDomain, setOriginalDomain] = useState(brandingData?.domain || 'procure.orea.cz')

  // Update domain and originalDomain when brandingData is loaded
  useEffect(() => {
    if (brandingData?.domain !== undefined) {
      setDomain(brandingData.domain || '')
      setOriginalDomain(brandingData.domain || '')
    }
  }, [brandingData?.domain])

  // Apply colors on mount
  useEffect(() => {
    applyColorScheme(primaryColor, secondaryColor)
  }, [])

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: { primaryColor?: string; secondaryColor?: string; name?: string; domain?: string }) =>
      settingsApi.updateBranding(data),
    onSuccess: () => {
      toast({
        title: 'Nastavení uloženo',
        description: 'Barevné schéma bylo úspěšně aktualizováno.',
      })
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    },
    onError: (error: Error) => {
      toast({
        title: 'Chyba',
        description: error.message || 'Nepodařilo se uložit nastavení',
        variant: 'destructive',
      })
    },
  })

  const handleSchemeSelect = (schemeId: string) => {
    const scheme = colorSchemes.find(s => s.id === schemeId)
    if (scheme) {
      setSelectedScheme(schemeId)
      setPrimaryColor(scheme.primary)
      setSecondaryColor(scheme.secondary)
      
      // Apply colors immediately
      applyColorScheme(scheme.primary, scheme.secondary)
      
      // Save to API if admin
      if (isAdmin) {
        updateMutation.mutate({
          primaryColor: scheme.primary,
          secondaryColor: scheme.secondary,
        })
      }
    }
  }

  const handlePrimaryColorChange = (color: string) => {
    setPrimaryColor(color)
    setSelectedScheme(null) // Clear scheme selection when using custom colors
    applyColorScheme(color, secondaryColor)
    
    // Save to API if admin
    if (isAdmin) {
      updateMutation.mutate({ primaryColor: color })
    }
  }

  const handleSecondaryColorChange = (color: string) => {
    setSecondaryColor(color)
    setSelectedScheme(null) // Clear scheme selection when using custom colors
    applyColorScheme(primaryColor, color)
    
    // Save to API if admin
    if (isAdmin) {
      updateMutation.mutate({ secondaryColor: color })
    }
  }

  const handleDomainBlur = () => {
    // Only save if domain has changed and user is admin
    if (isAdmin && domain !== originalDomain) {
      updateMutation.mutate(
        { domain: domain || null },
        {
          onSuccess: () => {
            // Update originalDomain after successful save
            setOriginalDomain(domain)
            toast({
              title: 'Doména uložena',
              description: 'Vlastní doména byla úspěšně aktualizována.',
            })
          },
        }
      )
    }
  }

  // Find which scheme matches current colors
  useEffect(() => {
    const matchingScheme = colorSchemes.find(
      s => s.primary === primaryColor && s.secondary === secondaryColor
    )
    if (matchingScheme) {
      setSelectedScheme(matchingScheme.id)
    } else {
      setSelectedScheme(null)
    }
  }, [primaryColor, secondaryColor])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nastavení</h1>
        <p className="text-gray-500">Konfigurace platformy</p>
      </div>

      <Tabs defaultValue="branding" className="space-y-6">
        <TabsList className="bg-transparent border-b border-gray-200 rounded-none p-0 h-auto gap-6">
          {tabs.map((tab) => {
            if (!isAdmin && !tab.public) return null

            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3 px-0 gap-2"
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </TabsTrigger>
            )
          })}
        </TabsList>

        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Nastavení vzhledu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo and App Name */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo společnosti
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-2xl font-bold text-gray-400">
                      P
                    </div>
                    <Button variant="outline" className="gap-2" disabled>
                      <Upload className="h-4 w-4" /> Nahrát logo
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">PNG, JPG, SVG do 2 MB</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vlastní doména
                  </label>
                  <Input
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      onBlur={handleDomainBlur}
                      disabled={!isAdmin}
                      placeholder="procure.orea.cz"
                  />
                </div>
              </div>

              {/* Color Schemes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Barevná schémata
                </label>
                <div className="grid grid-cols-6 gap-3">
                  {colorSchemes.map((scheme) => (
                    <button
                      key={scheme.id}
                      onClick={() => handleSchemeSelect(scheme.id)}
                      className={cn(
                        'relative p-4 rounded-lg border-2 transition-all text-center',
                        selectedScheme === scheme.id
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <div className="flex justify-center gap-2 mb-2">
                        <div
                          className="h-8 w-8 rounded-lg"
                          style={{ backgroundColor: scheme.primary }}
                        />
                        <div
                          className="h-8 w-8 rounded-lg"
                          style={{ backgroundColor: scheme.secondary }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-700">{scheme.name}</span>
                      {selectedScheme === scheme.id && (
                        <div className="absolute top-2 right-2">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Colors */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Nebo zvolte vlastní barvy
                </label>
                <div className="flex items-center gap-6">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Primární</label>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-10 w-10 rounded-lg border"
                        style={{ backgroundColor: primaryColor }}
                      />
                      <Input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => handlePrimaryColorChange(e.target.value)}
                        className="w-28 h-10 p-1 cursor-pointer"
                        disabled={!isAdmin}
                      />
                      <Input
                        type="text"
                        value={primaryColor}
                        onChange={(e) => handlePrimaryColorChange(e.target.value)}
                        className="w-28"
                        placeholder="#2D4739"
                        disabled={!isAdmin}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Sekundární</label>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-10 w-10 rounded-lg border"
                        style={{ backgroundColor: secondaryColor }}
                      />
                      <Input
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => handleSecondaryColorChange(e.target.value)}
                        className="w-28 h-10 p-1 cursor-pointer"
                        disabled={!isAdmin}
                      />
                      <Input
                        type="text"
                        value={secondaryColor}
                        onChange={(e) => handleSecondaryColorChange(e.target.value)}
                        className="w-28"
                        placeholder="#C9A227"
                        disabled={!isAdmin}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Organization tab */}
        <TabsContent value="organization" className="space-y-6">
          <OrganizationTabContent />
        </TabsContent>

        {/* Security tab */}
        <TabsContent value="security" className="space-y-6">
          <SecurityTabContent />
        </TabsContent>

        {/* Users tab */}
        <TabsContent value="users" className="space-y-6">
          <UsersTabContent />
        </TabsContent>

        {/* Other tabs - placeholder content */}
        {tabs.filter(tab => tab.id !== 'branding' && tab.id !== 'organization' && tab.id !== 'security' && tab.id !== 'users').map((tab) => (
          <TabsContent key={tab.id} value={tab.id}>
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <tab.icon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nastavení {tab.label.toLowerCase()} bude brzy k dispozici</p>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

// Organization Tab Content Component
function OrganizationTabContent() {
  const { user } = useAuthStore()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const isAdmin = user?.roles.includes('ROLE_ADMIN')

  const [isAddingBranch, setIsAddingBranch] = useState(false)
  const [newBranchName, setNewBranchName] = useState('')
  const [newBranchAddress, setNewBranchAddress] = useState('')
  const [editingBranchId, setEditingBranchId] = useState<number | null>(null)
  const [editingBranchName, setEditingBranchName] = useState('')
  const [editingBranchAddress, setEditingBranchAddress] = useState('')

  // Fetch organization and branches
  const { data: orgData, isLoading } = useQuery({
    queryKey: ['settings', 'organization'],
    queryFn: () => settingsApi.getOrganization(),
  })

  const organization = orgData?.organization
  const branches = orgData?.branches ?? []

  // Create branch mutation
  const createBranchMutation = useMutation({
    mutationFn: (data: { name: string; address?: string }) =>
      branchesApi.create(data),
    onSuccess: () => {
      toast({
        title: 'Pobočka přidána',
        description: 'Nová pobočka byla úspěšně přidána.',
      })
      queryClient.invalidateQueries({ queryKey: ['settings', 'organization'] })
      setIsAddingBranch(false)
      setNewBranchName('')
      setNewBranchAddress('')
    },
    onError: (error: Error) => {
      toast({
        title: 'Chyba',
        description: error.message || 'Nepodařilo se přidat pobočku',
        variant: 'destructive',
      })
    },
  })

  // Update branch mutation
  const updateBranchMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name?: string; address?: string } }) =>
      branchesApi.update(id, data),
    onSuccess: () => {
      toast({
        title: 'Pobočka aktualizována',
        description: 'Pobočka byla úspěšně aktualizována.',
      })
      queryClient.invalidateQueries({ queryKey: ['settings', 'organization'] })
      setEditingBranchId(null)
      setEditingBranchName('')
      setEditingBranchAddress('')
    },
    onError: (error: Error) => {
      toast({
        title: 'Chyba',
        description: error.message || 'Nepodařilo se aktualizovat pobočku',
        variant: 'destructive',
      })
    },
  })

  const handleAddBranch = () => {
    if (!newBranchName.trim()) {
      toast({
        title: 'Chyba',
        description: 'Název pobočky je povinný.',
        variant: 'destructive',
      })
      return
    }

    createBranchMutation.mutate({
      name: newBranchName.trim(),
      address: newBranchAddress.trim() || undefined,
    })
  }

  const handleStartEdit = (branch: { id: number; name: string; address: string | null }) => {
    setEditingBranchId(branch.id)
    setEditingBranchName(branch.name)
    setEditingBranchAddress(branch.address || '')
  }

  const handleSaveEdit = () => {
    if (!editingBranchId) return

    if (!editingBranchName.trim()) {
      toast({
        title: 'Chyba',
        description: 'Název pobočky je povinný.',
        variant: 'destructive',
      })
      return
    }

    updateBranchMutation.mutate({
      id: editingBranchId,
      data: {
        name: editingBranchName.trim(),
        address: editingBranchAddress.trim() || undefined,
      },
    })
  }

  const handleCancelEdit = () => {
    setEditingBranchId(null)
    setEditingBranchName('')
    setEditingBranchAddress('')
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
      {/* Organization Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Organizace</CardTitle>
        </CardHeader>
        <CardContent>
          {organization ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Název</label>
                <p className="text-gray-900">{organization.name}</p>
              </div>
              {organization.domain && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Doména</label>
                  <p className="text-gray-900">{organization.domain}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vytvořeno</label>
                <p className="text-gray-900">
                  {new Date(organization.createdAt).toLocaleDateString('cs-CZ')}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Organizace nenalezena</p>
          )}
        </CardContent>
      </Card>

      {/* Branches */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Pobočky</CardTitle>
          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setIsAddingBranch(true)}
            >
              <Plus className="h-4 w-4" /> Přidat pobočku
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add new branch form */}
          {isAddingBranch && (
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Název pobočky <span className="text-red-500">*</span>
                </label>
                <Input
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  placeholder="Např. Hotel Orea Palace"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresa</label>
                <Input
                  value={newBranchAddress}
                  onChange={(e) => setNewBranchAddress(e.target.value)}
                  placeholder="Např. Václavské náměstí 773, Praha 1"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleAddBranch}
                  disabled={createBranchMutation.isPending}
                  className="bg-primary"
                >
                  {createBranchMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Ukládám...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Uložit
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsAddingBranch(false)
                    setNewBranchName('')
                    setNewBranchAddress('')
                  }}
                  disabled={createBranchMutation.isPending}
                >
                  <X className="h-4 w-4 mr-2" />
                  Zrušit
                </Button>
              </div>
            </div>
          )}

          {/* Branches list */}
          {branches.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Žádné pobočky</p>
            </div>
          ) : (
            <div className="space-y-3">
              {branches.map((branch) => (
                <div
                  key={branch.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {editingBranchId === branch.id ? (
                    // Edit mode
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Název pobočky <span className="text-red-500">*</span>
                        </label>
                        <Input
                          value={editingBranchName}
                          onChange={(e) => setEditingBranchName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Adresa</label>
                        <Input
                          value={editingBranchAddress}
                          onChange={(e) => setEditingBranchAddress(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleSaveEdit}
                          disabled={updateBranchMutation.isPending}
                          className="bg-primary"
                        >
                          {updateBranchMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Ukládám...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Uložit
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancelEdit}
                          disabled={updateBranchMutation.isPending}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Zrušit
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          <h3 className="font-medium text-gray-900">{branch.name}</h3>
                        </div>
                        {branch.address && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-3 w-3" />
                            <span>{branch.address}</span>
                          </div>
                        )}
                      </div>
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleStartEdit(branch)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Security Tab Content Component
function SecurityTabContent() {
  const { toast } = useToast()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      settingsApi.updatePassword(data),
    onSuccess: () => {
      toast({
        title: 'Heslo změněno',
        description: 'Vaše heslo bylo úspěšně změněno.',
      })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    },
    onError: (error: Error) => {
      toast({
        title: 'Chyba',
        description: error.message || 'Nepodařilo se změnit heslo',
        variant: 'destructive',
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!currentPassword) {
      toast({
        title: 'Chyba',
        description: 'Zadejte prosím stávající heslo.',
        variant: 'destructive',
      })
      return
    }

    if (!newPassword) {
      toast({
        title: 'Chyba',
        description: 'Zadejte prosím nové heslo.',
        variant: 'destructive',
      })
      return
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Chyba',
        description: 'Nové heslo musí mít alespoň 6 znaků.',
        variant: 'destructive',
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Chyba',
        description: 'Nová hesla se neshodují.',
        variant: 'destructive',
      })
      return
    }

    if (currentPassword === newPassword) {
      toast({
        title: 'Chyba',
        description: 'Nové heslo musí být jiné než stávající heslo.',
        variant: 'destructive',
      })
      return
    }

    updatePasswordMutation.mutate({
      currentPassword,
      newPassword,
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Změna hesla</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stávající heslo <span className="text-red-500">*</span>
              </label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Zadejte stávající heslo"
                disabled={updatePasswordMutation.isPending}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nové heslo <span className="text-red-500">*</span>
              </label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Zadejte nové heslo (min. 6 znaků)"
                disabled={updatePasswordMutation.isPending}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Potvrzení nového hesla <span className="text-red-500">*</span>
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Zadejte nové heslo znovu"
                disabled={updatePasswordMutation.isPending}
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={updatePasswordMutation.isPending}
                className="bg-primary"
              >
                {updatePasswordMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Ukládám...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Uložit
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

// Users Tab Content Component
function UsersTabContent() {
  const { user } = useAuthStore()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Check if user is logged in
  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Musíte být přihlášeni pro zobrazení uživatelů</p>
      </div>
    )
  }

  // Fetch users
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['settings', 'users'],
    queryFn: () => settingsApi.getUsers(),
  })

  const users = usersData?.users ?? []

  // Update user roles mutation
  const updateRolesMutation = useMutation({
    mutationFn: ({ userId, roles }: { userId: number; roles: string[] }) =>
      settingsApi.updateUserRoles(userId, roles),
    onSuccess: () => {
      toast({
        title: 'Role aktualizovány',
        description: 'Role uživatele byly úspěšně aktualizovány.',
      })
      queryClient.invalidateQueries({ queryKey: ['settings', 'users'] })
    },
    onError: (error: Error) => {
      toast({
        title: 'Chyba',
        description: error.message || 'Nepodařilo se aktualizovat role',
        variant: 'destructive',
      })
    },
  })

  const handleRoleChange = (userId: number, newRoles: string[]) => {
    // Filter out ROLE_USER as it's automatically added
    const rolesToSave = newRoles.filter(role => role !== 'ROLE_USER')
    updateRolesMutation.mutate({ userId, roles: rolesToSave })
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
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Uživatelé</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Žádní uživatelé</p>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((userItem) => {
                const isCurrentUser = userItem.id === user?.id
                // Filter out ROLE_USER for display/editing (it's always present)
                const editableRoles = userItem.roles.filter(role => role !== 'ROLE_USER')
                const currentRole = editableRoles.length > 0 ? editableRoles[0] : 'ROLE_USER'

                return (
                  <div
                    key={userItem.id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                          {userItem.avatar ? (
                            <img
                              src={userItem.avatar}
                              alt={userItem.name}
                              className="h-10 w-10 rounded-full"
                            />
                          ) : (
                            <UserIcon className="h-5 w-5 text-gray-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-gray-900">{userItem.name}</h3>
                            {isCurrentUser && (
                              <Badge variant="secondary" className="text-xs">
                                Vy
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <Mail className="h-3 w-3" />
                            <span>{userItem.email}</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {userItem.roles.map((role) => (
                              <Badge
                                key={role}
                                className={cn(
                                  'text-xs',
                                  role === 'ROLE_ADMIN'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-gray-100 text-gray-700'
                                )}
                              >
                                {role === 'ROLE_ADMIN' ? 'Administrátor' : 'Uživatel'}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      {!isCurrentUser && (
                        <div className="flex items-center gap-2">
                          <Select
                            value={currentRole}
                            onValueChange={(value) => {
                              const newRoles = value === 'ROLE_USER' ? [] : [value]
                              handleRoleChange(userItem.id, newRoles)
                            }}
                            disabled={updateRolesMutation.isPending}
                          >
                            <SelectTrigger className="w-48">
                              <SelectValue placeholder="Vyberte roli" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ROLE_USER">Uživatel</SelectItem>
                              <SelectItem value="ROLE_ADMIN">Administrátor</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      {isCurrentUser && (
                        <div className="text-sm text-gray-500 italic">
                          Nelze upravit vlastní role
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
