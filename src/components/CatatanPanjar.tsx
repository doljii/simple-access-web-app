import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface CatatanPanjarType {
  id: string;
  tanggal: string;
  nama: string;
  nominal: number;
  status: 'lunas' | 'belum_lunas';
}

const CatatanPanjar = () => {
  const [entries, setEntries] = useState<CatatanPanjarType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    tanggal: '',
    nama: '',
    nominal: '',
    status: ''
  });
  const { user } = useAuth();

  const fetchData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('catatan_panjar')
        .select('*')
        .order('tanggal', { ascending: false });

      if (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load catatan panjar data",
          variant: "destructive"
        });
      } else {
        // Type cast the data to ensure proper typing
        const typedData = (data || []).map(item => ({
          id: item.id,
          tanggal: item.tanggal,
          nama: item.nama,
          nominal: item.nominal,
          status: item.status as 'lunas' | 'belum_lunas'
        }));
        setEntries(typedData);
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
        .from('catatan_panjar')
        .insert([{
          user_id: user.id,
          tanggal: formData.tanggal,
          nama: formData.nama,
          nominal: parseFloat(formData.nominal),
          status: formData.status as 'lunas' | 'belum_lunas'
        }]);

      if (error) {
        console.error('Error inserting data:', error);
        toast({
          title: "Error",
          description: "Failed to add catatan panjar",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Catatan panjar berhasil ditambahkan",
        });
        setFormData({
          tanggal: '',
          nama: '',
          nominal: '',
          status: ''
        });
        fetchData();
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const filteredEntries = entries.filter(entry =>
    entry.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Catatan Panjar
          </CardTitle>
          <CardDescription>
            Kelola catatan panjar dan status pembayaran
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tanggal-panjar">Tanggal</Label>
                <Input
                  id="tanggal-panjar"
                  type="date"
                  value={formData.tanggal}
                  onChange={(e) => handleInputChange('tanggal', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nama-panjar">Nama</Label>
                <Input
                  id="nama-panjar"
                  placeholder="Nama perusahaan/person"
                  value={formData.nama}
                  onChange={(e) => handleInputChange('nama', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nominal-panjar">Nominal Panjar</Label>
                <Input
                  id="nominal-panjar"
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={formData.nominal}
                  onChange={(e) => handleInputChange('nominal', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status-panjar">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lunas">Lunas</SelectItem>
                    <SelectItem value="belum_lunas">Belum Lunas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" className="w-full md:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Catatan
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Catatan Panjar</CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <Input
              placeholder="Cari berdasarkan nama..."
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
                <TableHead>Nama</TableHead>
                <TableHead>Nominal</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{new Date(entry.tanggal).toLocaleDateString('id-ID')}</TableCell>
                  <TableCell className="font-medium">{entry.nama}</TableCell>
                  <TableCell>Rp {entry.nominal.toLocaleString('id-ID')}</TableCell>
                  <TableCell>
                    <Badge variant={entry.status === 'lunas' ? 'default' : 'destructive'}>
                      {entry.status === 'lunas' ? 'Lunas' : 'Belum Lunas'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {filteredEntries.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    {searchTerm ? 'No entries found matching your search.' : 'No entries available.'}
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

export default CatatanPanjar;
