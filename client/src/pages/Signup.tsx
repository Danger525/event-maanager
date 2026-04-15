import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useUserStore } from '@/hooks/useUserStore';

import { Calendar, Eye, EyeOff, ArrowRight, GraduationCap, Briefcase, Shield } from 'lucide-react';
import { departments, academicYears, interests as interestOptions } from '@/types/event';

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const { login } = useUserStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    department: '',
    year: '',
    interests: [] as string[]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    } else {
      try {
        await api.auth.register({
          username: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          department: formData.department,
          year: formData.year,
          interests: formData.interests
        });
        
        // Auto login after signup
        await login({ email: formData.email, password: formData.password });
        toast.success('Account created!', { description: 'Welcome to Campus Hub' });
        navigate('/dashboard');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to create account';
        toast.error('Registration failed', { description: message });
      }
    }
  };

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const roleOptions = [
    { value: 'student', label: 'Student', icon: GraduationCap, description: 'Undergraduate or graduate student' },
    { value: 'organizer', label: 'Organizer', icon: Briefcase, description: 'Faculty or club event coordinator' },
    { value: 'admin', label: 'Admin', icon: Shield, description: 'System administrator' }
  ];

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
            <Calendar className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-2xl font-bold">
            Campus<span className="text-primary">Hub</span>
          </span>
        </Link>

        <Card variant="elevated" className="border-0">
          <CardHeader className="text-center pb-2">
            <CardTitle className="font-display text-2xl">
              {step === 1 ? 'Create your account' : 'Complete your profile'}
            </CardTitle>
            <CardDescription>
              {step === 1 
                ? 'Join thousands of students staying organized'
                : 'Help us personalize your event feed'
              }
            </CardDescription>
            
            {/* Progress indicator */}
            <div className="flex gap-2 justify-center mt-4">
              <div className={`h-1.5 w-16 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
              <div className={`h-1.5 w-16 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {step === 1 ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="h-11"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@campus.edu"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="h-11"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        className="h-11 pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-11 w-11"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Minimum 8 characters with a number and special character
                    </p>
                  </div>

                  {/* Role Selection */}
                  <div className="space-y-2">
                    <Label>I am a...</Label>
                    <div className="grid gap-2">
                      {roleOptions.map((role) => (
                        <div
                          key={role.value}
                          onClick={() => setFormData(prev => ({ ...prev, role: role.value }))}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                            formData.role === role.value 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                            formData.role === role.value ? 'bg-primary text-primary-foreground' : 'bg-muted'
                          }`}>
                            <role.icon className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">{role.label}</div>
                            <div className="text-xs text-muted-foreground">{role.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Select 
                      value={formData.department}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select your department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.filter(d => d !== 'All Departments').map((dept) => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.role === 'student' && (
                    <div className="space-y-2">
                      <Label>Academic Year</Label>
                      <Select 
                        value={formData.year}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, year: value }))}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select your year" />
                        </SelectTrigger>
                        <SelectContent>
                          {academicYears.filter(y => y !== 'All Years').map((year) => (
                            <SelectItem key={year} value={year}>{year}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-3">
                    <Label>Interests (select all that apply)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {interestOptions.map((interest) => {
                        const isSelected = formData.interests.includes(interest);
                        return (
                          <button
                            type="button"
                            key={interest}
                            onClick={() => toggleInterest(interest)}
                            className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all text-sm text-left ${
                              isSelected
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                              isSelected 
                                ? 'bg-primary border-primary text-primary-foreground' 
                                : 'border-input'
                            }`}>
                              {isSelected && (
                                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              )}
                            </div>
                            <span>{interest}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-2">
                {step === 2 && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="lg" 
                    className="flex-1"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                )}
                <Button type="submit" variant="hero" size="lg" className="flex-1">
                  {step === 1 ? 'Continue' : 'Create Account'}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Signup;
