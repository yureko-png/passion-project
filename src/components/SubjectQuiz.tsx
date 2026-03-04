import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Brain, FlaskConical, Languages, Loader2, CheckCircle2, XCircle, Upload, FileText, Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

type Subject = 'math' | 'science' | 'english';

interface Question {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
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
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadedMaterial, setUploadedMaterial] = useState('');
  const [materialFileName, setMaterialFileName] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMaterialFileName(file.name);
    const text = await file.text();
    setUploadedMaterial(text.slice(0, 3000)); // limit context
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
        body: { subject: subj, material: uploadedMaterial || undefined },
      });
      if (error) throw error;
      setQuestions(data.questions || []);
      setAnswers(new Array(data.questions?.length || 0).fill(null));
    } catch (err) {
      console.error('Quiz generation error:', err);
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

  const nextQuestion = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setShowResult(true);
    }
  };

  const score = answers.filter((a, i) => a === questions[i]?.correct).length;

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
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-primary/10">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">Latihan Soal</h3>
              <p className="text-xs text-muted-foreground">Pilih mata pelajaran untuk mulai kuis AI</p>
            </div>
          </div>

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
        <p className="text-muted-foreground">Ako sedang membuat soal untukmu, Sensei~</p>
      </div>
    );
  }

  // Result screen
  if (showResult) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8 text-center space-y-6">
        <Trophy className="w-16 h-16 text-primary mx-auto" />
        <h2 className="text-3xl font-bold">{pct}%</h2>
        <p className="text-lg">{score} / {questions.length} benar</p>
        <p className="text-muted-foreground">
          {pct >= 80 ? 'Sugoi! Kamu luar biasa, Sensei! 🎉' : pct >= 50 ? 'Lumayan! Terus berlatih ya~ 💪' : 'Jangan menyerah, Sensei! Coba lagi~ 📚'}
        </p>

        {/* Show answers review */}
        <div className="space-y-3 text-left max-h-60 overflow-y-auto">
          {questions.map((q, i) => (
            <div key={i} className={`p-3 rounded-xl text-sm ${answers[i] === q.correct ? 'bg-mint/10' : 'bg-destructive/10'}`}>
              <p className="font-medium mb-1">{i + 1}. {q.question}</p>
              <p className="text-xs text-muted-foreground">{q.explanation}</p>
            </div>
          ))}
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
        <span className="text-sm font-medium text-primary">{subjectConfig[subject].label}</span>
        <span className="text-xs text-muted-foreground">{currentQ + 1} / {questions.length}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div animate={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} className="h-full bg-primary rounded-full" />
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div key={currentQ} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
          <h3 className="text-lg font-semibold mb-4">{q.question}</h3>
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
        </motion.div>
      </AnimatePresence>

      <button
        onClick={nextQuestion}
        disabled={answers[currentQ] === null}
        className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium disabled:opacity-40"
      >
        {currentQ < questions.length - 1 ? 'Selanjutnya' : 'Lihat Hasil'}
      </button>
    </motion.div>
  );
};

export default SubjectQuiz;
