export interface Chunk {
  en: string;
  ja: string;
}

export interface Passage {
  id: string;
  theme: 'daily' | 'travel' | 'work' | 'food';
  chunks: Chunk[];
}

export type Theme = 'daily' | 'travel' | 'work' | 'food';

export interface ThemeConfig {
  label: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
}

export const THEME_CONFIG: Record<Theme, ThemeConfig> = {
  daily: {
    label: '日常',
    colorClass: 'blue',
    bgClass: 'bg-blue-50',
    borderClass: 'border-blue-400',
    textClass: 'text-blue-700',
  },
  travel: {
    label: '旅行',
    colorClass: 'teal',
    bgClass: 'bg-teal-50',
    borderClass: 'border-teal-400',
    textClass: 'text-teal-700',
  },
  work: {
    label: '仕事',
    colorClass: 'amber',
    bgClass: 'bg-amber-50',
    borderClass: 'border-amber-400',
    textClass: 'text-amber-700',
  },
  food: {
    label: '食べ物',
    colorClass: 'rose',
    bgClass: 'bg-rose-50',
    borderClass: 'border-rose-400',
    textClass: 'text-rose-700',
  },
};

export const PASSAGES: Passage[] = [
  {
    id: 'd1',
    theme: 'daily',
    chunks: [
      { en: 'Last Tuesday morning,', ja: '先週の火曜日の朝、' },
      { en: 'I found a stray cat', ja: '野良猫を見つけました' },
      { en: 'sitting on my doorstep', ja: '玄関先に座っている' },
      { en: 'looking miserable in the rain.', ja: '雨の中、惨めそうな様子で。' },
      { en: 'I gave it some leftover fish', ja: '残り物の魚をあげたところ、' },
      { en: 'from dinner,', ja: '夕食の残りの、' },
      { en: 'and it refused to leave after that.', ja: 'それ以来、立ち去ろうとしません。' },
      { en: 'My landlord does not allow pets,', ja: '大家はペット禁止ですが、' },
      { en: 'so I am currently hiding', ja: '現在、隠しています' },
      { en: 'a cat named Tanaka', ja: 'タナカという名の猫を' },
      { en: 'under my bed.', ja: 'ベッドの下に。' },
    ],
  },
  {
    id: 'd2',
    theme: 'daily',
    chunks: [
      { en: 'On my way to work yesterday,', ja: '昨日、通勤途中に、' },
      { en: 'I sat next to a man', ja: '男性の隣に座りました' },
      { en: 'on the train', ja: '電車の中で、' },
      { en: 'who was reading a book', ja: '本を読んでいる人の隣に' },
      { en: 'about how to talk to strangers.', ja: '見知らぬ人との話し方についての本を。' },
      { en: 'We made eye contact,', ja: '目が合った瞬間、' },
      { en: 'and he looked down', ja: '彼は目を落としました' },
      { en: 'at his book immediately.', ja: 'すぐに自分の本に。' },
      { en: 'Neither of us said a word', ja: '私たちは一言も話しませんでした' },
      { en: 'for the entire forty-minute ride.', ja: '40分間の乗車中ずっと。' },
    ],
  },
  {
    id: 't1',
    theme: 'travel',
    chunks: [
      { en: 'During my trip to Kyoto', ja: '京都を旅行中に、' },
      { en: 'last spring,', ja: '昨年の春、' },
      { en: 'I lost my way', ja: '道に迷いました' },
      { en: 'while searching for a small temple', ja: '小さなお寺を探しているときに' },
      { en: 'in my guidebook.', ja: 'ガイドブックに載っていた。' },
      { en: 'I ended up in a quiet neighborhood', ja: '静かな住宅街に迷い込みました' },
      { en: 'where nobody spoke English.', ja: '英語が通じない場所でした。' },
      { en: 'A kind grandmother', ja: '優しいおばあさんが' },
      { en: 'noticed my confused face', ja: '私の困った顔に気づいて、' },
      { en: 'and walked me to the temple herself,', ja: '自らお寺まで連れて行ってくれました、' },
      { en: 'a twenty-minute detour', ja: '20分も回り道をして' },
      { en: 'from her own shopping.', ja: 'ご自身の買い物から。' },
    ],
  },
  {
    id: 't2',
    theme: 'travel',
    chunks: [
      { en: 'My flight to Bangkok', ja: 'バンコク行きのフライトが' },
      { en: 'was delayed by six hours,', ja: '6時間遅延したので、' },
      { en: 'so I decided to explore the airport.', ja: '空港内を探索することにしました。' },
      { en: 'I discovered a tiny noodle shop', ja: '小さな麺料理店を見つけました' },
      { en: 'hidden behind a luggage store', ja: '荷物店の裏に隠れた' },
      { en: 'on the third floor.', ja: '3階の。' },
      { en: 'The chef turned out to be', ja: 'シェフは実は' },
      { en: 'a retired musician', ja: '引退したミュージシャンで、' },
      { en: 'who played traditional Thai guitar', ja: 'タイの伝統的なギターを演奏していました' },
      { en: 'for every customer', ja: 'すべてのお客さんのために' },
      { en: 'while their food was being prepared.', ja: '料理が作られている間。' },
    ],
  },
  {
    id: 'w1',
    theme: 'work',
    chunks: [
      { en: 'My colleague accidentally sent', ja: '同僚がうっかり送ってしまいました' },
      { en: 'a strongly worded complaint', ja: '強い不満のメールを' },
      { en: 'about our boss', ja: '上司についての' },
      { en: 'directly to our boss', ja: '上司本人に直接' },
      { en: 'last Monday.', ja: '先週の月曜日に。' },
      { en: 'The entire office went silent', ja: 'オフィス全体が静まり返りました' },
      { en: 'for three long minutes', ja: '3分間、' },
      { en: 'while everyone stared at their screens', ja: '全員が画面をじっと見つめながら' },
      { en: 'pretending to work.', ja: '仕事しているふりをして。' },
      { en: 'The boss replied', ja: '上司は返信してきました' },
      { en: 'with a single smiley face,', ja: 'スマイルマーク一つで、' },
      { en: 'and nobody has ever mentioned it since.', ja: 'それ以来、誰もその件を口にしていません。' },
    ],
  },
  {
    id: 'w2',
    theme: 'work',
    chunks: [
      { en: 'During an important online meeting', ja: '大切なオンライン会議の最中に、' },
      { en: 'last week,', ja: '先週、' },
      { en: 'my cat walked across my keyboard', ja: '私の猫がキーボードの上を歩いて' },
      { en: 'and sent a blank email', ja: '空のメールを送信してしまいました' },
      { en: 'to all forty clients', ja: '40人全クライアントに' },
      { en: 'on our mailing list.', ja: 'メーリングリストの。' },
      { en: 'My manager asked me to explain', ja: 'マネージャーに説明するよう求められました' },
      { en: 'in the next team meeting.', ja: '次のチーム会議で。' },
      { en: 'I prepared a very detailed presentation', ja: '私は非常に詳細なプレゼンを準備しました' },
      { en: "titled 'My Cat and Its Destructive Keyboard Habits.'", ja: '「私の猫と破壊的なキーボード癖」というタイトルの。' },
    ],
  },
  {
    id: 'f1',
    theme: 'food',
    chunks: [
      { en: 'I once ordered', ja: 'かつて私は注文しました' },
      { en: 'what I thought was mild chicken curry', ja: 'マイルドなチキンカレーだと思って' },
      { en: 'at a small restaurant in Osaka.', ja: '大阪の小さなレストランで。' },
      { en: 'The owner smiled warmly', ja: 'オーナーはにっこりと笑って' },
      { en: 'and brought something', ja: 'ある料理を持ってきました' },
      { en: 'that turned my face completely red', ja: '顔が真っ赤になるような' },
      { en: 'within the very first bite.', ja: '一口目で。' },
      { en: 'After three glasses of cold milk,', ja: '冷たい牛乳を3杯飲んだ後、' },
      { en: 'she explained through gestures', ja: '彼女はジェスチャーで説明してくれました' },
      { en: 'that her grandfather', ja: 'おじいさんが' },
      { en: 'was a famous chef from Chennai.', ja: 'チェンナイ出身の有名なシェフだったと。' },
    ],
  },
  {
    id: 'f2',
    theme: 'food',
    chunks: [
      { en: 'At a food festival in Tokyo', ja: '東京の食のフェスティバルで、' },
      { en: 'last summer,', ja: '昨年の夏、' },
      { en: 'I tried a dish', ja: '私はある料理を試してみました' },
      { en: "labeled only as 'mystery meat skewer'", ja: '「謎の肉串」と書かれた' },
      { en: 'for two hundred yen.', ja: '200円の料理を。' },
      { en: 'It was surprisingly delicious,', ja: '驚くほどおいしくて、' },
      { en: 'with a rich smoky flavor', ja: '深いスモーキーな風味で' },
      { en: 'I had never tasted before.', ja: 'これまで味わったことのない。' },
      { en: 'Later the vendor revealed', ja: '後でお店の人が明かしてくれました' },
      { en: 'it was grilled crocodile', ja: 'それはグリルしたワニ肉だと' },
      { en: 'imported from Australia.', ja: 'オーストラリア産の。' },
      { en: 'I bought three more skewers.', ja: '私はさらに3本追加で買いました。' },
    ],
  },
];

export function getPassagesByTheme(theme: Theme): Passage[] {
  return PASSAGES.filter((p) => p.theme === theme);
}

export function getPlainText(passage: Passage): string {
  return passage.chunks.map((c) => c.en).join(' ');
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
