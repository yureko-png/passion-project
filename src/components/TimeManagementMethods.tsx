import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Grid3X3, 
  Clock, 
  ListOrdered, 
  Target, 
  BarChart2, 
  Layers,
  ChevronDown,
  Plus,
  X,
  GripVertical
} from 'lucide-react';
import EisenhowerMatrix from './time-methods/EisenhowerMatrix';
import TimeBlocking from './time-methods/TimeBlocking';
import ABCMethod from './time-methods/ABCMethod';
import ParetoAnalysis from './time-methods/ParetoAnalysis';
import PickleJar from './time-methods/PickleJar';

export type MethodType = 'eisenhower' | 'timeblocking' | 'abc' | 'pareto' | 'picklejar';

interface TimeMethod {
  id: MethodType;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const timeMethods: TimeMethod[] = [
  {
    id: 'eisenhower',
    name: 'Eisenhower Matrix',
    description: 'Prioritize by urgency and importance',
    icon: <Grid3X3 className="w-5 h-5" />,
    color: 'from-primary to-primary/70'
  },
  {
    id: 'timeblocking',
    name: 'Time Blocking',
    description: 'Schedule dedicated focus blocks',
    icon: <Clock className="w-5 h-5" />,
    color: 'from-coral to-coral/70'
  },
  {
    id: 'abc',
    name: 'ABC Method',
    description: 'Categorize tasks by priority level',
    icon: <ListOrdered className="w-5 h-5" />,
    color: 'from-warm to-warm/70'
  },
  {
    id: 'pareto',
    name: 'Pareto Principle',
    description: '80/20 rule for maximum impact',
    icon: <BarChart2 className="w-5 h-5" />,
    color: 'from-accent to-accent/70'
  },
  {
    id: 'picklejar',
    name: 'Pickle Jar Theory',
    description: 'Prioritize rocks before sand',
    icon: <Layers className="w-5 h-5" />,
    color: 'from-spirit to-spirit/70'
  }
];

interface TimeManagementMethodsProps {
  onStartTimer?: (duration: number, label: string) => void;
}

const TimeManagementMethods = ({ onStartTimer }: TimeManagementMethodsProps) => {
  const [activeMethod, setActiveMethod] = useState<MethodType | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const renderMethodContent = () => {
    switch (activeMethod) {
      case 'eisenhower':
        return <EisenhowerMatrix onStartTimer={onStartTimer} />;
      case 'timeblocking':
        return <TimeBlocking onStartTimer={onStartTimer} />;
      case 'abc':
        return <ABCMethod onStartTimer={onStartTimer} />;
      case 'pareto':
        return <ParetoAnalysis onStartTimer={onStartTimer} />;
      case 'picklejar':
        return <PickleJar onStartTimer={onStartTimer} />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card p-6"
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full mb-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-bold text-foreground">Time Management Methods</h3>
            <p className="text-xs text-muted-foreground">Choose a framework to organize your work</p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Method Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-4">
              {timeMethods.map((method) => (
                <motion.button
                  key={method.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveMethod(activeMethod === method.id ? null : method.id)}
                  className={`relative p-3 rounded-xl text-left transition-all ${
                    activeMethod === method.id
                      ? 'bg-gradient-to-br ' + method.color + ' text-white shadow-lg'
                      : 'bg-secondary/50 hover:bg-secondary/80 text-foreground'
                  }`}
                >
                  <div className="flex flex-col gap-2">
                    <div className={`${activeMethod === method.id ? 'text-white' : 'text-muted-foreground'}`}>
                      {method.icon}
                    </div>
                    <div>
                      <p className="text-xs font-semibold leading-tight">{method.name}</p>
                      <p className={`text-[10px] mt-0.5 leading-tight ${
                        activeMethod === method.id ? 'text-white/80' : 'text-muted-foreground'
                      }`}>
                        {method.description}
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Active Method Content */}
            <AnimatePresence mode="wait">
              {activeMethod && (
                <motion.div
                  key={activeMethod}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-border/50 pt-4"
                >
                  {renderMethodContent()}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Empty State */}
            {!activeMethod && (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Select a method above to get started</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TimeManagementMethods;
