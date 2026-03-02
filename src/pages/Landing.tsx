import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Timer, 
  Target, 
  BarChart3, 
  Sparkles, 
  Zap, 
  Brain, 
  CheckCircle2,
  Play,
  ChevronDown,
  Clock,
  Flame,
  Star
} from 'lucide-react';
import { useRef, useState } from 'react';

const features = [
  {
    icon: Timer,
    title: 'Pomodoro Timer',
    description: 'Stay focused with customizable work/break intervals and ambient sounds.',
    color: 'from-blue-500 to-cyan-400',
  },
  {
    icon: Target,
    title: 'Goal Tracking',
    description: 'Set, track, and crush your goals with visual progress indicators.',
    color: 'from-rose-500 to-pink-400',
  },
  {
    icon: Brain,
    title: 'AI Assistant',
    description: 'Meet Ako — your witty AI productivity companion that keeps you accountable.',
    color: 'from-violet-500 to-purple-400',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Visualize your productivity patterns and optimize your workflow.',
    color: 'from-amber-500 to-orange-400',
  },
  {
    icon: Zap,
    title: 'Kanban Board',
    description: 'Organize tasks visually with drag-and-drop simplicity.',
    color: 'from-emerald-500 to-teal-400',
  },
  {
    icon: Sparkles,
    title: 'Modomoro Mode',
    description: 'Immersive focus experience with ambient visuals and sound.',
    color: 'from-indigo-500 to-blue-400',
  },
];

const stats = [
  { value: '25min', label: 'Focus Sessions', icon: Clock },
  { value: '7+', label: 'Productivity Methods', icon: Brain },
  { value: '∞', label: 'Streak Potential', icon: Flame },
  { value: '100%', label: 'Free to Use', icon: Star },
];

const Landing = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  const [isPreviewHovered, setIsPreviewHovered] = useState(false);

  return (
    <div ref={containerRef} className="min-h-screen bg-background overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-xl border-b border-border/40">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-5 h-5 text-primary" />
              </motion.div>
              <span className="text-lg font-bold spirit-gradient-text tracking-tight">Now is your time</span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/app"
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:scale-105"
              >
                Open App
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.section 
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative pt-32 pb-20 px-6"
      >
        <div className="container mx-auto max-w-6xl text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 border border-primary/20"
          >
            <Zap className="w-3.5 h-3.5" />
            Free Productivity Suite
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6"
          >
            <span className="spirit-gradient-text">Now is your time</span>
            <br />
            <span className="text-foreground/80">to be productive</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            A beautiful, all-in-one productivity app with Pomodoro timer, task management, 
            goal tracking, and an AI companion to keep you focused.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link
              to="/app"
              className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-base shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all hover:scale-105"
            >
              <Play className="w-5 h-5" />
              Try the Demo
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#features"
              className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-secondary text-secondary-foreground font-semibold text-base hover:bg-secondary/80 transition-all"
            >
              See Features
              <ChevronDown className="w-4 h-4" />
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-16"
          >
            {stats.map((stat, i) => (
              <div key={i} className="glass-card p-4 text-center">
                <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* App Preview Section */}
      <section className="relative px-6 pb-24">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8 }}
            className="relative"
            onMouseEnter={() => setIsPreviewHovered(true)}
            onMouseLeave={() => setIsPreviewHovered(false)}
          >
            {/* Browser Chrome */}
            <div className="glass-card overflow-hidden shadow-2xl">
              {/* Title bar */}
              <div className="flex items-center gap-2 px-4 py-3 bg-secondary/50 border-b border-border/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-warm/60" />
                  <div className="w-3 h-3 rounded-full bg-mint/60" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-background/80 rounded-lg px-4 py-1.5 text-xs text-muted-foreground text-center font-mono">
                    nowisyourtime.app
                  </div>
                </div>
              </div>

              {/* Iframe */}
              <div className="relative aspect-[16/10] bg-background">
                <iframe
                  src="/app"
                  className="w-full h-full border-0"
                  title="App Demo Preview"
                />
                {/* Hover overlay */}
                <motion.div
                  initial={false}
                  animate={{ opacity: isPreviewHovered ? 0 : 0.6 }}
                  className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none"
                />
              </div>
            </div>

            {/* CTA overlay on preview */}
            <motion.div
              initial={false}
              animate={{ opacity: isPreviewHovered ? 0 : 1 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none"
            >
              <Link
                to="/app"
                className="pointer-events-auto flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold shadow-xl shadow-primary/40 hover:scale-105 transition-transform text-sm"
              >
                <Play className="w-4 h-4" />
                Try Full Demo
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-24 bg-secondary/30">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
              Everything you need to <span className="spirit-gradient-text">stay focused</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              A complete productivity toolkit designed to help you achieve more, stress less.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass-card-hover p-6 group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="px-6 py-24">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
              Why you'll <span className="spirit-gradient-text">love it</span>
            </h2>
          </motion.div>

          <div className="space-y-4">
            {[
              'Pomodoro timer with ambient sounds for deep focus',
              '7+ time management methods (Eisenhower, Pareto, ABC...)',
              'AI companion Ako with personality and daily quests',
              'Kanban board, calendar view, and task manager',
              'Streak tracking and gamification with achievements',
              'Beautiful, responsive design that works on any device',
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-colors"
              >
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-foreground font-medium">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-24">
        <div className="container mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-card p-12 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
            <div className="relative">
              <Sparkles className="w-10 h-10 text-primary mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
                Ready to take control?
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
                Start your productivity journey now. No sign-up required.
              </p>
              <Link
                to="/app"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-base shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all hover:scale-105"
              >
                <Play className="w-5 h-5" />
                Launch Demo
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-border/40">
        <div className="container mx-auto max-w-6xl text-center">
          <p className="text-sm text-muted-foreground">
            Built with ❤️ — <span className="font-semibold spirit-gradient-text">Now is your time</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
