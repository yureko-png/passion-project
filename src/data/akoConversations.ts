 // Ako's conversation lines for Modomoro mode
 // Based on Amau Ako personality from Blue Archive
 
 export interface AkoLine {
   text: string;
   mood: 'encouraging' | 'neutral' | 'firm' | 'thinking' | 'surprised' | 'casual';
   context: 'idle' | 'work_start' | 'work_progress' | 'work_end' | 'break_start' | 'break_end' | 'task_complete' | 'milestone';
 }
 
 export const akoConversations: AkoLine[] = [
   // Idle / Greeting
   { text: "Ara~ Sensei, are you ready to focus? I've prepared everything for you!", mood: 'casual', context: 'idle' },
   { text: "Sensei~ Let's make today productive, ne? I'll be right here supporting you!", mood: 'encouraging', context: 'idle' },
   { text: "Mou~ Sensei, staring at the screen won't finish your tasks by itself...", mood: 'firm', context: 'idle' },
   { text: "Hmm, shall we begin? The sooner we start, the sooner we can take a proper break~", mood: 'thinking', context: 'idle' },
   { text: "Sensei~ I've been waiting! Let's tackle these tasks together!", mood: 'casual', context: 'idle' },
   
   // Work Start
   { text: "Yosh! Focus mode activated, Sensei! I believe in you~!", mood: 'encouraging', context: 'work_start' },
   { text: "Let's do this, Sensei! No distractions until the timer ends!", mood: 'firm', context: 'work_start' },
   { text: "Starting work session~ I'll keep you company, Sensei!", mood: 'casual', context: 'work_start' },
   { text: "Ara ara~ Time to concentrate! Show me your best work, Sensei!", mood: 'encouraging', context: 'work_start' },
   { text: "The timer is running! Let's make every minute count~", mood: 'neutral', context: 'work_start' },
   
   // Work Progress (during session)
   { text: "You're doing great, Sensei! Keep that momentum going~!", mood: 'encouraging', context: 'work_progress' },
   { text: "Hmm hmm~ I can see you're focused. Very impressive, Sensei!", mood: 'surprised', context: 'work_progress' },
   { text: "Stay focused, Sensei! You're halfway there!", mood: 'firm', context: 'work_progress' },
   { text: "Just a little more~ You've got this, Sensei!", mood: 'encouraging', context: 'work_progress' },
   { text: "Sensei's concentration is amazing today~ I'm proud!", mood: 'casual', context: 'work_progress' },
   
   // Work End
   { text: "Excellent work, Sensei! That was a fantastic focus session~! 🎉", mood: 'surprised', context: 'work_end' },
   { text: "Sugoi! You completed the whole session! Time for a well-deserved break~", mood: 'encouraging', context: 'work_end' },
   { text: "Ara~ Sensei, you've been working so hard! I'm impressed!", mood: 'surprised', context: 'work_end' },
   { text: "Great job, Sensei! Your dedication is truly inspiring~", mood: 'encouraging', context: 'work_end' },
   { text: "Session complete! You've earned some rest, ne?", mood: 'casual', context: 'work_end' },
   
   // Break Start
   { text: "Break time~! Stretch your legs, Sensei! Maybe get some water?", mood: 'casual', context: 'break_start' },
   { text: "Ara~ Even I need breaks sometimes. Rest is important, Sensei!", mood: 'casual', context: 'break_start' },
   { text: "Relax for a bit, Sensei~ But don't wander too far, okay?", mood: 'thinking', context: 'break_start' },
   { text: "Take a deep breath, Sensei. You've earned this break~", mood: 'encouraging', context: 'break_start' },
   { text: "Mou~ Don't forget to rest your eyes, Sensei! Look away from the screen~", mood: 'firm', context: 'break_start' },
   
   // Break End
   { text: "Sensei~ Break's over! Ready to dive back into work?", mood: 'firm', context: 'break_end' },
   { text: "Time to focus again! Let's make this session even better~!", mood: 'encouraging', context: 'break_end' },
   { text: "Ara ara~ Refreshed and ready? Let's continue, Sensei!", mood: 'casual', context: 'break_end' },
   { text: "Back to work, Sensei! I know you can do even better this time!", mood: 'encouraging', context: 'break_end' },
   { text: "Break time is over~ Let's tackle the next challenge together!", mood: 'neutral', context: 'break_end' },
   
   // Task Complete
   { text: "Sugoi! Task complete! You're on fire today, Sensei~! ⭐", mood: 'surprised', context: 'task_complete' },
   { text: "Ara~ Another task done? Sensei is unstoppable!", mood: 'surprised', context: 'task_complete' },
   { text: "Great progress, Sensei! One step closer to your goals~", mood: 'encouraging', context: 'task_complete' },
   { text: "Check! I knew you could do it, Sensei! What's next?", mood: 'encouraging', context: 'task_complete' },
   { text: "Task completed~! Your productivity is amazing today!", mood: 'casual', context: 'task_complete' },
   
   // Milestone / Level Up
   { text: "LEVEL UP! Sensei, you've reached a new milestone! I'm so proud~! 🎉", mood: 'surprised', context: 'milestone' },
   { text: "Incredible! Sensei's focus power is growing stronger!", mood: 'surprised', context: 'milestone' },
   { text: "Ara ara~! This calls for celebration! You've leveled up, Sensei!", mood: 'surprised', context: 'milestone' },
   { text: "Amazing achievement! Your dedication is truly inspiring~!", mood: 'encouraging', context: 'milestone' },
   { text: "Sugoi sugoi~! Sensei keeps getting better and better!", mood: 'surprised', context: 'milestone' },
 ];
 
 export const getRandomAkoLine = (context: AkoLine['context']): AkoLine => {
   const contextLines = akoConversations.filter(line => line.context === context);
   return contextLines[Math.floor(Math.random() * contextLines.length)];
 };
 
 export const getAllLinesForContext = (context: AkoLine['context']): AkoLine[] => {
   return akoConversations.filter(line => line.context === context);
 };