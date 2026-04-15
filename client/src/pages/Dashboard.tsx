import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import EventCard from '@/components/EventCard';
import AttendanceTracker from '@/components/AttendanceTracker';
import { api } from '@/lib/api';
import { useUserStore } from '@/hooks/useUserStore';
import { toEventCardEvent } from '@/lib/eventTransforms';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ApiEvent } from '@/types/api';
import { 
  Calendar, 
  Bell, 
  TrendingUp, 
  Clock, 
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Bookmark,
  Loader2
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { 
    user, 
    isLoggedIn, 
    notifications, 
    unreadNotificationsCount,
    markNotificationRead,
    markAllNotificationsRead,
  } = useUserStore();
  
  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.events.getAll({
        department: user?.department || 'all'
      });
      setEvents(data);
    } catch (error) {
      console.error('Error fetching dashboard events:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.department]);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    fetchDashboardData();
  }, [isLoggedIn, navigate, fetchDashboardData]);

  const highPriorityEvents = events.filter((event) => event.priority === 'high');
  const upcomingEvents = events.slice(0, 4);

  const quickStats = [
    { label: 'Upcoming Events', value: events.length, icon: Calendar, color: 'text-primary' },
    { label: 'High Priority', value: highPriorityEvents.length, icon: Bell, color: 'text-priority-high' },
    { label: 'Registered', value: user?.registeredEvents?.length || 0, icon: CheckCircle2, color: 'text-success' },
    { label: 'Saved', value: user?.savedEvents?.length || 0, icon: Bookmark, color: 'text-warning' }
  ];

  const firstName = user?.name?.split(' ')[0] || 'Guest';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        isLoggedIn 
        userName={firstName}
        isAdmin={user?.role === 'admin'}
      />
      
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold mb-1">
                Welcome back, {firstName}! 👋
              </h1>
              <p className="text-muted-foreground">
                You have {highPriorityEvents.length} high-priority events requiring attention
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="category" className="px-3 py-1">
                {user?.department}
              </Badge>
              <Badge variant="secondary" className="px-3 py-1">
                {user?.year}
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats + Attendance */}
        <div className="grid lg:grid-cols-5 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {quickStats.map((stat) => (
              <Card key={stat.label} variant="gradient" className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-background ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold font-display">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </Card>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="lg:col-span-2"
          >
            <AttendanceTracker 
              attendance={user?.attendance || 0}
              eventsAttended={Math.round((user?.attendance || 0) * 15 / 100)}
              totalEvents={15}
            />
          </motion.div>
        </div>

        {/* High Priority Alert */}
        {highPriorityEvents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <Card className="border-priority-high/30 bg-priority-high/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-priority-high text-white animate-pulse-soft">
                    <Bell className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-priority-high">Attention Required</h3>
                    <p className="text-sm text-muted-foreground">
                      {highPriorityEvents.length} high-priority event{highPriorityEvents.length !== 1 ? 's' : ''} need your attention
                    </p>
                  </div>
                  <Link to="/events">
                    <Button variant="destructive" size="sm">
                      View All
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Recent Notifications */}
        {unreadNotificationsCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mb-8"
          >
            <Card variant="flat" className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Bell className="h-4 w-4 text-primary" />
                    Recent Notifications
                  </h3>
                  <Button variant="ghost" size="sm" onClick={markAllNotificationsRead}>
                    Mark all as read
                  </Button>
                </div>
                <div className="space-y-2">
                  {notifications.filter(n => !n.read).slice(0, 3).map((notification) => (
                    <div 
                      key={notification.id}
                      className="flex items-start gap-3 p-2 rounded-lg bg-background/50 cursor-pointer hover:bg-background/80 transition-colors"
                      onClick={() => markNotificationRead(notification.id)}
                    >
                      <div className="flex-shrink-0 h-2 w-2 rounded-full bg-primary mt-2" />
                      <div>
                        <p className="text-sm font-medium">{notification.title}</p>
                        <p className="text-xs text-muted-foreground">{notification.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Events Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="font-display text-xl font-semibold">Events For You</h2>
            </div>
            <Link to="/events">
              <Button variant="ghost" size="sm">
                View All Events
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {upcomingEvents.map((event, index) => (
              <EventCard 
                key={event._id}
                event={toEventCardEvent(event)}
                index={index} 
                onRefresh={fetchDashboardData}
              />
            ))}
          </div>
        </section>

        {/* Personalization Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12"
        >
          <Card variant="flat" className="bg-muted/50">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary text-primary-foreground">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Personalized For You</h3>
                  <p className="text-sm text-muted-foreground">
                    Events are filtered based on your department ({user?.department}), 
                    year ({user?.year}), and interests ({user?.interests?.join(', ') || 'Not set'}). 
                    Update your profile to see different events.
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Edit Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
