import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import AdminCreateEvent from "./pages/AdminCreateEvent";
import AdminAnalytics from "./pages/AdminAnalytics";
import Profile from "./pages/Profile";
import SavedEvents from "./pages/SavedEvents";
import RegisteredEvents from "./pages/RegisteredEvents";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/admin/create" element={<AdminCreateEvent />} />
          <Route path="/admin/events/edit/:id" element={<AdminCreateEvent />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/saved" element={<SavedEvents />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/registered" element={<RegisteredEvents />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
