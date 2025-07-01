
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchSubscriberCount();
  }, []);

  const fetchSubscriberCount = async () => {
    try {
      const response = await fetch('/api/subscribers/count');
      if (response.ok) {
        const data = await response.json();
        setSubscriberCount(data.count || 0);
      }
    } catch (error) {
      console.log('Could not fetch subscriber count');
    }
  };

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
      const response = await fetch('/api/subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.toLowerCase() }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === '23505') {
          toast({
            title: "Already Subscribed",
            description: "This email is already registered for updates",
            variant: "destructive",
          });
        } else {
          throw new Error(data.error || 'Subscription failed');
        }
      } else {
        setIsSuccess(true);
        setEmail('');
        fetchSubscriberCount();
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
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <h1 className="text-6xl md:text-8xl font-bold text-black mb-8 tracking-tight">
            COMING
            <br />
            SOON
          </h1>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-4 mb-12"
          >
            <p className="text-xl text-gray-600">
              Something extraordinary is on the horizon.
            </p>
            <p className="text-lg text-black font-medium">
              Be the first to experience the future.
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-md mx-auto mb-8"
        >
          <form onSubmit={handleSubscribe} className="space-y-4">
            <div className="relative">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 px-6 text-center border-2 border-gray-200 rounded-full focus:border-black focus:ring-0 text-lg placeholder:text-gray-400"
                disabled={isSubmitting}
              />
            </div>
            
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 bg-black hover:bg-gray-800 text-white font-medium text-lg rounded-full transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Subscribing...
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Subscribed!
                </>
              ) : (
                'Notify Me'
              )}
            </Button>
          </form>
          
          {subscriberCount > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-gray-500 text-sm mt-6"
            >
              Join {subscriberCount}+ others waiting for launch
            </motion.p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center space-y-4"
        >
          <p className="text-gray-400 text-sm">
            © 2025. All rights reserved.
          </p>
          <a
            href="/admin"
            className="text-gray-400 hover:text-gray-600 text-sm transition-colors duration-300 block"
          >
            Admin
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
