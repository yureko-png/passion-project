import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Clock, Target, Flame, CheckCircle2, Calendar, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const weeklyData = [
  { day: 'Mon', focus: 120, tasks: 8, goals: 2 },
  { day: 'Tue', focus: 90, tasks: 6, goals: 1 },
  { day: 'Wed', focus: 150, tasks: 10, goals: 3 },
  { day: 'Thu', focus: 180, tasks: 12, goals: 2 },
  { day: 'Fri', focus: 140, tasks: 9, goals: 2 },
  { day: 'Sat', focus: 60, tasks: 4, goals: 1 },
  { day: 'Sun', focus: 45, tasks: 3, goals: 1 },
];

const categoryData = [
  { name: 'Work', value: 45, color: 'hsl(210, 90%, 55%)' },
  { name: 'Personal', value: 25, color: 'hsl(340, 75%, 60%)' },
  { name: 'Learning', value: 20, color: 'hsl(270, 50%, 65%)' },
  { name: 'Health', value: 10, color: 'hsl(160, 50%, 50%)' },
];

const statsCards = [
  { title: 'Focus Time', value: '12.5h', change: '+23%', icon: Clock, color: 'spirit' },
  { title: 'Tasks Done', value: '52', change: '+12%', icon: CheckCircle2, color: 'mint' },
  { title: 'Goals Hit', value: '8', change: '+40%', icon: Target, color: 'lavender' },
  { title: 'Day Streak', value: '14', change: 'Best: 21', icon: Flame, color: 'coral' },
];

const colorMap = {
  spirit: 'bg-primary/20 text-primary',
  mint: 'bg-mint/20 text-mint',
  lavender: 'bg-lavender/20 text-lavender',
  coral: 'bg-accent/20 text-accent',
};

const Dashboard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-primary/10">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">
              Dashboard
            </h3>
            <p className="text-xs text-muted-foreground">Your productivity insights</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card-hover p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${colorMap[stat.color as keyof typeof colorMap]}`}>
                  <stat.icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-medium text-mint">{stat.change}</span>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.title}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Weekly Focus Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-semibold">Weekly Focus</h4>
            </div>
            <span className="text-xs text-muted-foreground">Last 7 days</span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(210, 90%, 55%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(210, 90%, 55%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 88%)" />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="hsl(220, 15%, 45%)" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(220, 15%, 45%)" />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(0, 0%, 100%)',
                    border: '1px solid hsl(220, 20%, 88%)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="focus"
                  stroke="hsl(210, 90%, 55%)"
                  strokeWidth={2}
                  fill="url(#focusGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Tasks by Category */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-lavender" />
              <h4 className="text-sm font-semibold">Time by Category</h4>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-40 w-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(0, 0%, 100%)',
                      border: '1px solid hsl(220, 20%, 88%)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {categoryData.map((category) => (
                <div key={category.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: category.color }}
                    />
                    <span className="text-xs">{category.name}</span>
                  </div>
                  <span className="text-xs font-medium">{category.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tasks Completion Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-mint" />
            <h4 className="text-sm font-semibold">Tasks Completed</h4>
          </div>
          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-muted-foreground">Tasks</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-mint" />
              <span className="text-muted-foreground">Goals</span>
            </div>
          </div>
        </div>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 88%)" />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="hsl(220, 15%, 45%)" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(220, 15%, 45%)" />
              <Tooltip
                contentStyle={{
                  background: 'hsl(0, 0%, 100%)',
                  border: '1px solid hsl(220, 20%, 88%)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="tasks" fill="hsl(210, 90%, 55%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="goals" fill="hsl(160, 50%, 50%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
