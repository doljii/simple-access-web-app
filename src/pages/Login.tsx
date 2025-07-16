import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<'panjar' | 'karung' | 'admin'>('panjar');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();

  // ✅ Redirect setelah login sesuai role
  useEffect(() => {
    if (user) {
      switch (user.role) {
        case 'admin':
          navigate('/dashboard/admin');
          break;
        case 'panjar':
          navigate('/dashboard/panjar');
          break;
        case 'karung':
          navigate('/dashboard/karung');
          break;
        default:
          navigate('/dashboard');
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // ✅ Validasi password minimal
    if (password.length < 6) {
      setError('Password minimal 6 karakter');
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, {
          username,
          name,
          role
        });

        if (error?.message) {
          if (error.message.includes('already been registered')) {
            setError('Email sudah terdaftar. Silakan gunakan email lain atau login.');
          } else {
            setError(error.message);
          }
        } else {
          toast({
            title: "Registrasi berhasil!",
            description: "Silakan login dengan akun baru Anda",
          });
          setIsSignUp(false);
          setEmail('');
          setPassword('');
          setName('');
          setUsername('');
        }
      } else {
        const { error } = await signIn(email, password);

        if (error?.message) {
          if (error.message.includes('Invalid login credentials')) {
            setError('Email atau password salah');
          } else {
            setError(error.message);
          }
        } else {
          toast({
            title: "Login berhasil!",
            description: "Selamat datang kembali",
          });
        }
      }
    } catch (err) {
      setError('Terjadi kesalahan yang tidak terduga');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">
            {isSignUp ? 'Daftar Akun' : 'Login System'}
          </CardTitle>
          <CardDescription>
            {isSignUp ? 'Buat akun baru sesuai role Anda' : 'Masuk ke aplikasi sesuai role Anda'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Masukkan nama lengkap"
                    required
                  />
                </div>
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
                  <Label htmlFor="role">Role</Label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'panjar' | 'karung' | 'admin')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="panjar">Panjar</option>
                    <option value="karung">Karung</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan email"
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
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Loading...' : (isSignUp ? 'Daftar' : 'Login')}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setEmail('');
                setPassword('');
                setName('');
                setUsername('');
              }}
            >
              {isSignUp ? 'Sudah punya akun? Login di sini' : 'Belum punya akun? Daftar di sini'}
            </Button>
          </div>

          {!isSignUp && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Demo Accounts:</h3>
              <div className="space-y-1 text-sm">
                <p><strong>User 1:</strong> user1@demo.com / pass1 (Panjar)</p>
                <p><strong>User 2:</strong> user2@demo.com / pass2 (Karung)</p>
                <p><strong>Admin:</strong> user3@demo.com / pass3 (Admin)</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
