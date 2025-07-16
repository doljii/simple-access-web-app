
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Wallet, Plus, TrendingUp, TrendingDown } from 'lucide-react';

const KasKecil = () => {
  const transactions = [
    { id: 1, tanggal: '2024-01-15', keterangan: 'Pembelian ATK', tipe: 'keluar', nominal: 150000 },
    { id: 2, tanggal: '2024-01-16', keterangan: 'Dana operasional', tipe: 'masuk', nominal: 500000 },
    { id: 3, tanggal: '2024-01-17', keterangan: 'Transport', tipe: 'keluar', nominal: 75000 }
  ];

  const totalMasuk = transactions.filter(t => t.tipe === 'masuk').reduce((sum, t) => sum + t.nominal, 0);
  const totalKeluar = transactions.filter(t => t.tipe === 'keluar').reduce((sum, t) => sum + t.nominal, 0);
  const saldo = totalMasuk - totalKeluar;

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
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tanggal-kas-kecil">Tanggal</Label>
              <Input id="tanggal-kas-kecil" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="keterangan-kas-kecil">Keterangan</Label>
              <Input id="keterangan-kas-kecil" placeholder="Deskripsi transaksi" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipe-kas-kecil">Tipe</Label>
              <Select>
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
              <Input id="nominal-kas-kecil" type="number" placeholder="0" />
            </div>
          </div>
          <Button className="w-full md:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Transaksi
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Transaksi Kas Kecil</CardTitle>
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
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.tanggal}</TableCell>
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
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default KasKecil;
