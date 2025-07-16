
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus } from 'lucide-react';

const CatatanPanjar = () => {
  const [entries, setEntries] = useState([
    { id: 1, nama: 'PT. ABC', nominal: 5000000, status: 'lunas', tanggal: '2024-01-15' },
    { id: 2, nama: 'CV. XYZ', nominal: 3000000, status: 'belum_lunas', tanggal: '2024-01-16' }
  ]);

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
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nama">Nama</Label>
              <Input id="nama" placeholder="Nama perusahaan/person" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nominal">Nominal Panjar</Label>
              <Input id="nominal" type="number" placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lunas">Lunas</SelectItem>
                  <SelectItem value="belum_lunas">Belum Lunas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tanggal">Tanggal</Label>
              <Input id="tanggal" type="date" />
            </div>
          </div>
          <Button className="w-full md:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Catatan
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Catatan Panjar</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Nominal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">{entry.nama}</TableCell>
                  <TableCell>Rp {entry.nominal.toLocaleString('id-ID')}</TableCell>
                  <TableCell>
                    <Badge variant={entry.status === 'lunas' ? 'default' : 'destructive'}>
                      {entry.status === 'lunas' ? 'Lunas' : 'Belum Lunas'}
                    </Badge>
                  </TableCell>
                  <TableCell>{entry.tanggal}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CatatanPanjar;
