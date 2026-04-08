import { useState } from 'react';
import { Lightbulb, CheckCircle, XCircle, ArrowRight, Home } from 'lucide-react';

interface Question {
  japanese: string;
  blocks: string[];
  answer: string[];
  english: string;
  hint: string;
}

interface Props {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  placedBlocks: string[];
  onPlaceBlock: (word: string) => void;
  onRemoveBlock: (index: number) => void;
  onNext: (isCorrect: boolean) => void;
  onBack: () => void;
}

export default function WordOrderQuizQuestion({
  question,
  questionNumber,
  totalQuestions,
  placedBlocks,
  onPlaceBlock,
  onRemoveBlock,
  onNext,
  onBack,
}: Props) {
  const [showHint, setShowHint] = useState(false);
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const usedCounts: Record<string, number> = {};
  placedBlocks.forEach((w) => { usedCounts[w] = (usedCounts[w] || 0) + 1; });

  const availableBlocks = question.blocks.filter((w) => {
    if (usedCounts[w] > 0) {
      usedCounts[w]--;
      return false;
    }
    return true;
  });

  const handleCheck = () => {
    const correct =
      placedBlocks.length === question.answer.length &&
      placedBlocks.every((w, i) => w === question.answer[i]);
    setIsCorrect(correct);
    setChecked(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center px-4 py-6">
      <div className="w-full max-w-[480px] flex flex-col gap-5">

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-500">
              問題 {questionNumber} / {totalQuestions}
            </span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${((questionNumber - 1) / totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl px-5 py-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">日本語文</p>
          <p className="text-lg font-bold text-slate-800 leading-relaxed">{question.japanese}</p>
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">英語の語順に並べてください</p>
          <div
            className="min-h-[60px] flex flex-wrap gap-2 bg-white border-2 border-dashed border-slate-300 rounded-2xl px-4 py-3 shadow-inner"
          >
            {placedBlocks.length === 0 && (
              <span className="text-slate-400 text-sm italic">下のブロックをタップして並べてください</span>
            )}
            {placedBlocks.map((word, i) => (
              <button
                key={i}
                onClick={() => !checked && onRemoveBlock(i)}
                className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all active:scale-95 ${
                  checked
                    ? isCorrect
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-300 cursor-default'
                      : 'bg-red-100 text-red-700 border border-red-300 cursor-default'
                    : 'bg-blue-500 text-white hover:bg-blue-600 shadow-sm'
                }`}
              >
                {word}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">選択肢（タップして追加）</p>
          <div className="flex flex-wrap gap-2 min-h-[48px]">
            {availableBlocks.map((word, i) => (
              <button
                key={i}
                onClick={() => !checked && onPlaceBlock(word)}
                disabled={checked}
                className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-full text-sm font-semibold hover:bg-slate-50 hover:border-blue-400 active:scale-95 transition-all shadow-sm disabled:opacity-40 disabled:cursor-default"
              >
                {word}
              </button>
            ))}
          </div>
        </div>

        {showHint && (
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <Lightbulb size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">{question.hint}</p>
          </div>
        )}

        {checked && (
          <div className={`rounded-2xl px-4 py-4 ${isCorrect ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center gap-2 mb-3">
              {isCorrect ? (
                <CheckCircle size={18} className="text-emerald-500" />
              ) : (
                <XCircle size={18} className="text-red-500" />
              )}
              <span className={`font-bold text-base ${isCorrect ? 'text-emerald-700' : 'text-red-700'}`}>
                {isCorrect ? '正解！' : '不正解'}
              </span>
            </div>

            {!isCorrect && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-slate-500 mb-1">正しい語順：</p>
                <p className="text-sm text-slate-700 font-medium">{question.answer.join(' → ')}</p>
              </div>
            )}

            <div className="pt-3 border-t border-black/10">
              <p className="text-xs font-semibold text-slate-500 mb-1">英文</p>
              <p className="text-base text-slate-800 font-bold">{question.english}</p>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          {!checked && (
            <button
              onClick={() => setShowHint((v) => !v)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm font-semibold hover:bg-amber-100 transition-colors"
            >
              <Lightbulb size={16} />
              ヒント
            </button>
          )}

          {checked && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              <Home size={16} />
              メニュー
            </button>
          )}

          {!checked ? (
            <button
              onClick={handleCheck}
              disabled={placedBlocks.length === 0}
              className="flex-1 py-3 rounded-xl bg-blue-500 text-white font-bold text-sm hover:bg-blue-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
            >
              答え合わせ
            </button>
          ) : (
            <button
              onClick={() => onNext(isCorrect)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-500 text-white font-bold text-sm hover:bg-blue-600 transition-colors shadow-md"
            >
              {questionNumber < totalQuestions ? '次の問題' : '結果を見る'}
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
