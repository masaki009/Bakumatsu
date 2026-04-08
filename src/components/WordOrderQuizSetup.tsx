import { ArrowLeft } from 'lucide-react';

const GENRES = [
  '国内ニュース',
  '海外ニュース',
  '一般会話',
  'ビジネス',
  '旅行',
  '健康・医療',
];

const DIFFICULTIES = [
  { id: '初級', label: '初級', desc: '短くシンプルな文・4〜6ブロック' },
  { id: '中級', label: '中級', desc: '場所・時間・頻度表現を含む・5〜7ブロック' },
  { id: '上級', label: '上級', desc: '複文・受動態・条件節など・6〜8ブロック' },
];

interface Props {
  selectedGenres: string[];
  difficulty: string;
  isLoading: boolean;
  onToggleGenre: (genre: string) => void;
  onSelectDifficulty: (d: string) => void;
  onStart: () => void;
  onBack: () => void;
}

export default function WordOrderQuizSetup({
  selectedGenres,
  difficulty,
  isLoading,
  onToggleGenre,
  onSelectDifficulty,
  onStart,
  onBack,
}: Props) {
  const canStart = selectedGenres.length > 0 && difficulty !== '' && !isLoading;

  return (
    <div className="min-h-screen bg-[#1a1a2e] flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-[480px]">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={onBack}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">語順クイズ</h1>
            <p className="text-sm text-gray-400 mt-0.5">日本語→英語 語順並び替え</p>
          </div>
        </div>

        <section className="mb-8">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            ジャンル選択（複数可）
          </h2>
          <div className="flex flex-wrap gap-2">
            {GENRES.map((g) => {
              const active = selectedGenres.includes(g);
              return (
                <button
                  key={g}
                  onClick={() => onToggleGenre(g)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    active
                      ? 'bg-[#534AB7] text-white shadow-lg shadow-[#534AB7]/30'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {g}
                </button>
              );
            })}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            難易度選択
          </h2>
          <div className="space-y-3">
            {DIFFICULTIES.map((d) => {
              const active = difficulty === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => onSelectDifficulty(d.id)}
                  className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all ${
                    active
                      ? 'border-[#534AB7] bg-[#534AB7]/20 shadow-lg shadow-[#534AB7]/20'
                      : 'border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10'
                  }`}
                >
                  <span className={`font-bold text-base ${active ? 'text-white' : 'text-gray-300'}`}>
                    {d.label}
                  </span>
                  <p className="text-xs text-gray-400 mt-0.5">{d.desc}</p>
                </button>
              );
            })}
          </div>
        </section>

        <button
          onClick={onStart}
          disabled={!canStart}
          className={`w-full py-4 rounded-xl text-base font-bold transition-all ${
            canStart
              ? 'bg-[#534AB7] text-white hover:bg-[#4a41a3] shadow-xl shadow-[#534AB7]/40 active:scale-95'
              : 'bg-white/10 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              問題を生成中...
            </span>
          ) : (
            'スタート'
          )}
        </button>
      </div>
    </div>
  );
}
