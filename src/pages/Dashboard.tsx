
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, DollarSign, Package, FileText, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import CatatanPanjar from '@/components/CatatanPanjar';
import KasKecil from '@/components/KasKecil';
import KasBesar from '@/components/KasBesar';
import DataKarung from '@/components/DataKarung';

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  useEffect(() => {
    if (!user) {
      console.log('No user found, redirecting to login');
      navigate('/');
      return;
    }
    console.log('Dashboard loaded for user:', user.email, 'role:', user.role);
    setLoading(false);
  }, [user, navigate]);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut();
      toast({
        title: "Logout berhasil",
        description: "Anda telah keluar dari sistem",
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout error",
        description: "Terjadi kesalahan saat logout",
        variant: "destructive",
      });
    }
    // Navigation will be handled by the auth provider
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div>Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">Please log in to access the dashboard</div>
          <Button onClick={() => navigate('/')}>Go to Login</Button>
        </div>
      </div>
    );
  }

  // Use user data with fallbacks and better handling
  const userName = user.name || user.email?.split('@')[0] || 'User';
  const userRole = user.role || 'panjar';
  const userEmail = user.email || 'No email';

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'panjar': return 'Panjar';
      case 'karung': return 'Karung';
      case 'admin': return 'Admin';
      default: return role.toUpperCase();
    }
  };

  const renderUserContent = () => {
    switch (userRole) {
      case 'panjar':
        return (
          <Tabs defaultValue="panjar" className="w-full">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="panjar" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Catatan Panjar
              </TabsTrigger>
              <TabsTrigger value="kas-kecil" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Kas Kecil
              </TabsTrigger>
              <TabsTrigger value="kas-besar" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Kas Besar
              </TabsTrigger>
            </TabsList>
            <TabsContent value="panjar">
              <CatatanPanjar />
            </TabsContent>
            <TabsContent value="kas-kecil">
              <KasKecil />
            </TabsContent>
            <TabsContent value="kas-besar">
              <KasBesar />
            </TabsContent>
          </Tabs>
        );
      
      case 'karung':
        return (
          <div className="w-full">
            <DataKarung />
          </div>
        );
      
      case 'admin':
        return (
          <Tabs defaultValue="panjar" className="w-full">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="panjar" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Catatan Panjar
              </TabsTrigger>
              <TabsTrigger value="kas-kecil" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Kas Kecil
              </TabsTrigger>
              <TabsTrigger value="kas-besar" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Kas Besar
              </TabsTrigger>
              <TabsTrigger value="data-karung" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Data Karung
              </TabsTrigger>
            </TabsList>
            <TabsContent value="panjar">
              <CatatanPanjar />
            </TabsContent>
            <TabsContent value="kas-kecil">
              <KasKecil />
            </TabsContent>
            <TabsContent value="kas-besar">
              <KasBesar />
            </TabsContent>
            <TabsContent value="data-karung">
              <DataKarung />
            </TabsContent>
          </Tabs>
        );
      
      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-600">Role tidak dikenali: {userRole}</p>
            <p className="text-sm text-gray-500 mt-2">Silakan hubungi admin untuk memperbaiki role Anda.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-600">
                  Selamat datang, {userName} ({getRoleDisplayName(userRole)})
                </p>
                <p className="text-xs text-gray-500">{userEmail}</p>
              </div>
            </div>
            <Button 
              onClick={handleLogout} 
              variant="outline" 
              className="flex items-center gap-2"
              disabled={loading}
            >
              <LogOut className="h-4 w-4" />
              {loading ? 'Signing out...' : 'Logout'}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {userRole === 'admin' ? 'Panel Admin - Semua Fitur' : 
               userRole === 'panjar' ? 'Panel User - Fitur Keuangan' :
               'Panel User - Data Karung'}
            </CardTitle>
            <CardDescription>
              Role: {getRoleDisplayName(userRole)} | 
              Akses: {userRole === 'admin' ? 'Semua fitur' : 
                     userRole === 'panjar' ? 'Panjar, Kas Kecil, Kas Besar' : 
                     'Data Karung'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderUserContent()}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
