
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import ParticleBackground from '@/components/ParticleBackground';

const Index = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    if (!validateEmail(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('subscribers')
        .insert([{ email: email.toLowerCase() }])
        .select();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Already Subscribed",
            description: "This email is already registered for updates",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      } else {
        setIsSuccess(true);
        setEmail('');
        toast({
          title: "Successfully Subscribed!",
          description: "We'll notify you when we launch",
        });
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: "Subscription Failed",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
      <ParticleBackground />
      
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 animate-pulse" />
      
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-6">
            Coming Soon
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto"
          >
            We are working hard to launch our website. Stay tuned!
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl max-w-md mx-auto"
        >
          <div className="flex items-center justify-center mb-6">
            <Mail className="h-8 w-8 text-purple-400 mr-3" />
            <h2 className="text-2xl font-semibold text-white">Get Notified</h2>
          </div>
          
          <form onSubmit={handleSubscribe} className="space-y-4">
            <div className="relative">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/20 border-white/30 text-white placeholder-gray-300 focus:border-purple-400 focus:ring-purple-400/20 transition-all duration-300"
                disabled={isSubmitting}
              />
            </div>
            
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Subscribing...
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Subscribed!
                </>
              ) : (
                'Notify Me'
              )}
            </Button>
          </form>
          
          <p className="text-gray-400 text-sm mt-4">
            We'll never spam you. Unsubscribe at any time.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-12"
        >
          <a
            href="/admin"
            className="text-gray-500 hover:text-gray-300 text-sm transition-colors duration-300"
          >
            Admin Login
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
