import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PenLine, Loader2, CheckCircle2, XCircle, ArrowRight, RotateCcw, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

type CheckMode = 'grammar' | 'academic' | 'ielts' | 'simple';

interface Correction {
  original: string;
  suggestion: string;
  reason: string;
  category: 'grammar' | 'vocabulary' | 'structure' | 'style';
}

interface GrammarResult {
  corrections: Correction[];
  correctedText: string;
  score: number;
  feedback: string;
  bandScore?: string;
}

const modeConfig: { id: CheckMode; label: string; desc: string }[] = [
  { id: 'grammar', label: '✏️ Grammar Only', desc: 'Cek tata bahasa saja' },
  { id: 'academic', label: '🎓 Academic', desc: 'Gaya penulisan akademik' },
  { id: 'ielts', label: '📄 IELTS Mode', desc: 'Evaluasi gaya IELTS' },
  { id: 'simple', label: '🧒 Simple English', desc: 'Sederhanakan teks' },
];

const categoryColors: Record<string, string> = {
  grammar: 'bg-red-500/10 text-red-400 border-red-500/20',
  vocabulary: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  structure: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  style: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

const GrammarChecker = () => {
  const [text, setText] = useState('');
  const [mode, setMode] = useState<CheckMode>('grammar');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GrammarResult | null>(null);
  const [showCorrected, setShowCorrected] = useState(false);

  const handleCheck = async () => {
    if (!text.trim() || text.trim().length < 5) {
      toast({ title: 'Teks terlalu pendek', variant: 'destructive' });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('check-grammar', {
        body: { text, mode },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Gagal memeriksa', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setText('');
    setShowCorrected(false);
  };

  const applyCorrections = () => {
    if (result?.correctedText) {
      setText(result.correctedText);
      setResult(null);
      setShowCorrected(false);
      toast({ title: 'Koreksi diterapkan ✓' });
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-primary/10">
            <PenLine className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">AI Grammar Checker</h3>
            <p className="text-xs text-muted-foreground">Periksa & perbaiki tulisan bahasa Inggrismu</p>
          </div>
        </div>

        {/* Mode selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
          {modeConfig.map(m => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`p-3 rounded-xl text-left transition-all border-2 ${
                mode === m.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/30'
              }`}
            >
              <p className="text-xs font-medium">{m.label}</p>
              <p className="text-[10px] text-muted-foreground">{m.desc}</p>
            </button>
          ))}
        </div>

        {/* Editor */}
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type or paste your English text here..."
          className="w-full h-40 p-4 rounded-xl border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono"
        />

        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-muted-foreground">{text.split(/\s+/).filter(Boolean).length} words</span>
          <button
            onClick={handleCheck}
            disabled={loading || text.trim().length < 5}
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium disabled:opacity-40 flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? 'Checking...' : 'Check Grammar'}
          </button>
        </div>

        {/* Results */}
        {result && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-4">
            {/* Score */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50">
              <div className={`text-3xl font-bold ${result.score >= 80 ? 'text-green-400' : result.score >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                {result.score}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Score</p>
                <p className="text-xs text-muted-foreground">{result.feedback}</p>
                {result.bandScore && <p className="text-xs text-primary mt-1">IELTS Band: {result.bandScore}</p>}
              </div>
              <div className="text-xs text-muted-foreground">
                {result.corrections.length} koreksi
              </div>
            </div>

            {/* Corrections list */}
            {result.corrections.length > 0 && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {result.corrections.map((c, i) => (
                  <div key={i} className={`p-3 rounded-xl border ${categoryColors[c.category] || 'bg-secondary/50 border-border'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider">{c.category}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="line-through opacity-60">{c.original}</span>
                      <ArrowRight className="w-3 h-3 shrink-0" />
                      <span className="font-medium">{c.suggestion}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{c.reason}</p>
                  </div>
                ))}
              </div>
            )}

            {result.corrections.length === 0 && (
              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <p className="text-sm text-green-400 font-medium">Tidak ada error ditemukan! Tulisanmu sudah bagus 🎉</p>
              </div>
            )}

            {/* Toggle corrected text */}
            {result.correctedText && result.corrections.length > 0 && (
              <div className="space-y-2">
                <button
                  onClick={() => setShowCorrected(!showCorrected)}
                  className="text-xs text-primary font-medium hover:underline"
                >
                  {showCorrected ? 'Sembunyikan' : 'Lihat'} teks yang sudah dikoreksi
                </button>
                {showCorrected && (
                  <div className="p-4 rounded-xl bg-secondary/50 text-sm whitespace-pre-wrap font-mono">
                    {result.correctedText}
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={reset} className="px-4 py-2 rounded-xl bg-secondary text-foreground text-sm font-medium flex items-center gap-2">
                <RotateCcw className="w-4 h-4" /> Reset
              </button>
              {result.corrections.length > 0 && (
                <button onClick={applyCorrections} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Terapkan Koreksi
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default GrammarChecker;
