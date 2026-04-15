import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { departments, categories, academicYears } from '@/types/event';
import { 
  Calendar, 
  MapPin, 
  Upload, 
  Link2, 
  CheckCircle2,
  Plus,
  Save,
  Loader2,
  ArrowLeft,
  Clock,
  Users
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { useUserStore } from '@/hooks/useUserStore';
import type { EventFormValues } from '@/types/api';
import { useNavigate, useParams, Link } from 'react-router-dom';

const AdminCreateEvent = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useUserStore();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(isEditMode);
  
  const [formData, setFormData] = React.useState<EventFormValues>({
    title: '',
    description: '',
    date: '',
    time: '',
    venue: '',
    onlineLink: '',
    category: '',
    priority: 'medium',
    registrationDeadline: '',
    capacity: ''
  });
  const [isOnline, setIsOnline] = React.useState(false);
  const [selectedDepartments, setSelectedDepartments] = React.useState<string[]>([]);
  const [selectedYears, setSelectedYears] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (isEditMode) {
      const fetchEvent = async () => {
        try {
          const data = await api.events.getOne(id!);
          setFormData({
            title: data.title,
            description: data.description,
            date: data.date.split('T')[0],
            time: data.time,
            venue: data.venue || '',
            onlineLink: data.onlineLink || '',
            category: data.category,
            priority: data.priority,
            registrationDeadline: data.registrationDeadline.split('T')[0],
            capacity: data.capacity?.toString() || ''
          });
          setIsOnline(data.isOnline);
          setSelectedDepartments(data.departments);
          setSelectedYears(data.targetYears);
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to fetch event data",
            variant: "destructive"
          });
          navigate('/dashboard');
        } finally {
          setIsLoading(false);
        }
      };
      fetchEvent();
    }
  }, [id, isEditMode, toast, navigate]);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', { replace: true });
    } else if (user?.role !== 'admin') {
      navigate('/dashboard', { replace: true });
    }
  }, [isLoggedIn, user?.role, navigate]);

  if (!isLoggedIn || user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  const toggleDepartment = (dept: string) => {
    if (dept === 'All Departments') {
      setSelectedDepartments(['All Departments']);
    } else {
      setSelectedDepartments(prev => {
        const filtered = prev.filter(d => d !== 'All Departments');
        if (filtered.includes(dept)) {
          return filtered.filter(d => d !== dept);
        }
        return [...filtered, dept];
      });
    }
  };

  const toggleYear = (year: string) => {
    if (year === 'All Years') {
      setSelectedYears(['All Years']);
    } else {
      setSelectedYears(prev => {
        const filtered = prev.filter(y => y !== 'All Years');
        if (filtered.includes(year)) {
          return filtered.filter(y => y !== year);
        }
        return [...filtered, year];
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDepartments.length === 0 || selectedYears.length === 0) {
      toast({
        title: "Incomplete Form",
        description: "Please select at least one department and target year.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        isOnline,
        departments: selectedDepartments,
        targetYears: selectedYears,
        organizer: user?.name || 'Admin',
        venue: isOnline ? formData.venue || 'Online' : formData.venue,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined
      };

      if (isEditMode) {
        await api.events.update(id!, payload);
        toast({
          title: "Event Updated!",
          description: "Your event has been successfully modified.",
        });
      } else {
        await api.events.create(payload);
        toast({
          title: "Event Created!",
          description: "Your event has been created and relevant users notified.",
        });
      }
      navigate('/events');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        isLoggedIn 
        isAdmin 
        userName={user?.name?.split(' ')[0] || 'Admin'} 
      />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold mb-2">
              {isEditMode ? 'Edit Event' : 'Create New Event'}
            </h1>
            <p className="text-muted-foreground">
              {isEditMode 
                ? 'Update the details of your event below.' 
                : 'Fill in the details below to create a new event. Relevant users will be notified automatically.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Event title and description</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Annual Tech Fest 2026"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="h-11"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide a detailed description..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <option value="" disabled>Select category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Priority Level *</Label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as EventFormValues['priority'] }))}
                      className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Date, Time & Venue
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Event Date *</Label>
                    <Input id="date" type="date" value={formData.date} onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))} className="h-11" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Event Time *</Label>
                    <Input id="time" type="time" value={formData.time} onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))} className="h-11" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deadline">Registration Deadline *</Label>
                    <Input id="deadline" type="date" value={formData.registrationDeadline} onChange={(e) => setFormData(prev => ({ ...prev, registrationDeadline: e.target.value }))} className="h-11" required />
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted">
                  <input
                    id="isOnline"
                    type="checkbox"
                    checked={isOnline}
                    onChange={(e) => setIsOnline(e.target.checked)}
                    className="h-4 w-4 accent-primary"
                  />
                  <Label htmlFor="isOnline">This is an online event</Label>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="venue">{isOnline ? 'Platform / Venue *' : 'Venue *'}</Label>
                    <Input
                      id="venue"
                      value={formData.venue}
                      onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
                      placeholder={isOnline ? 'e.g., Zoom, Google Meet, Online Hall' : 'e.g., Main Auditorium'}
                      className="h-11"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="onlineLink">Meeting Link {isOnline ? '*' : '(optional)'}</Label>
                    <Input
                      id="onlineLink"
                      type="url"
                      value={formData.onlineLink}
                      onChange={(e) => setFormData(prev => ({ ...prev, onlineLink: e.target.value }))}
                      className="h-11"
                      required={isOnline}
                      placeholder="https://meet.google.com/..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capacity">Total Capacity (optional)</Label>
                  <Input 
                    id="capacity" 
                    type="number" 
                    placeholder="e.g., 100" 
                    value={formData.capacity} 
                    onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))} 
                    className="h-11" 
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Target Audience
                </CardTitle>
                <CardDescription>Select who should see and register for this event</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Departments *</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                    {departments.map((dept) => {
                      const isSelected = selectedDepartments.includes(dept);
                      return (
                        <div 
                          key={dept} 
                          className={`flex items-center space-x-2 p-3 rounded-lg border transition-all ${isSelected ? 'border-primary bg-primary/5' : 'border-border'}`}
                        >
                          <input
                            id={`dept-${dept}`}
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleDepartment(dept)}
                            className="h-4 w-4 accent-primary"
                          />
                          <Label htmlFor={`dept-${dept}`} className="cursor-pointer text-sm font-medium">{dept}</Label>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Academic Years *</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
                    {academicYears.map((year) => {
                      const isSelected = selectedYears.includes(year);
                      return (
                        <div 
                          key={year} 
                          className={`flex items-center space-x-2 p-3 rounded-lg border transition-all ${isSelected ? 'border-primary bg-primary/5' : 'border-border'}`}
                        >
                          <input
                            id={`year-${year}`}
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleYear(year)}
                            className="h-4 w-4 accent-primary"
                          />
                          <Label htmlFor={`year-${year}`} className="cursor-pointer text-sm font-medium">{year}</Label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Button type="submit" variant="hero" size="lg" className="w-full sm:w-auto" disabled={isSubmitting}>
                {isSubmitting ? (
                  <><Loader2 className="h-5 w-5 animate-spin mr-2" />Saving...</>
                ) : isEditMode ? (
                  <><Save className="h-5 w-5 mr-2" />Update Event</>
                ) : (
                  <><Plus className="h-5 w-5 mr-2" />Create Event</>
                )}
              </Button>
              <Link to="/events">
                <Button type="button" variant="outline" size="lg" className="w-full sm:w-auto">Cancel</Button>
              </Link>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
};

export default AdminCreateEvent;
