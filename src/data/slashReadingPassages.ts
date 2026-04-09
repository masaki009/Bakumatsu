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
      { en: 'Last Tuesday morning, I found a stray cat sitting on my doorstep', ja: '先週の火曜日の朝、玄関先に捨て猫が座っているのを見つけました' },
      { en: 'looking miserable in the rain.', ja: '雨の中、惨めそうな様子で。' },
      { en: 'I gave it some leftover fish from dinner,', ja: '夕食の残り魚をあげたところ、' },
      { en: 'and it refused to leave after that.', ja: 'それ以来、立ち去ろうとしません。' },
      { en: 'My landlord does not allow pets,', ja: '大家はペット禁止ですが、' },
      { en: 'so I am currently hiding a cat named Tanaka under my bed.', ja: '現在、タナカという名の猫をベッドの下に隠しています。' },
    ],
  },
  {
    id: 'd2',
    theme: 'daily',
    chunks: [
      { en: 'On my way to work yesterday,', ja: '昨日、通勤途中に、' },
      { en: 'I sat next to a man on the train', ja: '電車で男性の隣に座りました' },
      { en: 'who was reading a book about how to talk to strangers.', ja: '見知らぬ人との話し方について書かれた本を読んでいる人の。' },
      { en: 'We made eye contact,', ja: '目が合った瞬間、' },
      { en: 'and he looked down at his book immediately.', ja: '彼はすぐに本に目を落としました。' },
      { en: 'Neither of us said a word for the entire forty-minute ride.', ja: '40分間の乗車中、私たちは一言も話しませんでした。' },
    ],
  },
  {
    id: 't1',
    theme: 'travel',
    chunks: [
      { en: 'During my trip to Kyoto last spring,', ja: '昨年の春、京都を旅行中に、' },
      { en: 'I lost my way while searching for a small temple in my guidebook.', ja: 'ガイドブックに載っていた小さなお寺を探して道に迷いました。' },
      { en: 'I ended up in a quiet neighborhood where nobody spoke English.', ja: '気づけば、英語が通じない静かな住宅街に迷い込んでいました。' },
      { en: 'A kind grandmother noticed my confused face', ja: '優しいおばあさんが私の困った顔に気づいて、' },
      { en: 'and walked me to the temple herself,', ja: '自らお寺まで連れて行ってくれました、' },
      { en: 'a twenty-minute detour from her own shopping.', ja: 'ご自身の買い物から20分も回り道をして。' },
    ],
  },
  {
    id: 't2',
    theme: 'travel',
    chunks: [
      { en: 'My flight to Bangkok was delayed by six hours,', ja: 'バンコク行きのフライトが6時間遅延したので、' },
      { en: 'so I decided to explore the airport.', ja: '空港内を探索することにしました。' },
      { en: 'I discovered a tiny noodle shop hidden behind a luggage store on the third floor.', ja: '3階の荷物店の裏に隠れた小さな麺料理店を見つけました。' },
      { en: 'The chef turned out to be a retired musician', ja: 'シェフは引退したミュージシャンで、' },
      { en: 'who played traditional Thai guitar for every customer', ja: 'すべてのお客さんのためにタイの伝統的なギターを演奏していました' },
      { en: 'while their food was being prepared.', ja: '料理が作られている間。' },
    ],
  },
  {
    id: 'w1',
    theme: 'work',
    chunks: [
      { en: 'My colleague accidentally sent a strongly worded complaint about our boss', ja: '同僚が先週月曜日、上司への強い不満のメールを' },
      { en: 'directly to our boss last Monday.', ja: 'うっかり上司本人に直接送ってしまいました。' },
      { en: 'The entire office went silent for three long minutes', ja: 'オフィス全体が3分間、静まり返り、' },
      { en: 'while everyone stared at their screens pretending to work.', ja: '全員が仕事しているふりをしながら画面をじっと見つめていました。' },
      { en: 'The boss replied with a single smiley face,', ja: '上司はスマイルマーク一つで返信してきました、' },
      { en: 'and nobody has ever mentioned the incident since.', ja: 'それ以来、誰もその件について一度も口にしていません。' },
    ],
  },
  {
    id: 'w2',
    theme: 'work',
    chunks: [
      { en: 'During an important online meeting last week,', ja: '先週、大切なオンライン会議の最中に、' },
      { en: 'my cat walked across my keyboard', ja: '私の猫がキーボードの上を歩いて' },
      { en: 'and sent a blank email to all forty clients on our mailing list.', ja: 'メーリングリストの40人全クライアントに空のメールを送信してしまいました。' },
      { en: 'My manager asked me to explain in the next team meeting.', ja: 'マネージャーに次のチーム会議で説明するよう求められました。' },
      { en: 'I prepared a very detailed PowerPoint presentation', ja: '私は非常に詳細なプレゼンを準備しました' },
      { en: "titled 'My Cat and Its Destructive Keyboard Habits.'", ja: '「私の猫と破壊的なキーボード癖」というタイトルの。' },
    ],
  },
  {
    id: 'f1',
    theme: 'food',
    chunks: [
      { en: 'I once ordered what I thought was mild chicken curry', ja: 'かつて、マイルドなチキンカレーを注文したつもりでした' },
      { en: 'at a small restaurant in Osaka.', ja: '大阪の小さなレストランで。' },
      { en: 'The owner smiled warmly and brought something', ja: 'オーナーはにっこりと笑ってある料理を持ってきました' },
      { en: 'that turned my face completely red within the very first bite.', ja: '一口目で顔が真っ赤になるようなものを。' },
      { en: 'After three glasses of cold milk,', ja: '冷たい牛乳を3杯飲んだ後、' },
      { en: 'she explained through gestures', ja: '彼女はジェスチャーで説明してくれました' },
      { en: 'that her grandfather was a famous chef from Chennai.', ja: 'おじいさんがチェンナイ出身の有名なシェフだったと。' },
    ],
  },
  {
    id: 'f2',
    theme: 'food',
    chunks: [
      { en: 'At a food festival in Tokyo last summer,', ja: '昨年の夏、東京の食のフェスティバルで、' },
      { en: "I tried a dish labeled only as 'mystery meat skewer' for two hundred yen.", ja: '「謎の肉串」と書かれた料理を200円で試してみました。' },
      { en: 'It was surprisingly delicious,', ja: '驚くほどおいしくて、' },
      { en: 'with a rich smoky flavor I had never tasted before.', ja: 'これまで味わったことのない深いスモーキーな風味でした。' },
      { en: 'Later the vendor revealed it was grilled crocodile imported from Australia.', ja: '後でお店の人が、それはオーストラリア産のグリルしたワニ肉だと教えてくれました。' },
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
