import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Upload, Loader2, BookOpen, Lightbulb, BookMarked, Quote, Copy, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

type SummaryMode = 'quick' | 'study' | 'deep' | 'simplified';

interface SummaryResult {
  summary: string;
  keyPoints: string[];
  importantTerms: { term: string; definition: string }[];
  citation: string;
}

const modes: { id: SummaryMode; label: string; desc: string; icon: React.ElementType }[] = [
  { id: 'quick', label: 'Quick Summary', desc: '1 paragraf inti', icon: Lightbulb },
  { id: 'study', label: 'Study Notes', desc: 'Poin-poin penting', icon: BookOpen },
  { id: 'deep', label: 'Deep Summary', desc: 'Ringkasan per bagian', icon: BookMarked },
  { id: 'simplified', label: 'Simplified', desc: 'Bahasa mudah', icon: FileText },
];

const ResearchSummarizer = () => {
  const [text, setText] = useState('');
  const [mode, setMode] = useState<SummaryMode>('quick');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'points' | 'terms' | 'citation'>('summary');
  const [fileName, setFileName] = useState('');
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const content = await file.text();
    setText(content.slice(0, 15000));
  };

  const handleSummarize = async () => {
    if (!text.trim() || text.trim().length < 50) {
      toast({ title: 'Teks terlalu pendek', description: 'Minimal 50 karakter untuk dirangkum.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('summarize-journal', {
        body: { text, mode },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Gagal merangkum', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    const full = `${result.summary}\n\nKey Points:\n${result.keyPoints.map(p => `• ${p}`).join('\n')}\n\nCitation: ${result.citation}`;
    navigator.clipboard.writeText(full);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setResult(null);
    setText('');
    setFileName('');
  };

  const resultTabs = [
    { id: 'summary', label: '📄 Summary', count: result?.summary ? 1 : 0 },
    { id: 'points', label: '🧩 Key Points', count: result?.keyPoints?.length || 0 },
    { id: 'terms', label: '📘 Terms', count: result?.importantTerms?.length || 0 },
    { id: 'citation', label: '📎 Citation', count: result?.citation ? 1 : 0 },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-primary/10">
            <BookMarked className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">AI Research Summarizer</h3>
            <p className="text-xs text-muted-foreground">Rangkum jurnal & artikel ilmiah dengan AI</p>
          </div>
        </div>

        {!result ? (
          <div className="space-y-5">
            {/* Mode selector */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {modes.map(m => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`p-3 rounded-xl text-left transition-all border-2 ${
                    mode === m.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/30'
                  }`}
                >
                  <m.icon className={`w-4 h-4 mb-1 ${mode === m.id ? 'text-primary' : 'text-muted-foreground'}`} />
                  <p className="text-xs font-medium">{m.label}</p>
                  <p className="text-[10px] text-muted-foreground">{m.desc}</p>
                </button>
              ))}
            </div>

            {/* File upload */}
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors"
            >
              <Upload className="w-5 h-5 text-muted-foreground" />
              <div className="text-left">
                <p className="text-sm font-medium">{fileName || 'Upload File (TXT/MD)'}</p>
                <p className="text-xs text-muted-foreground">Atau paste teks jurnal di bawah</p>
              </div>
              {fileName && <FileText className="w-5 h-5 text-primary ml-auto" />}
            </button>
            <input ref={fileRef} type="file" accept=".txt,.md" className="hidden" onChange={handleFileUpload} />

            {/* Text input */}
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Paste teks jurnal / artikel di sini..."
              className="w-full h-40 p-4 rounded-xl border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
            />

            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{text.length.toLocaleString()} karakter</span>
              <button
                onClick={handleSummarize}
                disabled={loading || text.trim().length < 50}
                className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium disabled:opacity-40 flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookMarked className="w-4 h-4" />}
                {loading ? 'Merangkum...' : 'Rangkum'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Result tabs */}
            <div className="flex gap-1 overflow-x-auto">
              {resultTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  {tab.label} {tab.count > 0 && `(${tab.count})`}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {activeTab === 'summary' && (
                  <div className="p-4 rounded-xl bg-secondary/50 text-sm leading-relaxed whitespace-pre-wrap">
                    {result.summary}
                  </div>
                )}
                {activeTab === 'points' && (
                  <div className="space-y-2">
                    {result.keyPoints.map((point, i) => (
                      <div key={i} className="flex gap-3 p-3 rounded-xl bg-secondary/50">
                        <span className="text-primary font-bold text-sm">{i + 1}.</span>
                        <p className="text-sm">{point}</p>
                      </div>
                    ))}
                  </div>
                )}
                {activeTab === 'terms' && (
                  <div className="space-y-2">
                    {result.importantTerms.map((t, i) => (
                      <div key={i} className="p-3 rounded-xl bg-secondary/50">
                        <p className="text-sm font-semibold text-primary">{t.term}</p>
                        <p className="text-xs text-muted-foreground">{t.definition}</p>
                      </div>
                    ))}
                    {result.importantTerms.length === 0 && <p className="text-sm text-muted-foreground">Tidak ada istilah terdeteksi.</p>}
                  </div>
                )}
                {activeTab === 'citation' && (
                  <div className="p-4 rounded-xl bg-secondary/50 flex items-start gap-3">
                    <Quote className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm italic">{result.citation || 'Sitasi tidak dapat dideteksi dari teks.'}</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex gap-3">
              <button onClick={reset} className="px-4 py-2 rounded-xl bg-secondary text-foreground text-sm font-medium">Rangkum Lagi</button>
              <button onClick={copyToClipboard} className="px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-medium flex items-center gap-2">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy All'}
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ResearchSummarizer;
