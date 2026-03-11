import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Brain, FlaskConical, Languages, Loader2, CheckCircle2, Upload, FileText, Trophy, Settings2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

type Subject = 'math' | 'science' | 'english';
type QuestionType = 'multiple_choice' | 'essay' | 'mixed';
type Difficulty = 'easy' | 'medium' | 'hard';

interface Question {
  question: string;
  type: 'multiple_choice' | 'essay';
  options: string[];
  correct: number;
  correctAnswer?: string;
  explanation: string;
  difficulty: string;
}

const subjectConfig = {
  math: { label: 'Matematika', icon: Brain, color: 'from-primary to-spirit-light' },
  science: { label: 'IPA / Sains', icon: FlaskConical, color: 'from-mint to-primary' },
  english: { label: 'Bahasa Inggris', icon: Languages, color: 'from-lavender to-accent' },
};

const SubjectQuiz = () => {
  const [subject, setSubject] = useState<Subject | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | string | null)[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadedMaterial, setUploadedMaterial] = useState('');
  const [materialFileName, setMaterialFileName] = useState('');
  const [showConfig, setShowConfig] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Config
  const [questionType, setQuestionType] = useState<QuestionType>('multiple_choice');
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [language, setLanguage] = useState<'id' | 'en'>('id');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMaterialFileName(file.name);
    const text = await file.text();
    setUploadedMaterial(text.slice(0, 5000));
  };

  const generateQuiz = async (subj: Subject) => {
    setSubject(subj);
    setLoading(true);
    setQuestions([]);
    setAnswers([]);
    setCurrentQ(0);
    setShowResult(false);

    try {
      const { data, error } = await supabase.functions.invoke('generate-quiz', {
        body: {
          subject: subj,
          material: uploadedMaterial || undefined,
          questionType,
          count: questionCount,
          difficulty,
          language,
        },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      setQuestions(data.questions || []);
      setAnswers(new Array(data.questions?.length || 0).fill(null));
    } catch (err: any) {
      console.error('Quiz generation error:', err);
      toast({ title: 'Error', description: err.message || 'Gagal membuat soal', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = (idx: number) => {
    if (showResult) return;
    const newAnswers = [...answers];
    newAnswers[currentQ] = idx;
    setAnswers(newAnswers);
  };

  const setEssayAnswer = (text: string) => {
    if (showResult) return;
    const newAnswers = [...answers];
    newAnswers[currentQ] = text;
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setShowResult(true);
    }
  };

  const mcScore = questions.reduce((acc, q, i) => {
    if (q.type === 'multiple_choice' && answers[i] === q.correct) return acc + 1;
    return acc;
  }, 0);
  const mcTotal = questions.filter(q => q.type === 'multiple_choice').length;

  const reset = () => {
    setSubject(null);
    setQuestions([]);
    setAnswers([]);
    setCurrentQ(0);
    setShowResult(false);
  };

  // Subject selection screen
  if (!subject) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">AI Question Generator</h3>
                <p className="text-xs text-muted-foreground">Buat soal latihan dengan AI</p>
              </div>
            </div>
            <button onClick={() => setShowConfig(!showConfig)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <Settings2 className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Config panel */}
          <AnimatePresence>
            {showConfig && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-6">
                <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-secondary/50">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Jenis Soal</label>
                    <select value={questionType} onChange={e => setQuestionType(e.target.value as QuestionType)} className="w-full p-2 rounded-lg bg-background border border-border text-sm">
                      <option value="multiple_choice">Pilihan Ganda</option>
                      <option value="essay">Essay</option>
                      <option value="mixed">Campuran</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Jumlah</label>
                    <select value={questionCount} onChange={e => setQuestionCount(Number(e.target.value))} className="w-full p-2 rounded-lg bg-background border border-border text-sm">
                      <option value={5}>5 soal</option>
                      <option value={10}>10 soal</option>
                      <option value={20}>20 soal</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Tingkat</label>
                    <select value={difficulty} onChange={e => setDifficulty(e.target.value as Difficulty)} className="w-full p-2 rounded-lg bg-background border border-border text-sm">
                      <option value="easy">Mudah</option>
                      <option value="medium">Sedang</option>
                      <option value="hard">Sulit</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Bahasa</label>
                    <select value={language} onChange={e => setLanguage(e.target.value as 'id' | 'en')} className="w-full p-2 rounded-lg bg-background border border-border text-sm">
                      <option value="id">Indonesia</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Upload Material */}
          <div className="mb-6">
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors"
            >
              <Upload className="w-5 h-5 text-muted-foreground" />
              <div className="text-left">
                <p className="text-sm font-medium">{materialFileName || 'Upload Materi (Opsional)'}</p>
                <p className="text-xs text-muted-foreground">AI akan membuat soal sesuai materi yang diupload</p>
              </div>
              {materialFileName && <FileText className="w-5 h-5 text-primary ml-auto" />}
            </button>
            <input ref={fileRef} type="file" accept=".txt,.md,.pdf" className="hidden" onChange={handleFileUpload} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(Object.entries(subjectConfig) as [Subject, typeof subjectConfig.math][]).map(([key, config]) => (
              <motion.button
                key={key}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => generateQuiz(key)}
                className={`p-6 rounded-2xl bg-gradient-to-br ${config.color} text-primary-foreground flex flex-col items-center gap-3 shadow-lg`}
              >
                <config.icon className="w-10 h-10" />
                <span className="font-bold text-lg">{config.label}</span>
                <span className="text-xs opacity-80">{questionCount} soal • {difficulty}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="glass-card p-12 flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Ako sedang membuat {questionCount} soal untukmu~</p>
      </div>
    );
  }

  // Result screen
  if (showResult) {
    const pct = mcTotal > 0 ? Math.round((mcScore / mcTotal) * 100) : 0;
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8 text-center space-y-6">
        <Trophy className="w-16 h-16 text-primary mx-auto" />
        {mcTotal > 0 && (
          <>
            <h2 className="text-3xl font-bold">{pct}%</h2>
            <p className="text-lg">{mcScore} / {mcTotal} PG benar</p>
          </>
        )}
        <p className="text-muted-foreground">
          {pct >= 80 ? 'Sugoi! Kamu luar biasa, Sensei! 🎉' : pct >= 50 ? 'Lumayan! Terus berlatih ya~ 💪' : 'Jangan menyerah, Sensei! Coba lagi~ 📚'}
        </p>

        {/* Answer review */}
        <div className="space-y-3 text-left max-h-80 overflow-y-auto">
          {questions.map((q, i) => {
            const isCorrect = q.type === 'multiple_choice' && answers[i] === q.correct;
            return (
              <div key={i} className={`p-3 rounded-xl text-sm ${q.type === 'essay' ? 'bg-secondary/50' : isCorrect ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                <p className="font-medium mb-1">{i + 1}. {q.question}</p>
                {q.type === 'multiple_choice' && (
                  <p className="text-xs">
                    Jawaban kamu: <strong>{q.options[answers[i] as number] || '-'}</strong> | Benar: <strong>{q.options[q.correct]}</strong>
                  </p>
                )}
                {q.type === 'essay' && (
                  <>
                    <p className="text-xs text-muted-foreground">Jawaban kamu: {(answers[i] as string) || '(kosong)'}</p>
                    {q.correctAnswer && <p className="text-xs text-primary mt-1">Model answer: {q.correctAnswer}</p>}
                  </>
                )}
                <p className="text-xs text-muted-foreground mt-1">{q.explanation}</p>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="px-6 py-3 rounded-xl bg-secondary text-foreground font-medium">Pilih Mapel Lain</button>
          <button onClick={() => generateQuiz(subject)} className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium">Coba Lagi</button>
        </div>
      </motion.div>
    );
  }

  // Quiz question
  const q = questions[currentQ];
  if (!q) return <div className="glass-card p-6 text-center text-muted-foreground">Gagal memuat soal. <button onClick={reset} className="text-primary underline">Coba lagi</button></div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-primary">{subjectConfig[subject].label}</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full ${q.type === 'essay' ? 'bg-accent/20 text-accent' : 'bg-primary/20 text-primary'}`}>
            {q.type === 'essay' ? 'Essay' : 'PG'}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">{currentQ + 1} / {questions.length}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div animate={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} className="h-full bg-primary rounded-full" />
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div key={currentQ} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
          <h3 className="text-lg font-semibold mb-4">{q.question}</h3>

          {q.type === 'multiple_choice' ? (
            <div className="space-y-3">
              {q.options.map((opt, i) => {
                const selected = answers[currentQ] === i;
                return (
                  <button
                    key={i}
                    onClick={() => selectAnswer(i)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      selected ? 'border-primary bg-primary/10 font-medium' : 'border-border hover:border-primary/30'
                    }`}
                  >
                    <span className="mr-3 text-sm font-bold text-muted-foreground">{String.fromCharCode(65 + i)}.</span>
                    {opt}
                  </button>
                );
              })}
            </div>
          ) : (
            <textarea
              value={(answers[currentQ] as string) || ''}
              onChange={e => setEssayAnswer(e.target.value)}
              placeholder="Tulis jawabanmu di sini..."
              className="w-full h-32 p-4 rounded-xl border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          )}
        </motion.div>
      </AnimatePresence>

      <button
        onClick={nextQuestion}
        disabled={answers[currentQ] === null || answers[currentQ] === ''}
        className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium disabled:opacity-40"
      >
        {currentQ < questions.length - 1 ? 'Selanjutnya' : 'Lihat Hasil'}
      </button>
    </motion.div>
  );
};

export default SubjectQuiz;
