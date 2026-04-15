import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import EventCard from '@/components/EventCard';
import { api } from '@/lib/api';
import { useUserStore } from '@/hooks/useUserStore';
import { toEventCardEvent } from '@/lib/eventTransforms';
import { Button } from '@/components/ui/button';
import { 
  CalendarCheck, 
  ArrowRight,
  Loader2,
  Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ApiEvent } from '@/types/api';

const RegisteredEvents = () => {
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isLoggedIn } = useUserStore();
  
  const fetchRegisteredEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.events.getRegistered();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching registered events:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchRegisteredEvents();
    }
  }, [isLoggedIn, fetchRegisteredEvents]);

  if (!isLoggedIn) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        isLoggedIn 
        userName={user?.name?.split(' ')[0] || 'User'}
        isAdmin={user?.role === 'admin'}
      />
      
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold mb-1 flex items-center gap-2">
                <CalendarCheck className="h-8 w-8 text-primary" />
                My Registrations
              </h1>
              <p className="text-muted-foreground">
                You have joined {events.length} upcoming events.
              </p>
            </div>
            <Link to="/events">
              <Button variant="outline">
                Browse More Events
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="py-20 text-center">
            <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your registrations...</p>
          </div>
        ) : events.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {events.map((event, index) => (
              <EventCard 
                key={event._id}
                event={toEventCardEvent(event)}
                index={index} 
                onRefresh={fetchRegisteredEvents}
              />
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 text-center max-w-md mx-auto"
          >
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <Calendar className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold mb-2">No registrations yet</h2>
            <p className="text-muted-foreground mb-6">
              You haven't registered for any events yet. Check out the events page to see what's happening!
            </p>
            <Link to="/events">
              <Button variant="hero">
                Discover Events
              </Button>
            </Link>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default RegisteredEvents;
