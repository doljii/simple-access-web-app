
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Wallet, Plus, TrendingUp, TrendingDown, Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface KasKecilType {
  id: string;
  tanggal: string;
  keterangan: string;
  tipe: 'masuk' | 'keluar';
  nominal: number;
}

const KasKecil = () => {
  const [transactions, setTransactions] = useState<KasKecilType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    tanggal: '',
    keterangan: '',
    tipe: '',
    nominal: ''
  });
  const { user } = useAuth();

  const fetchData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('kas_kecil')
        .select('*')
        .order('tanggal', { ascending: false });

      if (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load kas kecil data",
          variant: "destructive"
        });
      } else {
        setTransactions(data || []);
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
        .from('kas_kecil')
        .insert([{
          user_id: user.id,
          tanggal: formData.tanggal,
          keterangan: formData.keterangan,
          tipe: formData.tipe as 'masuk' | 'keluar',
          nominal: parseFloat(formData.nominal)
        }]);

      if (error) {
        console.error('Error inserting data:', error);
        toast({
          title: "Error",
          description: "Failed to add transaction",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Transaksi berhasil ditambahkan",
        });
        setFormData({
          tanggal: '',
          keterangan: '',
          tipe: '',
          nominal: ''
        });
        fetchData();
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const filteredTransactions = transactions.filter(transaction =>
    transaction.keterangan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalMasuk = transactions.filter(t => t.tipe === 'masuk').reduce((sum, t) => sum + t.nominal, 0);
  const totalKeluar = transactions.filter(t => t.tipe === 'keluar').reduce((sum, t) => sum + t.nominal, 0);
  const saldo = totalMasuk - totalKeluar;

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Masuk</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              Rp {totalMasuk.toLocaleString('id-ID')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Keluar</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              Rp {totalKeluar.toLocaleString('id-ID')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${saldo >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              Rp {saldo.toLocaleString('id-ID')}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Kas Kecil
          </CardTitle>
          <CardDescription>
            Pencatatan pemasukan dan pengeluaran kas kecil
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tanggal-kas-kecil">Tanggal</Label>
                <Input
                  id="tanggal-kas-kecil"
                  type="date"
                  value={formData.tanggal}
                  onChange={(e) => handleInputChange('tanggal', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="keterangan-kas-kecil">Keterangan</Label>
                <Input
                  id="keterangan-kas-kecil"
                  placeholder="Deskripsi transaksi"
                  value={formData.keterangan}
                  onChange={(e) => handleInputChange('keterangan', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipe-kas-kecil">Tipe</Label>
                <Select value={formData.tipe} onValueChange={(value) => handleInputChange('tipe', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tipe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masuk">Pemasukan</SelectItem>
                    <SelectItem value="keluar">Pengeluaran</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nominal-kas-kecil">Nominal</Label>
                <Input
                  id="nominal-kas-kecil"
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={formData.nominal}
                  onChange={(e) => handleInputChange('nominal', e.target.value)}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full md:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Transaksi
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Transaksi Kas Kecil</CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <Input
              placeholder="Cari berdasarkan keterangan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Keterangan</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Nominal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{new Date(transaction.tanggal).toLocaleDateString('id-ID')}</TableCell>
                  <TableCell className="font-medium">{transaction.keterangan}</TableCell>
                  <TableCell>
                    <Badge variant={transaction.tipe === 'masuk' ? 'default' : 'destructive'}>
                      {transaction.tipe === 'masuk' ? 'Masuk' : 'Keluar'}
                    </Badge>
                  </TableCell>
                  <TableCell className={transaction.tipe === 'masuk' ? 'text-green-600' : 'text-red-600'}>
                    Rp {transaction.nominal.toLocaleString('id-ID')}
                  </TableCell>
                </TableRow>
              ))}
              {filteredTransactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    {searchTerm ? 'No transactions found matching your search.' : 'No transactions available.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default KasKecil;
