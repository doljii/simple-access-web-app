
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';

// Hardcoded user data
const users = [
  { username: 'user1', password: 'pass1', role: 'panjar', name: 'User Panjar' },
  { username: 'user2', password: 'pass2', role: 'karung', name: 'User Karung' },
  { username: 'user3', password: 'pass3', role: 'admin', name: 'Admin/Supervisor' }
];

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
      // Store user data in localStorage
      localStorage.setItem('currentUser', JSON.stringify(user));
      toast({
        title: "Login berhasil!",
        description: `Selamat datang, ${user.name}`,
      });
      navigate('/dashboard');
    } else {
      setError('Username atau password salah');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">Login System</CardTitle>
          <CardDescription>Masuk ke aplikasi sesuai role Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                required
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Demo Accounts:</h3>
            <div className="space-y-1 text-sm">
              <p><strong>User 1:</strong> user1 / pass1 (Panjar)</p>
              <p><strong>User 2:</strong> user2 / pass2 (Karung)</p>
              <p><strong>Admin:</strong> user3 / pass3 (Admin)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
