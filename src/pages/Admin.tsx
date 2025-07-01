
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Lock, LogOut, Download, Trash2, Users, Mail } from 'lucide-react';
import AdminDashboard from '@/components/AdminDashboard';

const Admin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem('admin_session_token');
    if (token) {
      validateSession(token);
    }
  }, []);

  const validateSession = async (token: string) => {
    try {
      const { data } = await supabase
        .from('admin_sessions')
        .select('*')
        .eq('session_token', token)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (data) {
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
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour session

      const { error } = await supabase
        .from('admin_sessions')
        .insert([{
          session_token: token,
          username: username,
          expires_at: expiresAt.toISOString()
        }]);

      if (error) throw error;

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
        await supabase
          .from('admin_sessions')
          .delete()
          .eq('session_token', sessionToken);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 animate-pulse" />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10"
      >
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-purple-400 mr-2" />
              <CardTitle className="text-2xl text-white">Admin Login</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder-gray-300 focus:border-purple-400 focus:ring-purple-400/20"
                  required
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder-gray-300 focus:border-purple-400 focus:ring-purple-400/20"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="text-gray-400 hover:text-white"
              >
                ← Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Admin;
