
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, Plus } from 'lucide-react';

const DataKarung = () => {
  const karungData = [
    {
      id: 1,
      tanggal: '2024-01-15',
      nomor: 'KRG001',
      nama: 'Supplier A',
      bruto: 1000,
      quantity: 10,
      kadar_air: 12.5,
      netto: 875,
      harga: 5000
    },
    {
      id: 2,
      tanggal: '2024-01-16',
      nomor: 'KRG002',
      nama: 'Supplier B',
      bruto: 800,
      quantity: 8,
      kadar_air: 10.2,
      netto: 718,
      harga: 4800
    }
  ];

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
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tanggal-karung">Tanggal</Label>
              <Input id="tanggal-karung" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nomor-karung">Nomor</Label>
              <Input id="nomor-karung" placeholder="Nomor karung" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nama-karung">Nama</Label>
              <Input id="nama-karung" placeholder="Nama supplier" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bruto">Bruto (kg)</Label>
              <Input id="bruto" type="number" placeholder="0" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity Karung</Label>
              <Input id="quantity" type="number" placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kadar-air">Kadar Air (%)</Label>
              <Input id="kadar-air" type="number" step="0.1" placeholder="0.0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="netto">Netto (kg)</Label>
              <Input id="netto" type="number" placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="harga">Harga</Label>
              <Input id="harga" type="number" placeholder="0" />
            </div>
          </div>
          
          <Button className="w-full md:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Data Karung
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Data Karung</CardTitle>
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
                {karungData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.tanggal}</TableCell>
                    <TableCell className="font-medium">{item.nomor}</TableCell>
                    <TableCell>{item.nama}</TableCell>
                    <TableCell>{item.bruto}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.kadar_air}%</TableCell>
                    <TableCell>{item.netto}</TableCell>
                    <TableCell>Rp {item.harga.toLocaleString('id-ID')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataKarung;
