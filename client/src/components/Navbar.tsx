import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import NotificationsDropdown from '@/components/NotificationsDropdown';
import { useUserStore } from '@/hooks/useUserStore';
import { 
  Calendar, 
  Home, 
  User as UserIcon, 
  LogOut,
  Menu,
  X,
  Bookmark,
  BarChart3,
  PlusCircle,
  CalendarCheck
} from 'lucide-react';
import { useState } from 'react';

interface NavbarProps {
  isLoggedIn?: boolean;
  isAdmin?: boolean;
  userName?: string;
}

const Navbar = ({ isLoggedIn = false, isAdmin = false, userName = 'User' }: NavbarProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { 
    notifications, 
    unreadNotificationsCount, 
    markNotificationRead, 
    markAllNotificationsRead,
    logout
  } = useUserStore();

  const navItems = isLoggedIn
    ? [
        { name: 'Dashboard', path: '/dashboard', icon: Home },
        { name: 'Events', path: '/events', icon: Calendar },
        { name: 'Registered', path: '/registered', icon: CalendarCheck },
        { name: 'Saved', path: '/saved', icon: Bookmark },
        { name: 'Profile', path: '/profile', icon: UserIcon },
        ...(isAdmin ? [{ name: 'Create Event', path: '/admin/create', icon: PlusCircle }] : []),
        ...(isAdmin ? [{ name: 'Analytics', path: '/admin/analytics', icon: BarChart3 }] : []),
      ]
    : [
        { name: 'Home', path: '/', icon: Home },
        { name: 'Events', path: '/events', icon: Calendar },
      ];

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to={isLoggedIn ? '/dashboard' : '/'} className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
              <Calendar className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">
              Campus<span className="text-primary">Hub</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    size="sm"
                    className="gap-2"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <NotificationsDropdown
                  notifications={notifications}
                  unreadCount={unreadNotificationsCount}
                  onMarkRead={markNotificationRead}
                  onMarkAllRead={markAllNotificationsRead}
                />
                <div className="flex items-center gap-2 pl-2 border-l border-border">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                    {userName.charAt(0)}
                  </div>
                  <span className="text-sm font-medium">{userName}</span>
                </div>
                <Link to="/">
                  <Button variant="ghost" size="icon" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Log in</Button>
                </Link>
                <Link to="/signup">
                  <Button variant="hero">Sign up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border py-4"
          >
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start gap-2">
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Button>
                </Link>
              ))}
              {isLoggedIn && (
                <div className="flex flex-col gap-2 pt-4 border-t border-border mt-2">
                  <div className="flex items-center gap-2 px-4 py-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                      {userName.charAt(0)}
                    </div>
                    <span className="text-sm font-medium">{userName}</span>
                  </div>
                  <Link to="/" onClick={() => { setMobileMenuOpen(false); handleLogout(); }}>
                    <Button variant="outline" className="w-full gap-2">
                      <LogOut className="h-4 w-4" />
                      Log out
                    </Button>
                  </Link>
                </div>
              )}
              {!isLoggedIn && (
                <div className="flex flex-col gap-2 pt-4 border-t border-border mt-2">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">Log in</Button>
                  </Link>
                  <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="hero" className="w-full">Sign up</Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
