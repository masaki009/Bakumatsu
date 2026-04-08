import { useState } from 'react';
import { Lightbulb, CheckCircle, XCircle, ArrowRight } from 'lucide-react';

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
}

export default function WordOrderQuizQuestion({
  question,
  questionNumber,
  totalQuestions,
  placedBlocks,
  onPlaceBlock,
  onRemoveBlock,
  onNext,
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
    <div className="min-h-screen bg-[#1a1a2e] flex flex-col items-center px-4 py-6">
      <div className="w-full max-w-[480px] flex flex-col gap-5">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-400">
              問題 {questionNumber} / {totalQuestions}
            </span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#534AB7] rounded-full transition-all duration-500"
              style={{ width: `${((questionNumber - 1) / totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">日本語文</p>
          <p className="text-lg font-semibold text-white leading-relaxed">{question.japanese}</p>
        </div>

        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">英語の語順に並べてください（日本語ブロック）</p>
          <div className="min-h-[60px] flex flex-wrap gap-2 bg-white/5 border-2 border-dashed border-white/20 rounded-2xl px-4 py-3">
            {placedBlocks.length === 0 && (
              <span className="text-gray-600 text-sm italic">ブロックをタップして並べてください</span>
            )}
            {placedBlocks.map((word, i) => (
              <button
                key={i}
                onClick={() => !checked && onRemoveBlock(i)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all active:scale-95 ${
                  checked
                    ? isCorrect
                      ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-500/40 cursor-default'
                      : 'bg-red-500/30 text-red-200 border border-red-500/40 cursor-default'
                    : 'bg-white text-gray-800 hover:bg-gray-100 shadow-sm'
                }`}
              >
                {word}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">ブロック</p>
          <div className="flex flex-wrap gap-2 min-h-[48px]">
            {availableBlocks.map((word, i) => (
              <button
                key={i}
                onClick={() => !checked && onPlaceBlock(word)}
                disabled={checked}
                className="px-3 py-1.5 bg-white text-gray-800 rounded-full text-sm font-medium hover:bg-gray-100 active:scale-95 transition-all shadow-sm disabled:opacity-40 disabled:cursor-default"
              >
                {word}
              </button>
            ))}
          </div>
        </div>

        {showHint && (
          <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3">
            <Lightbulb size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-200">{question.hint}</p>
          </div>
        )}

        {checked && (
          <div className={`rounded-xl px-4 py-4 ${isCorrect ? 'bg-emerald-500/15 border border-emerald-500/30' : 'bg-red-500/15 border border-red-500/30'}`}>
            <div className="flex items-center gap-2 mb-3">
              {isCorrect ? (
                <CheckCircle size={18} className="text-emerald-400" />
              ) : (
                <XCircle size={18} className="text-red-400" />
              )}
              <span className={`font-bold text-base ${isCorrect ? 'text-emerald-300' : 'text-red-300'}`}>
                {isCorrect ? '正解！' : '不正解'}
              </span>
            </div>

            {!isCorrect && (
              <div className="mb-3">
                <p className="text-xs text-gray-400 mb-1">正しい語順：</p>
                <p className="text-sm text-white font-medium">{question.answer.join(' → ')}</p>
              </div>
            )}

            <div className="pt-3 border-t border-white/10">
              <p className="text-xs text-gray-400 mb-1">英文</p>
              <p className="text-base text-white font-semibold">{question.english}</p>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          {!checked && (
            <button
              onClick={() => setShowHint((v) => !v)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-sm font-medium hover:bg-amber-500/25 transition-colors"
            >
              <Lightbulb size={16} />
              ヒント
            </button>
          )}
          {!checked ? (
            <button
              onClick={handleCheck}
              disabled={placedBlocks.length === 0}
              className="flex-1 py-3 rounded-xl bg-[#534AB7] text-white font-bold text-sm hover:bg-[#4a41a3] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#534AB7]/30"
            >
              答え合わせ
            </button>
          ) : (
            <button
              onClick={() => onNext(isCorrect)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#534AB7] text-white font-bold text-sm hover:bg-[#4a41a3] transition-colors shadow-lg shadow-[#534AB7]/30"
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
