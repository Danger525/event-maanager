export interface Event {
  id: string;
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
  attachments?: string[];
  organizer: string;
  registered?: number;
  capacity?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'faculty' | 'admin';
  department: string;
  year?: string;
  interests: string[];
  avatar?: string;
}

export const departments = [
  'Computer Science',
  'Electronics',
  'Mechanical',
  'Civil',
  'Chemical',
  'Biotechnology',
  'Physics',
  'Mathematics',
  'Business Administration',
  'All Departments'
];

export const categories = [
  'Placement',
  'Workshop',
  'Seminar',
  'Cultural',
  'Sports',
  'Competition',
  'Others'
];

export const academicYears = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
  'All Years'
];

export const interests = [
  'Technology',
  'Coding',
  'Robotics',
  'Music',
  'Dance',
  'Drama',
  'Sports',
  'Entrepreneurship',
  'Research',
  'Career Development',
  'Social Service',
  'Photography'
];
