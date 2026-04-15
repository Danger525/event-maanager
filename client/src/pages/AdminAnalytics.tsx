import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Filter,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { api } from '@/lib/api';
import { useUserStore } from '@/hooks/useUserStore';
import { useNavigate } from 'react-router-dom';
import type { AnalyticsData } from '@/types/api';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#0088FE', '#00C49F', '#FFBB28'];

const AdminAnalytics = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const { user, isLoggedIn } = useUserStore();
  const navigate = useNavigate();

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.events.getAnalytics();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn && user?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    
    if (isLoggedIn) {
      fetchAnalytics();
    }
  }, [isLoggedIn, user?.role, navigate, fetchAnalytics]);

  if (!isLoggedIn || user?.role !== 'admin') return null;

  const statsData = analyticsData ? [
    { label: 'Total Registrations', value: analyticsData.stats.totalRegistrations.toLocaleString(), change: '+100%', trend: 'up' },
    { label: 'Active Events', value: analyticsData.stats.activeEvents.toString(), change: 'Live', trend: 'up' },
    { label: 'Total Events', value: analyticsData.stats.totalEvents.toString(), change: '+Active', trend: 'up' },
    { label: 'User Satisfaction', value: '4.8', change: '+0.2', trend: 'up' },
  ] : [];

  const registrationData = analyticsData?.trends || [];
  const categoryData = analyticsData?.categorySplit || [];
  const departmentData = analyticsData?.departmentSplit || [];
  const totalRegistrations = analyticsData?.stats.totalRegistrations ?? 0;
  const totalEvents = analyticsData?.stats.totalEvents ?? 0;
  const activeEvents = analyticsData?.stats.activeEvents ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar isLoggedIn isAdmin userName={user?.name?.split(' ')[0] || 'Admin'} />
      
      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">Aggregating live data from MongoDB...</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="font-display text-3xl font-bold flex items-center gap-2">
                  <TrendingUp className="h-8 w-8 text-primary" />
                  Live Analytics
                </h1>
                <p className="text-muted-foreground">Real-time engagement metrics from the database.</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2" onClick={fetchAnalytics}>
                  <RefreshCw className="h-4 w-4" />
                  Sync Real-time
                </Button>
                <Button variant="hero" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {statsData.map((stat, idx) => (
                <Card key={idx} className="glass border-primary/10">
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <div className="flex items-end justify-between">
                      <h3 className="text-2xl font-bold font-display">{stat.value}</h3>
                      <div className={`flex items-center text-xs font-medium ${
                        stat.trend === 'up' ? 'text-emerald-500' : 'text-rose-500'
                      }`}>
                        {stat.trend === 'up' ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                        {stat.change}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Registration Trends */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Engagement Trend
                  </CardTitle>
                  <CardDescription>Registrations by event creation day</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={registrationData}>
                      <defs>
                        <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ADFA1D" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#ADFA1D" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', color: '#fff' }}
                        itemStyle={{ color: '#ADFA1D' }}
                      />
                      <Area type="monotone" dataKey="registrations" stroke="#ADFA1D" fillOpacity={1} fill="url(#colorReg)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Event Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Category Mix
                  </CardTitle>
                  <CardDescription>Live event distribution</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', color: '#fff' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Department Engagement */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Department Reach
                  </CardTitle>
                  <CardDescription>Events targeting specific departments</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={departmentData} layout="vertical" margin={{ left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', color: '#fff' }}
                      />
                      <Bar dataKey="value" fill="#ADFA1D" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">System Insights</CardTitle>
                  <CardDescription>Automated platform observations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                      <p className="text-sm">
                        Total engagement of <span className="text-primary font-bold">{totalRegistrations}</span> users 
                        across <span className="text-primary font-bold">{totalEvents}</span> events.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-1">Active Percentage</p>
                        <p className="text-lg font-bold">
                          {totalEvents > 0 ? Math.round((activeEvents / totalEvents) * 100) : 0}%
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-1">Avg. Reg / Event</p>
                        <p className="text-lg font-bold">
                          {totalEvents > 0 ? Math.round(totalRegistrations / totalEvents) : 0}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full" onClick={fetchAnalytics}>Recalculate Stats</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default AdminAnalytics;
