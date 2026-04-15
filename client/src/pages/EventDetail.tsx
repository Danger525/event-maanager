import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { useUserStore } from '@/hooks/useUserStore';
import { downloadICSFile, getGoogleCalendarUrl, shareEvent } from '@/lib/calendarUtils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import type { ApiEvent } from '@/types/api';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  ArrowLeft, 
  Bookmark, 
  BookmarkCheck,
  Share2, 
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  CalendarPlus,
  Check,
  Link as LinkIcon,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const priorityVariant = {
  high: 'priorityHigh',
  medium: 'priorityMedium',
  low: 'priorityLow',
} as const;

const EventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState<ApiEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const { 
    user, 
    isLoggedIn, 
    saveEvent: storeSaveEvent, 
    registerForEvent: storeRegisterForEvent, 
    isEventSaved, 
    isEventRegistered,
  } = useUserStore();

  const [isSaved, setIsSaved] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data: ApiEvent = await api.events.getOne(id);
        setEvent({
          ...data,
          id: data._id,
          registered: data.registeredCount
        });
      } catch (error) {
        console.error('Error fetching event details:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  // Sync local state with store
  useEffect(() => {
    if (id) {
      setIsSaved(isEventSaved(id));
      setIsRegistered(isEventRegistered(id));
    }
  }, [id, isEventSaved, isEventRegistered, user]);

  const displayUser = user || { name: 'Guest', role: 'student' as const };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar isLoggedIn={isLoggedIn} userName={displayUser.name.split(' ')[0]} />
        <div className="container mx-auto px-4 py-16 text-center">
          <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar isLoggedIn={isLoggedIn} userName={displayUser.name.split(' ')[0]} />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Event not found</h1>
          <Link to="/events">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const daysUntilDeadline = Math.ceil(
    (new Date(event.registrationDeadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
  const isDeadlinePassed = daysUntilDeadline < 0;
  const isUrgent = daysUntilDeadline <= 3 && daysUntilDeadline > 0;

  const handleRegister = async () => {
    if (isRegistered) {
      toast.info('Already Registered', {
        description: 'You have already registered for this event.',
      });
      return;
    }
    
    const success = await storeRegisterForEvent(event.id);
    if (success) {
      setIsRegistered(true);
      toast.success('Registration Successful!', {
        description: `You have registered for "${event.title}". Check your email for confirmation.`,
      });
    }
  };

  const handleSave = async () => {
    const success = await storeSaveEvent(event.id);
    if (success) {
      const currentlySaved = !isSaved;
      setIsSaved(currentlySaved);
      toast.success(currentlySaved ? 'Event Saved!' : 'Event Removed', {
        description: currentlySaved ? 'Event added to your saved list.' : 'Event removed from your saved list.',
      });
    }
  };

  const handleAddToCalendar = (type: 'download' | 'google') => {
    if (type === 'download') {
      downloadICSFile(event);
      toast.success('Calendar File Downloaded', {
        description: 'Import the .ics file to your calendar app.',
      });
    } else {
      window.open(getGoogleCalendarUrl(event), '_blank');
      toast.success('Opening Google Calendar', {
        description: 'Add the event to your Google Calendar.',
      });
    }
  };

  const handleShare = async () => {
    const success = await shareEvent(event);
    if (success) {
      toast.success('Link Copied!', {
        description: 'Event link has been copied to your clipboard.',
      });
    } else {
      toast.error('Share Failed', {
        description: 'Unable to share the event. Please try again.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        isLoggedIn 
        userName={displayUser.name.split(' ')[0]}
        isAdmin={displayUser.role === 'admin'}
      />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link to="/events">
            <Button variant="ghost" size="sm" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Button>
          </Link>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Hero Image */}
            <div className="relative h-64 md:h-80 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <Calendar className="h-24 w-24 text-primary/30" />
              </div>
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge variant={priorityVariant[event.priority]}>
                  {event.priority.charAt(0).toUpperCase() + event.priority.slice(1)} Priority
                </Badge>
                <Badge variant="category">{event.category}</Badge>
              </div>
              {isRegistered && (
                <div className="absolute top-4 right-4">
                  <Badge variant="success" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Registered
                  </Badge>
                </div>
              )}
            </div>

            {/* Title and Description */}
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
                {event.title}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {event.description}
              </p>
            </div>

            {/* Who Should Attend */}
            <Card variant="flat" className="bg-primary/5 border-primary/20">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Who Should Attend?
                </h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {event.departments.map((dept) => (
                    <Badge key={dept} variant="secondary">{dept}</Badge>
                  ))}
                  {event.targetYears.map((year) => (
                    <Badge key={year} variant="outline">{year}</Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  This event is specifically designed for students in the above departments and years. 
                  Don't miss this opportunity to enhance your academic and professional journey.
                </p>
              </CardContent>
            </Card>

            {/* Event Details */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card variant="gradient">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Date</p>
                      <p className="font-semibold">
                        {new Date(event.date).toLocaleDateString('en-US', { 
                          weekday: 'long',
                          month: 'long', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card variant="gradient">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Time</p>
                      <p className="font-semibold">{event.time}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card variant="gradient">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Venue</p>
                      <p className="font-semibold">{event.venue}</p>
                      {event.isOnline && (
                        <Badge variant="secondary" className="mt-1 text-xs">Online Event</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card variant="gradient">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Organized by</p>
                      <p className="font-semibold">{event.organizer}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            {/* Registration Card */}
            <Card variant="elevated" className="sticky top-24">
              <CardContent className="p-6 space-y-4">
                {/* Deadline */}
                <div className={`p-3 rounded-lg ${
                  isDeadlinePassed ? 'bg-destructive/10 text-destructive' :
                  isUrgent ? 'bg-priority-high/10 text-priority-high' : 'bg-muted'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    {isDeadlinePassed ? (
                      <AlertCircle className="h-4 w-4" />
                    ) : isUrgent ? (
                      <Clock className="h-4 w-4 animate-pulse" />
                    ) : (
                      <Clock className="h-4 w-4" />
                    )}
                    <span className="text-sm font-medium">
                      {isDeadlinePassed 
                        ? 'Registration Closed' 
                        : isUrgent 
                          ? 'Closing Soon!' 
                          : 'Registration Deadline'
                      }
                    </span>
                  </div>
                  <p className="text-lg font-bold">
                    {new Date(event.registrationDeadline).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                  {!isDeadlinePassed && (
                    <p className="text-xs mt-1">
                      {daysUntilDeadline} day{daysUntilDeadline !== 1 ? 's' : ''} remaining
                    </p>
                  )}
                </div>

                {/* Registration Progress */}
                {event.registered !== undefined && event.capacity !== undefined && (
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Registrations</span>
                      <span className="font-medium">{event.registered} / {event.capacity}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${(event.registered / event.capacity) * 100}%` }}
                      />
                    </div>
                    {event.registered >= event.capacity * 0.9 && (
                      <p className="text-xs text-warning mt-1">Almost full!</p>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-2 pt-2">
                  <Button 
                    variant={isDeadlinePassed ? "secondary" : isRegistered ? "success" : "hero"} 
                    size="lg" 
                    className="w-full"
                    disabled={isDeadlinePassed}
                    onClick={handleRegister}
                  >
                    {isDeadlinePassed ? (
                      <>
                        <AlertCircle className="h-4 w-4" />
                        Registration Closed
                      </>
                    ) : isRegistered ? (
                      <>
                        <Check className="h-4 w-4" />
                        Registered
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Register Now
                      </>
                    )}
                  </Button>

                  <div className="grid grid-cols-3 gap-2">
                    <Button 
                      variant={isSaved ? "default" : "outline"} 
                      size="sm" 
                      className="flex-col h-auto py-3"
                      onClick={handleSave}
                    >
                      {isSaved ? (
                        <BookmarkCheck className="h-4 w-4 mb-1" />
                      ) : (
                        <Bookmark className="h-4 w-4 mb-1" />
                      )}
                      <span className="text-xs">{isSaved ? 'Saved' : 'Save'}</span>
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-col h-auto py-3">
                          <CalendarPlus className="h-4 w-4 mb-1" />
                          <span className="text-xs">Calendar</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleAddToCalendar('google')}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Google Calendar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAddToCalendar('download')}>
                          <Calendar className="h-4 w-4 mr-2" />
                          Download .ics
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-col h-auto py-3"
                      onClick={handleShare}
                    >
                      <Share2 className="h-4 w-4 mb-1" />
                      <span className="text-xs">Share</span>
                    </Button>
                  </div>
                </div>

                {/* Online Link */}
                {event.isOnline && event.onlineLink && (
                  <Button variant="secondary" className="w-full">
                    <ExternalLink className="h-4 w-4" />
                    Join Online
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default EventDetail;
