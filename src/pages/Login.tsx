
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
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
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
          
          if (error.message?.includes('User already registered') || 
              error.message?.includes('duplicate key') ||
              error.message?.includes('users_email_partial_key')) {
            setError('Email sudah terdaftar. Silakan gunakan email lain atau login dengan akun yang sudah ada.');
          } else if (error.message?.includes('Database error saving new user')) {
            setError('Email sudah digunakan. Silakan login dengan akun yang sudah ada atau gunakan email berbeda.');
          } else if (error.message?.includes('Password should be at least 6 characters')) {
            setError('Password minimal 6 karakter');
          } else if (error.message?.includes('Signup requires a valid password')) {
            setError('Password tidak valid. Pastikan password minimal 6 karakter.');
          } else {
            setError(error.message || 'Gagal mendaftar akun');
          }
        } else {
          toast({
            title: "Registrasi berhasil!",
            description: "Akun berhasil dibuat. Anda akan otomatis login.",
          });
          // Don't switch to login mode, user will be auto-logged in
        }
      } else {
        console.log('Attempting sign in for:', email);
        const { error } = await signIn(email, password);

        if (error) {
          console.error('Sign in error:', error);
          if (error.message?.includes('Invalid login credentials')) {
            setError('Email atau password salah');
          } else if (error.message?.includes('Email not confirmed')) {
            setError('Email belum dikonfirmasi. Silakan cek email Anda atau hubungi admin.');
          } else {
            setError(error.message || 'Gagal login');
          }
        } else {
          toast({
            title: "Login berhasil!",
            description: "Selamat datang kembali",
          });
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

  const handleDemoLogin = async (demoEmail: string, demoPassword: string, demoRole: 'panjar' | 'karung' | 'admin', demoName: string) => {
    setDemoLoading(demoEmail);
    setError('');

    try {
      console.log(`Attempting demo login for: ${demoEmail}`);
      
      // First try to sign in
      const { error: signInError } = await signIn(demoEmail, demoPassword);
      
      if (signInError) {
        console.log('Demo sign in failed, attempting to create account:', signInError.message);
        
        // If sign in fails, try to create the account
        const { error: signUpError } = await signUp(demoEmail, demoPassword, {
          username: demoEmail.split('@')[0],
          name: demoName,
          role: demoRole
        });

        if (signUpError) {
          console.error('Demo sign up error:', signUpError);
          if (signUpError.message?.includes('User already registered')) {
            setError('Akun demo sudah ada tapi password tidak cocok. Silakan hubungi admin.');
          } else {
            setError(`Gagal membuat akun demo: ${signUpError.message}`);
          }
        } else {
          toast({
            title: "Akun demo berhasil dibuat!",
            description: `Selamat datang ${demoName} (${demoRole.toUpperCase()})`,
          });
        }
      } else {
        toast({
          title: "Login demo berhasil!",
          description: `Selamat datang ${demoName} (${demoRole.toUpperCase()})`,
        });
      }
    } catch (err) {
      console.error('Demo login error:', err);
      setError('Terjadi kesalahan saat login demo');
    } finally {
      setDemoLoading(null);
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
                placeholder="Masukkan password (minimal 6 karakter)"
                required
                minLength={6}
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
              <h3 className="font-semibold mb-3 text-center">Demo Login (One-Click)</h3>
              <div className="space-y-3">
                <Button 
                  className="w-full justify-between"
                  variant="outline" 
                  onClick={() => handleDemoLogin('demo.panjar@example.com', 'demo123', 'panjar', 'Demo Panjar User')}
                  disabled={!!demoLoading || loading}
                >
                  <span><strong>Panjar User</strong> - demo.panjar@example.com</span>
                  {demoLoading === 'demo.panjar@example.com' ? 'Loading...' : 'Login'}
                </Button>
                <Button 
                  className="w-full justify-between"
                  variant="outline" 
                  onClick={() => handleDemoLogin('demo.karung@example.com', 'demo123', 'karung', 'Demo Karung User')}
                  disabled={!!demoLoading || loading}
                >
                  <span><strong>Karung User</strong> - demo.karung@example.com</span>
                  {demoLoading === 'demo.karung@example.com' ? 'Loading...' : 'Login'}
                </Button>
                <Button 
                  className="w-full justify-between"
                  variant="outline" 
                  onClick={() => handleDemoLogin('demo.admin@example.com', 'demo123', 'admin', 'Demo Admin User')}
                  disabled={!!demoLoading || loading}
                >
                  <span><strong>Admin User</strong> - demo.admin@example.com</span>
                  {demoLoading === 'demo.admin@example.com' ? 'Loading...' : 'Login'}
                </Button>
              </div>
              <div className="mt-3 text-xs text-gray-600 text-center">
                <p>* Klik tombol di atas untuk login otomatis dengan akun demo</p>
                <p>* Jika akun belum ada, akan dibuat otomatis</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
