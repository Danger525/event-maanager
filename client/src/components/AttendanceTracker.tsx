import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, CheckCircle2, AlertTriangle } from 'lucide-react';

interface AttendanceTrackerProps {
  attendance: number;
  eventsAttended?: number;
  totalEvents?: number;
}

const AttendanceTracker = ({ 
  attendance, 
  eventsAttended = 12, 
  totalEvents = 15 
}: AttendanceTrackerProps) => {
  const isGoodStanding = attendance >= 75;
  const progressColor = isGoodStanding ? 'bg-success' : 'bg-priority-high';
  const textColor = isGoodStanding ? 'text-success' : 'text-priority-high';
  const bgColor = isGoodStanding ? 'bg-success/10' : 'bg-priority-high/10';
  const borderColor = isGoodStanding ? 'border-success/30' : 'border-priority-high/30';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`${bgColor} ${borderColor}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {isGoodStanding ? (
                <TrendingUp className={`h-5 w-5 ${textColor}`} />
              ) : (
                <TrendingDown className={`h-5 w-5 ${textColor}`} />
              )}
              <h3 className="font-semibold text-sm">Attendance Tracker</h3>
            </div>
            <Badge 
              variant={isGoodStanding ? 'success' : 'priorityHigh'} 
              className="text-xs"
            >
              {isGoodStanding ? (
                <><CheckCircle2 className="h-3 w-3 mr-1" /> Good Standing</>
              ) : (
                <><AlertTriangle className="h-3 w-3 mr-1" /> Low Attendance</>
              )}
            </Badge>
          </div>

          <div className="flex items-end gap-2 mb-3">
            <span className={`text-3xl font-bold font-display ${textColor}`}>
              {attendance}%
            </span>
            <span className="text-sm text-muted-foreground mb-1">
              ({eventsAttended}/{totalEvents} events)
            </span>
          </div>

          <div className="space-y-1">
            <div className="h-3 bg-background rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${attendance}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={`h-full ${progressColor} rounded-full`}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span className={attendance >= 75 ? textColor : 'text-muted-foreground'}>
                75% threshold
              </span>
              <span>100%</span>
            </div>
          </div>

          {!isGoodStanding && (
            <p className="text-xs text-muted-foreground mt-3">
              Attend {Math.ceil((75 * totalEvents - attendance * totalEvents / 100) / (100 - 75))} more events to reach good standing.
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AttendanceTracker;
