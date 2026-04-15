import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Event } from '@/types/event';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Bookmark,
  ExternalLink,
  AlertCircle,
  Pencil,
  Trash2,
  BookmarkCheck,
  Loader2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useUserStore } from '@/hooks/useUserStore';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useState } from 'react';

interface EventCardProps {
  event: Event;
  index?: number;
  onRefresh?: () => void;
}

const priorityVariant = {
  high: 'priorityHigh',
  medium: 'priorityMedium',
  low: 'priorityLow',
} as const;

const EventCard = ({ event, index = 0, onRefresh }: EventCardProps) => {
  const navigate = useNavigate();
  const { user, isEventSaved, saveEvent } = useUserStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const daysUntilDeadline = Math.ceil(
    (new Date(event.registrationDeadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
  const isUrgent = daysUntilDeadline <= 3 && daysUntilDeadline > 0;
  const isSaved = isEventSaved(event.id);

  const isAdmin = user?.role === 'admin' || user?.role === 'organizer';

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm('Are you sure you want to delete this event?')) return;

    setIsDeleting(true);
    try {
      await api.events.delete(event.id);
      toast.success('Event deleted successfully');
      if (onRefresh) {
        onRefresh();
      } else {
        window.location.reload();
      }
    } catch (error) {
      toast.error('Failed to delete event');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaving(true);
    try {
      await saveEvent(event.id);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card variant="interactive" className="h-full flex flex-col overflow-hidden group">
        {/* Image Header */}
        <div className="relative h-40 bg-gradient-to-br from-primary/20 to-primary/5 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <Calendar className="h-16 w-16 text-primary/30" />
          </div>

          {/* Priority Badge */}
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge variant={priorityVariant[event.priority]}>
              {event.priority.charAt(0).toUpperCase() + event.priority.slice(1)} Priority
            </Badge>
          </div>

          {/* Bookmark Button */}
          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-3 right-3 bg-background/80 hover:bg-background ${isSaved ? 'text-primary' : ''}`}
            onClick={handleSave}
          >
            {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          </Button>

          {/* Urgent Banner */}
          {isUrgent && (
            <div className="absolute bottom-0 left-0 right-0 bg-priority-high/90 text-white text-xs font-medium py-1.5 px-3 flex items-center gap-1 animate-pulse-subtle">
              <AlertCircle className="h-3 w-3" />
              Registration closes in {daysUntilDeadline} day{daysUntilDeadline !== 1 ? 's' : ''}!
            </div>
          )}
        </div>

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <Badge variant="category" className="mb-2">
                {event.category}
              </Badge>
              <h3 className="font-display font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                {event.title}
              </h3>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 pb-4">
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {event.description}
          </p>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4 text-primary" />
              <span>{new Date(event.date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              })}</span>
              <Clock className="h-4 w-4 text-primary ml-2" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="truncate">{event.venue}</span>
              {event.isOnline && (
                <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0">
                  Online
                </Badge>
              )}
            </div>
            {event.registered !== undefined && event.capacity !== undefined && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4 text-primary" />
                <span>{event.registered} / {event.capacity} registered</span>
                <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden ml-2">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${(event.registered / event.capacity) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="pt-0 gap-2">
          {isAdmin ? (
            <div className="flex w-full gap-2">
              <Link to={`/admin/events/edit/${event.id}`} className="flex-1">
                <Button variant="outline" className="w-full gap-2 text-xs">
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
              </Link>
              <Button
                variant="destructive"
                className="flex-1 gap-2 text-xs"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                Delete
              </Button>
            </div>
          ) : (
            <>
              <Link to={`/events/${event.id}`} className="flex-1">
                <Button variant="default" className="w-full">
                  View Details
                </Button>
              </Link>
              <Button variant="outline" size="icon">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default EventCard;
