
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Download, Trash2, Users, Mail, Calendar } from 'lucide-react';

interface Subscriber {
  id: string;
  email: string;
  subscribed_at: string;
  created_at: string;
}

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubscribers(data || []);
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch subscribers",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSubscriber = async (id: string) => {
    try {
      const { error } = await supabase
        .from('subscribers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSubscribers(subscribers.filter(sub => sub.id !== id));
      toast({
        title: "Subscriber Deleted",
        description: "Subscriber has been removed successfully",
      });
    } catch (error) {
      console.error('Error deleting subscriber:', error);
      toast({
        title: "Error",
        description: "Failed to delete subscriber",
        variant: "destructive",
      });
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Email', 'Subscription Date', 'Created At'],
      ...subscribers.map(sub => [
        sub.email,
        new Date(sub.subscribed_at).toLocaleDateString(),
        new Date(sub.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscribers_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: "Subscribers list has been exported to CSV",
    });
  };

  const exportToJSON = () => {
    const jsonContent = JSON.stringify(subscribers, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscribers_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: "Subscribers list has been exported to JSON",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-between items-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <Button
            onClick={onLogout}
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-400 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-white">{subscribers.length}</p>
                  <p className="text-gray-300">Total Subscribers</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Mail className="h-8 w-8 text-pink-400 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-white">
                    {subscribers.filter(sub => 
                      new Date(sub.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    ).length}
                  </p>
                  <p className="text-gray-300">This Week</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-blue-400 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-white">
                    {subscribers.filter(sub => 
                      new Date(sub.created_at).toDateString() === new Date().toDateString()
                    ).length}
                  </p>
                  <p className="text-gray-300">Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Export Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex gap-4 mb-6"
        >
          <Button
            onClick={exportToCSV}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button
            onClick={exportToJSON}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
        </motion.div>

        {/* Subscribers Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Subscribers List</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto"></div>
                  <p className="text-gray-300 mt-2">Loading subscribers...</p>
                </div>
              ) : subscribers.length === 0 ? (
                <div className="text-center py-8">
                  <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300">No subscribers yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/20">
                        <th className="text-left py-3 px-4 text-gray-300">Email</th>
                        <th className="text-left py-3 px-4 text-gray-300">Subscription Date</th>
                        <th className="text-left py-3 px-4 text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscribers.map((subscriber) => (
                        <motion.tr
                          key={subscriber.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="border-b border-white/10 hover:bg-white/5 transition-colors"
                        >
                          <td className="py-3 px-4 text-white">{subscriber.email}</td>
                          <td className="py-3 px-4 text-gray-300">
                            {new Date(subscriber.subscribed_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <Button
                              onClick={() => deleteSubscriber(subscriber.id)}
                              variant="destructive"
                              size="sm"
                              className="bg-red-600 hover:bg-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
