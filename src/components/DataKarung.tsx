
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, Plus, Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface DataKarungType {
  id: string;
  tanggal: string;
  nomor: string;
  nama: string;
  bruto: number;
  quantity: number;
  kadar_air: number;
  netto: number;
  harga: number;
}

const DataKarung = () => {
  const [karungData, setKarungData] = useState<DataKarungType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    tanggal: '',
    nomor: '',
    nama: '',
    bruto: '',
    quantity: '',
    kadar_air: '',
    netto: '',
    harga: ''
  });
  const { user } = useAuth();

  const fetchData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('data_karung')
        .select('*')
        .order('tanggal', { ascending: false });

      if (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load data karung",
          variant: "destructive"
        });
      } else {
        setKarungData(data || []);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('data_karung')
        .insert([{
          user_id: user.id,
          tanggal: formData.tanggal,
          nomor: formData.nomor,
          nama: formData.nama,
          bruto: parseFloat(formData.bruto),
          quantity: parseInt(formData.quantity),
          kadar_air: parseFloat(formData.kadar_air),
          netto: parseFloat(formData.netto),
          harga: parseFloat(formData.harga)
        }]);

      if (error) {
        console.error('Error inserting data:', error);
        toast({
          title: "Error",
          description: "Failed to add data karung",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Data karung berhasil ditambahkan",
        });
        setFormData({
          tanggal: '',
          nomor: '',
          nama: '',
          bruto: '',
          quantity: '',
          kadar_air: '',
          netto: '',
          harga: ''
        });
        fetchData();
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const filteredData = karungData.filter(item =>
    item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.nomor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Data Karung Masuk
          </CardTitle>
          <CardDescription>
            Pencatatan data karung yang masuk dengan detail lengkap
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tanggal-karung">Tanggal</Label>
                <Input
                  id="tanggal-karung"
                  type="date"
                  value={formData.tanggal}
                  onChange={(e) => handleInputChange('tanggal', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nomor-karung">Nomor</Label>
                <Input
                  id="nomor-karung"
                  placeholder="Nomor karung"
                  value={formData.nomor}
                  onChange={(e) => handleInputChange('nomor', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nama-karung">Nama</Label>
                <Input
                  id="nama-karung"
                  placeholder="Nama supplier"
                  value={formData.nama}
                  onChange={(e) => handleInputChange('nama', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bruto">Bruto (kg)</Label>
                <Input
                  id="bruto"
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={formData.bruto}
                  onChange={(e) => handleInputChange('bruto', e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity Karung</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="0"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kadar-air">Kadar Air (%)</Label>
                <Input
                  id="kadar-air"
                  type="number"
                  step="0.01"
                  placeholder="0.0"
                  value={formData.kadar_air}
                  onChange={(e) => handleInputChange('kadar_air', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="netto">Netto (kg)</Label>
                <Input
                  id="netto"
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={formData.netto}
                  onChange={(e) => handleInputChange('netto', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="harga">Harga</Label>
                <Input
                  id="harga"
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={formData.harga}
                  onChange={(e) => handleInputChange('harga', e.target.value)}
                  required
                />
              </div>
            </div>
            
            <Button type="submit" className="w-full md:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Data Karung
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Data Karung</CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <Input
              placeholder="Cari berdasarkan nama atau nomor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Nomor</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Bruto (kg)</TableHead>
                  <TableHead>Qty Karung</TableHead>
                  <TableHead>Kadar Air (%)</TableHead>
                  <TableHead>Netto (kg)</TableHead>
                  <TableHead>Harga</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{new Date(item.tanggal).toLocaleDateString('id-ID')}</TableCell>
                    <TableCell className="font-medium">{item.nomor}</TableCell>
                    <TableCell>{item.nama}</TableCell>
                    <TableCell>{item.bruto}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.kadar_air}%</TableCell>
                    <TableCell>{item.netto}</TableCell>
                    <TableCell>Rp {item.harga.toLocaleString('id-ID')}</TableCell>
                  </TableRow>
                ))}
                {filteredData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      {searchTerm ? 'No data found matching your search.' : 'No data available.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataKarung;
