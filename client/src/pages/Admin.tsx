
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Lock, LogOut } from 'lucide-react';
import AdminDashboard from '@/components/AdminDashboard';

const Admin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('admin_session_token');
    if (token) {
      validateSession(token);
    }
  }, []);

  const validateSession = async (token: string) => {
    try {
      const response = await fetch(`/api/admin-sessions/${token}`);
      if (response.ok) {
        setIsAuthenticated(true);
        setSessionToken(token);
      } else {
        localStorage.removeItem('admin_session_token');
      }
    } catch (error) {
      localStorage.removeItem('admin_session_token');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (username !== 'Lekhan' || password !== 'L2009@khan!') {
      toast({
        title: "Invalid Credentials",
        description: "Username or password is incorrect",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create session token
      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const response = await fetch('/api/admin-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          session_token: token,
          expires_at: expiresAt.toISOString()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      localStorage.setItem('admin_session_token', token);
      setSessionToken(token);
      setIsAuthenticated(true);
      
      toast({
        title: "Login Successful",
        description: "Welcome to the admin dashboard",
      });
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (sessionToken) {
        await fetch(`/api/admin-sessions/${sessionToken}`, {
          method: 'DELETE',
        });
      }
      
      localStorage.removeItem('admin_session_token');
      setIsAuthenticated(false);
      setSessionToken(null);
      setUsername('');
      setPassword('');
      
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isAuthenticated) {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="border-2 border-gray-200 shadow-lg">
          <CardHeader className="text-center pb-8">
            <div className="flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-black mr-2" />
              <CardTitle className="text-2xl text-black">Admin Login</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <Input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-12 px-4 border-2 border-gray-200 rounded-lg focus:border-black focus:ring-0"
                  required
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 px-4 border-2 border-gray-200 rounded-lg focus:border-black focus:ring-0"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-black hover:bg-gray-800 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
            
            <div className="mt-8 text-center">
              <a
                href="/"
                className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-black transition-colors"
              >
                ← Back to Home
              </a>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Admin;
