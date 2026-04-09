import { useState } from 'react';
import { Home, MapPin, Briefcase, Coffee, ArrowLeft, ChevronRight, BookOpen, CheckCircle, Loader2, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { getJSTDate } from '../utils/dateUtils';
import {
  PASSAGES,
  THEME_CONFIG,
  getPassagesByTheme,
  getPlainText,
  countWords,
  type Theme,
  type Passage,
} from '../data/slashReadingPassages';

interface Props {
  onBack: () => void;
}

type Step = 0 | 1 | 2;

const THEME_ICONS: Record<Theme, React.ElementType> = {
  daily: Home,
  travel: MapPin,
  work: Briefcase,
  food: Coffee,
};

const THEME_ORDER: Theme[] = ['daily', 'travel', 'work', 'food'];

const THEME_CARD_STYLES: Record<Theme, { bg: string; border: string; icon: string; badge: string }> = {
  daily: { bg: 'bg-blue-50 hover:bg-blue-100', border: 'border-blue-200 hover:border-blue-400', icon: 'text-blue-600 bg-blue-100', badge: 'bg-blue-100 text-blue-700' },
  travel: { bg: 'bg-teal-50 hover:bg-teal-100', border: 'border-teal-200 hover:border-teal-400', icon: 'text-teal-600 bg-teal-100', badge: 'bg-teal-100 text-teal-700' },
  work: { bg: 'bg-amber-50 hover:bg-amber-100', border: 'border-amber-200 hover:border-amber-400', icon: 'text-amber-600 bg-amber-100', badge: 'bg-amber-100 text-amber-700' },
  food: { bg: 'bg-rose-50 hover:bg-rose-100', border: 'border-rose-200 hover:border-rose-400', icon: 'text-rose-600 bg-rose-100', badge: 'bg-rose-100 text-rose-700' },
};

export default function SlashReading({ onBack }: Props) {
  const { user } = useAuth();
  const [phase, setPhase] = useState<'theme-select' | 'reading'>('theme-select');
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [passageIndex, setPassageIndex] = useState(0);
  const [step, setStep] = useState<Step>(0);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const themePassages = selectedTheme ? getPassagesByTheme(selectedTheme) : [];
  const currentPassage: Passage | null = themePassages[passageIndex] ?? null;
  const plainText = currentPassage ? getPlainText(currentPassage) : '';
  const wordCount = plainText ? countWords(plainText) : 0;

  const handleSelectTheme = (theme: Theme) => {
    setSelectedTheme(theme);
    setPassageIndex(0);
    setStep(0);
    setSaved(false);
    setSaveMessage(null);
    setPhase('reading');
  };

  const handleNext = () => {
    const nextIndex = passageIndex + 1;
    if (nextIndex < themePassages.length) {
      setPassageIndex(nextIndex);
    } else {
      setPassageIndex(0);
    }
    setStep(0);
    setSaved(false);
    setSaveMessage(null);
  };

  const handleBackToThemes = () => {
    setPhase('theme-select');
    setSelectedTheme(null);
    setPassageIndex(0);
    setStep(0);
    setSaved(false);
    setSaveMessage(null);
  };

  const handleSave = async () => {
    if (!user?.email || !user?.id || saved || saving) return;
    setSaving(true);
    setSaveMessage(null);
    try {
      const today = getJSTDate();
      const { error: insertError } = await supabase.from('ex_reading').insert({
        user_id: user.id,
        email: user.email,
        reading_date: today,
        words: wordCount,
        wpm: 0,
        is_reading_aloud: false,
      });
      if (insertError) throw insertError;

      const { data: diaryData, error: diaryReadError } = await supabase
        .from('s_diaries')
        .select('ex_reading')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!diaryReadError && diaryData) {
        await supabase
          .from('s_diaries')
          .update({ ex_reading: (diaryData.ex_reading ?? 0) + wordCount })
          .eq('user_id', user.id);
      } else {
        await supabase.from('s_diaries').insert({
          user_id: user.id,
          email: user.email,
          date: today,
          ex_reading: wordCount,
        });
      }

      setSaved(true);
      setSaveMessage({ type: 'success', text: `${wordCount}語を記録しました！` });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '保存中にエラーが発生しました';
      setSaveMessage({ type: 'error', text: msg });
    } finally {
      setSaving(false);
    }
  };

  if (phase === 'theme-select') {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center px-4 py-6">
        <div className="w-full max-w-[480px] flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800">スラッシュリーディング</h1>
              <p className="text-xs text-slate-500">テーマを選んでください</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {THEME_ORDER.map((theme) => {
              const Icon = THEME_ICONS[theme];
              const style = THEME_CARD_STYLES[theme];
              const count = getPassagesByTheme(theme).length;
              return (
                <button
                  key={theme}
                  onClick={() => handleSelectTheme(theme)}
                  className={`${style.bg} ${style.border} border-2 rounded-2xl p-5 flex flex-col items-center gap-3 transition-all active:scale-95 shadow-sm`}
                >
                  <div className={`p-3 rounded-xl ${style.icon}`}>
                    <Icon size={26} />
                  </div>
                  <div className="text-center">
                    <p className="text-base font-bold text-slate-800">{THEME_CONFIG[theme].label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{count}本</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl px-4 py-4 shadow-sm">
            <div className="flex items-start gap-3">
              <BookOpen size={16} className="text-slate-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-slate-500 leading-relaxed">
                <p className="font-semibold text-slate-600 mb-1">スラッシュリーディングとは</p>
                <p>英文を意味のかたまりごとにスラッシュで区切り、前から順番に読んでいく練習です。英語を英語のまま理解する速読力が身につきます。</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentPassage || !selectedTheme) return null;

  const themeStyle = THEME_CARD_STYLES[selectedTheme];
  const themeConfig = THEME_CONFIG[selectedTheme];
  const ThemeIcon = THEME_ICONS[selectedTheme];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center px-4 py-6">
      <div className="w-full max-w-[480px] flex flex-col gap-5">

        <div className="flex items-center gap-3">
          <button
            onClick={handleBackToThemes}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${themeStyle.badge}`}>
                <ThemeIcon size={11} />
                {themeConfig.label}
              </span>
              <span className="text-xs text-slate-400">
                {passageIndex + 1} / {themePassages.length}
              </span>
            </div>
            <h1 className="text-sm font-bold text-slate-700 mt-0.5">スラッシュリーディング</h1>
          </div>
        </div>

        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-400 rounded-full transition-all duration-500"
            style={{ width: `${((step) / 2) * 100}%` }}
          />
        </div>

        {step === 0 && (
          <>
            <div className="bg-white border border-slate-200 rounded-2xl px-6 py-6 shadow-sm min-h-[200px] flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">英文</p>
                <p className="text-[20px] text-slate-800 leading-[1.8] font-medium">{plainText}</p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">読んでみましょう</span>
                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">{wordCount}語</span>
              </div>
            </div>

            <button
              onClick={() => setStep(1)}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-blue-500 text-white font-bold text-sm hover:bg-blue-600 transition-colors shadow-md active:scale-95"
            >
              スラッシュ英文を見る
              <ChevronRight size={16} />
            </button>
          </>
        )}

        {step === 1 && (
          <>
            <div className="bg-white border border-slate-200 rounded-2xl px-6 py-6 shadow-sm min-h-[200px] flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">スラッシュ英文</p>
                <p className="text-[20px] text-slate-800 leading-[1.8] font-medium">
                  {currentPassage.chunks.map((chunk, i) => (
                    <span key={i}>
                      {chunk.en}
                      {i < currentPassage.chunks.length - 1 && (
                        <span className="text-blue-400 font-bold mx-1 select-none">/</span>
                      )}
                    </span>
                  ))}
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-100">
                <span className="text-xs text-slate-400">スラッシュごとに意味をつかんで前から読んでみましょう</span>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-teal-600 text-white font-bold text-sm hover:bg-teal-700 transition-colors shadow-md active:scale-95"
            >
              和訳を見る
              <ChevronRight size={16} />
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-5 py-3 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">チャンク対訳</p>
              </div>
              <div className="divide-y divide-slate-100">
                {currentPassage.chunks.map((chunk, i) => (
                  <div key={i} className="px-5 py-3.5 grid grid-cols-1 gap-1">
                    <p className="text-base font-semibold text-blue-700 leading-relaxed">{chunk.en}</p>
                    <p className="text-base text-slate-600 leading-relaxed">{chunk.ja}</p>
                  </div>
                ))}
              </div>
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">合計</span>
                <span className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-full">{wordCount}語</span>
              </div>
            </div>

            {saveMessage && (
              <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold ${
                saveMessage.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                {saveMessage.type === 'success' && <CheckCircle size={15} />}
                {saveMessage.text}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleBackToThemes}
                className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                <Home size={15} />
                メニュー
              </button>

              <button
                onClick={handleSave}
                disabled={saved || saving}
                className={`flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl text-sm font-semibold transition-colors border ${
                  saved
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700 cursor-default'
                    : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-50'
                }`}
              >
                {saving ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : saved ? (
                  <CheckCircle size={15} />
                ) : (
                  <Save size={15} />
                )}
                {saved ? '記録済み' : '記録する'}
              </button>

              <button
                onClick={handleNext}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-blue-500 text-white font-bold text-sm hover:bg-blue-600 transition-colors shadow-md"
              >
                次へ
                <ChevronRight size={16} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
