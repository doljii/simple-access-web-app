
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, DollarSign, Package, FileText, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import CatatanPanjar from '@/components/CatatanPanjar';
import KasKecil from '@/components/KasKecil';
import KasBesar from '@/components/KasBesar';
import DataKarung from '@/components/DataKarung';

interface UserProfile {
  id: string;
  username: string;
  name: string;
  role: 'panjar' | 'karung' | 'admin';
}

const Dashboard = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const fetchUserProfile = async () => {
      try {
        console.log('Fetching profile for user:', user.id);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          toast({
            title: "Error",
            description: "Failed to load user profile",
            variant: "destructive"
          });
        } else {
          console.log('Profile loaded:', data);
          setUserProfile(data);
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user, navigate]);

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Logout berhasil",
      description: "Anda telah keluar dari sistem",
    });
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Failed to load user profile</div>
      </div>
    );
  }

  const renderUserContent = () => {
    switch (userProfile.role) {
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
        return <div>Role tidak dikenali</div>;
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
                <p className="text-sm text-gray-600">Selamat datang, {userProfile.name}</p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {userProfile.role === 'admin' ? 'Panel Admin - Semua Fitur' : 
               userProfile.role === 'panjar' ? 'Panel User - Fitur Keuangan' :
               'Panel User - Data Karung'}
            </CardTitle>
            <CardDescription>
              Role: {userProfile.role.toUpperCase()} | 
              Akses: {userProfile.role === 'admin' ? 'Semua fitur' : 
                     userProfile.role === 'panjar' ? 'Panjar, Kas Kecil, Kas Besar' : 
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
