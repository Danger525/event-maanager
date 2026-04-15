import { Event } from '@/types/event';

export const generateICSFile = (event: Event): string => {
  const formatDate = (dateStr: string, timeStr: string): string => {
    const date = new Date(dateStr);
    const [time, period] = timeStr.split(' ');
    const [hours, minutes] = time.split(':');
    let hour = parseInt(hours, 10);
    
    if (period?.toLowerCase() === 'pm' && hour !== 12) {
      hour += 12;
    } else if (period?.toLowerCase() === 'am' && hour === 12) {
      hour = 0;
    }
    
    date.setHours(hour, parseInt(minutes, 10) || 0, 0, 0);
    
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  };

  const startDate = formatDate(event.date, event.time.split(' - ')[0]);
  // Assume 2 hour duration if no end time
  const endTime = event.time.includes(' - ') 
    ? event.time.split(' - ')[1] 
    : (() => {
        const [time, period] = event.time.split(' ');
        const [hours, minutes] = time.split(':');
        let hour = parseInt(hours, 10) + 2;
        if (hour > 12) hour -= 12;
        return `${hour}:${minutes || '00'} ${period || 'PM'}`;
      })();
  const endDate = formatDate(event.date, endTime);

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Campus Event Hub//EN
BEGIN:VEVENT
UID:${event.id}@campuseventhub
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:${event.title}
DESCRIPTION:${event.description.replace(/\n/g, '\\n')}
LOCATION:${event.venue}
ORGANIZER:${event.organizer}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

  return icsContent;
};

export const downloadICSFile = (event: Event): void => {
  const icsContent = generateICSFile(event);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${event.title.replace(/[^a-z0-9]/gi, '_')}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const getGoogleCalendarUrl = (event: Event): string => {
  const formatDate = (dateStr: string, timeStr: string): string => {
    const date = new Date(dateStr);
    const [time, period] = timeStr.split(' ');
    const [hours, minutes] = time.split(':');
    let hour = parseInt(hours, 10);
    
    if (period?.toLowerCase() === 'pm' && hour !== 12) {
      hour += 12;
    } else if (period?.toLowerCase() === 'am' && hour === 12) {
      hour = 0;
    }
    
    date.setHours(hour, parseInt(minutes, 10) || 0, 0, 0);
    
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const startDate = formatDate(event.date, event.time.split(' - ')[0]);
  const endTime = event.time.includes(' - ') 
    ? event.time.split(' - ')[1] 
    : (() => {
        const [time, period] = event.time.split(' ');
        const [hours, minutes] = time.split(':');
        let hour = parseInt(hours, 10) + 2;
        if (hour > 12) hour -= 12;
        return `${hour}:${minutes || '00'} ${period || 'PM'}`;
      })();
  const endDate = formatDate(event.date, endTime);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${startDate}/${endDate}`,
    details: event.description,
    location: event.venue,
    sf: 'true',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

export const shareEvent = async (event: Event): Promise<boolean> => {
  const shareUrl = `${window.location.origin}/events/${event.id}`;
  const shareData = {
    title: event.title,
    text: `Check out this event: ${event.title} on ${new Date(event.date).toLocaleDateString()}`,
    url: shareUrl,
  };

  // Try native share first
  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return true;
    } catch (err) {
      // User cancelled or error, fall back to clipboard
    }
  }

  // Fall back to clipboard
  try {
    await navigator.clipboard.writeText(shareUrl);
    return true;
  } catch (err) {
    return false;
  }
};
