import { api } from '@/lib/api';
import { useEffect, useState, useCallback } from 'react';
import type { AuthCredentials, ApiNotification, AuthUserResponse, ProfileUpdatePayload } from '@/types/api';

export interface UserData {
  id: string;
  name: string;
  email: string;
  department: string;
  year: string;
  role: 'student' | 'organizer' | 'admin';
  interests: string[];
  savedEvents: string[];
  registeredEvents: string[];
  attendance: number;
}

export interface Notification {
  _id?: string;
  id: string;
  type: 'event' | 'registration' | 'priority' | 'reminder';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  eventId?: string;
}

const STORAGE_KEYS = {
  user: 'campus_hub_user',
  token: 'campus_hub_token',
  notifications: 'campus_hub_notifications',
  isLoggedIn: 'campus_hub_logged_in',
};

const mapNotification = (notification: ApiNotification | {
  _id?: string;
  id?: string;
  type: Notification['type'];
  title: string;
  message: string;
  timestamp: string | Date;
  read: boolean;
  eventId?: string;
}): Notification => ({
  _id: notification._id,
  id: notification.id || notification._id || `notif-${Date.now()}`,
  type: notification.type,
  title: notification.title,
  message: notification.message,
  timestamp: new Date(notification.timestamp),
  read: notification.read,
  eventId: notification.eventId,
});

// Initial notifications (Mock for now, can be moved to DB later)
const getInitialNotifications = (): Notification[] => [
  {
    id: 'notif-1',
    type: 'priority',
    title: 'High Priority Event',
    message: 'Campus Tech Fest registration is now managed live. Stay tuned!',
    timestamp: new Date(),
    read: false,
  }
];

export const useUserStore = () => {
  const [user, setUser] = useState<UserData | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.user);
    const isLoggedIn = localStorage.getItem(STORAGE_KEYS.isLoggedIn);
    if (stored && isLoggedIn === 'true') {
      return JSON.parse(stored) as UserData;
    }
    return null;
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.notifications);
    if (stored) {
      const parsed = JSON.parse(stored) as Array<Notification & { timestamp: string }>;
      return parsed.map((notification) => mapNotification(notification));
    }
    return getInitialNotifications();
  });

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.isLoggedIn) === 'true';
  });

  const fetchNotifications = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const data = await api.notifications.getAll();
      setNotifications(data.map((notification) => mapNotification(notification)));
    } catch (error) {
      console.error('Fetch notifications error:', error);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000); // Polling every minute
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, fetchNotifications]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    // For local immediate feedback, though server will persist it.
    const newNotification: Notification = {
      ...notification,
      id: `local-${Date.now()}`,
      timestamp: new Date(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const login = useCallback(async (credentials: AuthCredentials) => {
    try {
      const data: AuthUserResponse = await api.auth.login(credentials);
      const userData: UserData = {
        id: data._id,
        name: data.username,
        email: data.email,
        department: data.department || 'General',
        year: data.year || '1st Year',
        role: data.role,
        interests: data.interests || [],
        savedEvents: data.savedEvents || [],
        registeredEvents: data.registeredEvents || [],
        attendance: data.attendance || 0,
      };
      setUser(userData);
      setIsLoggedIn(true);
      localStorage.setItem(STORAGE_KEYS.isLoggedIn, 'true');
      localStorage.setItem(STORAGE_KEYS.token, data.token);
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(userData));
      fetchNotifications();
      return true;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, [fetchNotifications]);

  const updateProfile = useCallback(async (profileData: ProfileUpdatePayload) => {
    try {
      const data = await api.profile.update(profileData);
      const updatedUser: UserData = {
        ...user!,
        name: data.username,
        email: data.email,
        department: data.department,
        year: data.year,
        interests: data.interests,
      };
      setUser(updatedUser);
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(updatedUser));
      addNotification({
        type: 'reminder',
        title: 'Profile Updated',
        message: 'Your profile information has been successfully updated.',
      });
      return true;
    } catch (error) {
      console.error('Update profile error:', error);
      return false;
    }
  }, [user, addNotification]);

  const logout = useCallback(() => {
    setUser(null);
    setIsLoggedIn(false);
    setNotifications([]);
    localStorage.removeItem(STORAGE_KEYS.isLoggedIn);
    localStorage.removeItem(STORAGE_KEYS.token);
    localStorage.removeItem(STORAGE_KEYS.user);
    localStorage.removeItem(STORAGE_KEYS.notifications);
  }, []);

  const saveEvent = useCallback(async (eventId: string) => {
    if (!user) return false;
    try {
      const res = await api.events.save(eventId);
      const isRemoving = !res.isSaved;
      
      const updatedSavedEvents = isRemoving
        ? user.savedEvents.filter(id => id !== eventId)
        : [...user.savedEvents, eventId];

      const updatedUser = {
        ...user,
        savedEvents: updatedSavedEvents,
      };
      setUser(updatedUser);

      if (!isRemoving) {
        addNotification({
          type: 'event',
          title: 'Event Saved',
          message: 'Event has been added to your saved events.',
          eventId,
        });
      }
      return true;
    } catch (error) {
      console.error('Save event error:', error);
      return false;
    }
  }, [user, addNotification]);

  const unsaveEvent = useCallback(async (eventId: string) => {
    if (!user) return;
    try {
      await api.events.save(eventId); 
      setUser({
        ...user,
        savedEvents: user.savedEvents.filter(id => id !== eventId),
      });
    } catch (error) {
      console.error('Unsave event error:', error);
    }
  }, [user]);

  const registerForEvent = useCallback(async (eventId: string) => {
    if (!user) return false;
    if (user.registeredEvents.includes(eventId)) return false;

    try {
      await api.events.register(eventId);
      const updatedUser = {
        ...user,
        registeredEvents: [...user.registeredEvents, eventId],
      };
      setUser(updatedUser);
      fetchNotifications(); // Refresh notifications from server
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  }, [user, fetchNotifications]);

  const isEventSaved = useCallback((eventId: string) => {
    return user?.savedEvents.includes(eventId) ?? false;
  }, [user]);

  const isEventRegistered = useCallback((eventId: string) => {
    return user?.registeredEvents.includes(eventId) ?? false;
  }, [user]);

  const markNotificationRead = useCallback(async (notificationId: string) => {
    try {
      await api.notifications.markRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId || n._id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Mark notification read error:', error);
    }
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    try {
      // In a real app we'd have a bulk endpoint, for now we'll just local update
      // and assume they'll all be hit on next refresh.
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Mark all notifications read error:', error);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const data: AuthUserResponse = await api.profile.get();
      const updatedUser: UserData = {
        id: data._id,
        name: data.username,
        email: data.email,
        department: data.department,
        year: data.year,
        role: data.role,
        interests: data.interests || [],
        savedEvents: data.savedEvents || [],
        registeredEvents: data.registeredEvents || [],
        attendance: data.attendance || 0,
      };
      setUser(updatedUser);
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  }, [isLoggedIn]);

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  return {
    user,
    isLoggedIn,
    notifications,
    unreadNotificationsCount,
    login,
    logout,
    updateProfile,
    saveEvent,
    unsaveEvent,
    registerForEvent,
    isEventSaved,
    isEventRegistered,
    markNotificationRead,
    markAllNotificationsRead,
    addNotification,
    fetchNotifications,
    refreshUser,
  };
};
