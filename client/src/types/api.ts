export interface ApiEvent {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  isOnline: boolean;
  onlineLink?: string;
  departments: string[];
  targetYears: string[];
  category: string;
  priority: 'high' | 'medium' | 'low';
  registrationDeadline: string;
  imageUrl?: string;
  organizer: string;
  registeredCount: number;
  capacity?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiNotification {
  _id: string;
  type: 'event' | 'registration' | 'priority' | 'reminder';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  eventId?: string;
}

export interface AnalyticsDatum {
  name: string;
  value: number;
  registrations?: number;
}

export interface AnalyticsData {
  stats: {
    totalRegistrations: number;
    totalEvents: number;
    activeEvents: number;
  };
  categorySplit: AnalyticsDatum[];
  departmentSplit: AnalyticsDatum[];
  trends: Array<{
    name: string;
    registrations: number;
  }>;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  role: string;
  department: string;
  year: string;
  interests: string[];
}

export interface ProfileUpdatePayload {
  username?: string;
  email?: string;
  department?: string;
  year?: string;
  interests?: string[];
  password?: string;
}

export interface EventPayload {
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  onlineLink?: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  registrationDeadline: string;
  capacity?: number;
  isOnline: boolean;
  departments: string[];
  targetYears: string[];
  organizer: string;
}

export interface EventFormValues {
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  onlineLink: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  registrationDeadline: string;
  capacity: string;
}

export interface AuthUserResponse {
  _id: string;
  username: string;
  email: string;
  role: 'student' | 'organizer' | 'admin';
  department?: string;
  year?: string;
  interests?: string[];
  attendance?: number;
  savedEvents?: string[];
  registeredEvents?: string[];
  token: string;
}
