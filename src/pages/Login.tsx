
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
  const { signIn, signUp, user, session } = useAuth();

  // Redirect authenticated users
  useEffect(() => {
    if (user && session) {
      console.log('User authenticated, redirecting to dashboard');
      navigate('/dashboard');
    }
  }, [user, session, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!email || !password) {
      setError('Email dan password harus diisi');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter');
      setLoading(false);
      return;
    }

    if (isSignUp && (!name || !username)) {
      setError('Nama dan username harus diisi');
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        console.log('Attempting sign up for:', email);
        const { error } = await signUp(email, password, {
          username,
          name,
          role
        });

        if (error) {
          console.error('Sign up error:', error);
          if (error.message?.includes('User already registered')) {
            setError('Email sudah terdaftar. Silakan gunakan email lain atau login.');
          } else if (error.message?.includes('duplicate key')) {
            setError('Email sudah digunakan. Silakan gunakan email lain.');
          } else {
            setError(error.message || 'Gagal mendaftar akun');
          }
        } else {
          toast({
            title: "Registrasi berhasil!",
            description: "Silakan login dengan akun baru Anda",
          });
          // Switch to login mode
          setIsSignUp(false);
          setPassword('');
          setName('');
          setUsername('');
        }
      } else {
        console.log('Attempting sign in for:', email);
        const { error } = await signIn(email, password);

        if (error) {
          console.error('Sign in error:', error);
          if (error.message?.includes('Invalid login credentials')) {
            setError('Email atau password salah');
          } else {
            setError(error.message || 'Gagal login');
          }
        } else {
          toast({
            title: "Login berhasil!",
            description: "Selamat datang kembali",
          });
          // Navigation handled by useEffect
        }
      }
    } catch (err) {
      console.error('Form submit error:', err);
      setError('Terjadi kesalahan yang tidak terduga');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setEmail('');
    setPassword('');
    setName('');
    setUsername('');
  };

  const fillDemoAccount = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setIsSignUp(false);
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
              onClick={switchMode}
              disabled={loading}
            >
              {isSignUp ? 'Sudah punya akun? Login di sini' : 'Belum punya akun? Daftar di sini'}
            </Button>
          </div>

          {!isSignUp && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Demo Accounts:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span><strong>User 1:</strong> user1@demo.com / pass1 (Panjar)</span>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => fillDemoAccount('user1@demo.com', 'pass1')}
                    disabled={loading}
                  >
                    Use
                  </Button>
                </div>
                <div className="flex justify-between items-center">
                  <span><strong>User 2:</strong> user2@demo.com / pass2 (Karung)</span>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => fillDemoAccount('user2@demo.com', 'pass2')}
                    disabled={loading}
                  >
                    Use
                  </Button>
                </div>
                <div className="flex justify-between items-center">
                  <span><strong>Admin:</strong> user3@demo.com / pass3 (Admin)</span>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => fillDemoAccount('user3@demo.com', 'pass3')}
                    disabled={loading}
                  >
                    Use
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
