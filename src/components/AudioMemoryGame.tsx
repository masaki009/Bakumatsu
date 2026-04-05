import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RotateCcw, Volume2 } from 'lucide-react';

interface AudioMemoryGameProps {
  onBack: () => void;
}

interface Card {
  id: number;
  audioUrl: string;
  colorClass: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const AUDIO_URLS = [
  'https://raw.githubusercontent.com/masaki009/test123/main/1.mp3',
  'https://raw.githubusercontent.com/masaki009/test123/main/2.mp3',
  'https://raw.githubusercontent.com/masaki009/test123/main/3.mp3',
  'https://raw.githubusercontent.com/masaki009/test123/main/4.mp3',
  'https://raw.githubusercontent.com/masaki009/test123/main/5.mp3',
  'https://raw.githubusercontent.com/masaki009/test123/main/6.mp3',
  'https://raw.githubusercontent.com/masaki009/test123/main/7.mp3',
  'https://raw.githubusercontent.com/masaki009/test123/main/8.mp3',
  'https://raw.githubusercontent.com/masaki009/test123/main/9.mp3',
  'https://raw.githubusercontent.com/masaki009/test123/main/10.mp3',
  'https://raw.githubusercontent.com/masaki009/test123/main/11.mp3',
  'https://raw.githubusercontent.com/masaki009/test123/main/13.mp3'
];

const ENGLISH_TEXTS = [
'Are you alright？',
'May I help you？',
'Are you lost？',
'Where are you from？',
'Is it your first time in Japan？',
'How long are you staying in Japan?',
'Where are staying?',
'Please enjoy your trip in Japan.',
'Have you tried Monjayaki?',
'Do you know where I can find ATM?',
'Go down the street.',
'Could you tell me how to get Tokyo statio from here?'
];

const CARD_COLORS = [
  'bg-gradient-to-br from-blue-400 to-blue-600',
  'bg-gradient-to-br from-green-400 to-green-600',
  'bg-gradient-to-br from-pink-400 to-pink-600',
  'bg-gradient-to-br from-orange-400 to-orange-600',
  'bg-gradient-to-br from-purple-400 to-purple-600',
  'bg-gradient-to-br from-yellow-400 to-yellow-600',
  'bg-gradient-to-br from-red-400 to-red-600',
  'bg-gradient-to-br from-cyan-400 to-cyan-600',
  'bg-gradient-to-br from-teal-400 to-teal-600',
  'bg-gradient-to-br from-lime-400 to-lime-600',
  'bg-gradient-to-br from-rose-400 to-rose-600',
  'bg-gradient-to-br from-sky-400 to-sky-600',
];

export default function AudioMemoryGame({ onBack }: AudioMemoryGameProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [totalPairs, setTotalPairs] = useState(8);
  const [isDealing, setIsDealing] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [finalTime, setFinalTime] = useState<number | null>(null);
  const [popupText, setPopupText] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const popupTimeoutRef = useRef<number | null>(null);
  const completionTimeoutRef = useRef<number | null>(null);

  const playFlipSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  const playCorrectSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'sine';

    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2);

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  const playWrongSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'sawtooth';
    oscillator.frequency.value = 200;

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  };

  const playCardAudio = async (audioUrl: string) => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      await audio.play();
    } catch (error) {
      console.error('Audio playback failed:', error);
    }
  };

  const shuffleAndDeal = (pairCount: number) => {
    const selectedAudios = AUDIO_URLS.slice(0, pairCount);

    const cardPairs: Card[] = [];
    selectedAudios.forEach((audioUrl, index) => {
      const colorClass = CARD_COLORS[index % CARD_COLORS.length];
      cardPairs.push(
        {
          id: index * 2,
          audioUrl,
          colorClass,
          isFlipped: false,
          isMatched: false,
        },
        {
          id: index * 2 + 1,
          audioUrl,
          colorClass,
          isFlipped: false,
          isMatched: false,
        }
      );
    });

    for (let i = cardPairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cardPairs[i], cardPairs[j]] = [cardPairs[j], cardPairs[i]];
    }

    setIsDealing(true);
    setCards([]);
    setMoves(0);
    setMatchedPairs(0);
    setTotalPairs(pairCount);
    setFlippedCards([]);

    const dealDelay = cardPairs.length <= 8 ? 150 : cardPairs.length <= 12 ? 120 : 100;

    cardPairs.forEach((card, index) => {
      setTimeout(() => {
        setCards(prev => [...prev, card]);
        if (index === cardPairs.length - 1) {
          setTimeout(() => {
            setIsDealing(false);
            setGameStarted(true);
            const now = Date.now();
            setStartTime(now);
            setElapsedTime(0);
            setFinalTime(null);
          }, 300);
        }
      }, index * dealDelay);
    });
  };

  const handleCardClick = async (cardId: number) => {
    if (isChecking || isDealing || !gameStarted) return;

    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;
    if (flippedCards.includes(cardId)) return;

    playFlipSound();

    const newCards = cards.map(c =>
      c.id === cardId ? { ...c, isFlipped: true } : c
    );
    setCards(newCards);

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    await playCardAudio(card.audioUrl);

    if (newFlippedCards.length === 2) {
      setIsChecking(true);
      setMoves(prev => prev + 1);

      const [firstId, secondId] = newFlippedCards;
      const firstCard = cards.find(c => c.id === firstId);
      const secondCard = cards.find(c => c.id === secondId);

      setTimeout(() => {
        if (firstCard?.audioUrl === secondCard?.audioUrl) {
          playCorrectSound();
          setCards(prev =>
            prev.map(c =>
              c.id === firstId || c.id === secondId
                ? { ...c, isMatched: true }
                : c
            )
          );
          const newMatchedPairs = matchedPairs + 1;
          setMatchedPairs(newMatchedPairs);
          setFlippedCards([]);
          setIsChecking(false);

          const audioIndex = AUDIO_URLS.indexOf(firstCard.audioUrl);
          if (audioIndex !== -1 && ENGLISH_TEXTS[audioIndex]) {
            setPopupText(ENGLISH_TEXTS[audioIndex]);
            setShowPopup(true);

            if (popupTimeoutRef.current) {
              clearTimeout(popupTimeoutRef.current);
            }

            popupTimeoutRef.current = window.setTimeout(() => {
              setShowPopup(false);
              setTimeout(() => {
                setPopupText(null);
              }, 300);
            }, 3000);
          }

          if (newMatchedPairs === totalPairs) {
            if (completionTimeoutRef.current) {
              clearTimeout(completionTimeoutRef.current);
            }
            completionTimeoutRef.current = window.setTimeout(() => {
              setShowCompletionModal(true);
            }, 3500);
          }
        } else {
          playWrongSound();
          setTimeout(() => {
            setCards(prev =>
              prev.map(c =>
                c.id === firstId || c.id === secondId
                  ? { ...c, isFlipped: false }
                  : c
              )
            );
            setFlippedCards([]);
            setIsChecking(false);
          }, 800);
        }
      }, 1000);
    }
  };

  const resetGame = () => {
    setCards([]);
    setFlippedCards([]);
    setMoves(0);
    setMatchedPairs(0);
    setGameStarted(false);
    setIsDealing(false);
    setStartTime(null);
    setElapsedTime(0);
    setFinalTime(null);
    setPopupText(null);
    setShowPopup(false);
    setShowCompletionModal(false);
    if (timerRef.current) {
      cancelAnimationFrame(timerRef.current);
      timerRef.current = null;
    }
    if (popupTimeoutRef.current) {
      clearTimeout(popupTimeoutRef.current);
      popupTimeoutRef.current = null;
    }
    if (completionTimeoutRef.current) {
      clearTimeout(completionTimeoutRef.current);
      completionTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    if (gameStarted && startTime && matchedPairs < totalPairs) {
      const updateTimer = () => {
        const now = Date.now();
        setElapsedTime(Math.floor((now - startTime) / 1000));
        timerRef.current = requestAnimationFrame(updateTimer);
      };
      timerRef.current = requestAnimationFrame(updateTimer);
    } else if (matchedPairs === totalPairs && startTime && !finalTime) {
      const now = Date.now();
      const final = Math.floor((now - startTime) / 1000);
      setFinalTime(final);
      if (timerRef.current) {
        cancelAnimationFrame(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        cancelAnimationFrame(timerRef.current);
      }
    };
  }, [gameStarted, startTime, matchedPairs, finalTime, totalPairs]);

  useEffect(() => {
    return () => {
      if (popupTimeoutRef.current) {
        clearTimeout(popupTimeoutRef.current);
      }
      if (completionTimeoutRef.current) {
        clearTimeout(completionTimeoutRef.current);
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={18} />
                戻る
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">音声神経衰弱</h1>
                <p className="text-sm text-gray-600">カードをめくって同じ音声を見つけよう</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={resetGame}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RotateCcw size={18} />
                リセット
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-start items-start gap-8">
          <div className="flex flex-col gap-3">
            <div className="bg-orange-500 text-white px-6 py-3 rounded-lg shadow-lg">
              <div className="text-sm font-medium">手めくり数</div>
              <div className="text-3xl font-bold">{moves}</div>
            </div>
            <div className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg">
              <div className="text-sm font-medium">時間</div>
              <div className="text-3xl font-bold">{formatTime(elapsedTime)}</div>
            </div>
            <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
              <div className="text-sm font-medium">マッチ数</div>
              <div className="text-3xl font-bold">{matchedPairs} / {totalPairs}</div>
            </div>
          </div>

          <div className="flex-1">
            {!gameStarted && cards.length === 0 ? (
              <div className="flex justify-end">
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => shuffleAndDeal(4)}
                    disabled={isDealing}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-400 text-white px-10 py-4 rounded-xl text-xl font-bold shadow-xl transition-all transform hover:scale-105 disabled:transform-none"
                  >
                    {isDealing ? 'ディール中...' : 'シャッフル8枚'}
                  </button>
                  <button
                    onClick={() => shuffleAndDeal(6)}
                    disabled={isDealing}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-400 disabled:to-gray-400 text-white px-10 py-4 rounded-xl text-xl font-bold shadow-xl transition-all transform hover:scale-105 disabled:transform-none"
                  >
                    {isDealing ? 'ディール中...' : 'シャッフル12枚'}
                  </button>
                  <button
                    onClick={() => shuffleAndDeal(8)}
                    disabled={isDealing}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-400 disabled:to-gray-400 text-white px-10 py-4 rounded-xl text-xl font-bold shadow-xl transition-all transform hover:scale-105 disabled:transform-none"
                  >
                    {isDealing ? 'ディール中...' : 'シャッフル16枚'}
                  </button>
                </div>
              </div>
            ) : (
              <div className={`grid gap-2 ${
                cards.length <= 8 ? 'grid-cols-4 grid-rows-2' : cards.length <= 12 ? 'grid-cols-4 grid-rows-3' : 'grid-cols-4 grid-rows-4'
              }`}>
                {cards.map((card, index) => (
                  <div
                    key={card.id}
                    className="perspective-1000 cursor-pointer"
                    style={{
                      animation: isDealing ? `dealCard 0.5s ease-out ${index * 0.1}s both` : 'none',
                      width: cards.length <= 8 ? '120px' : cards.length <= 12 ? '100px' : '90px',
                      height: cards.length <= 8 ? '180px' : cards.length <= 12 ? '150px' : '135px',
                    }}
                    onClick={() => handleCardClick(card.id)}
                  >
                    <div
                      className={`relative w-full h-full transition-all duration-500 transform-style-3d ${
                        card.isFlipped || card.isMatched ? 'rotate-y-180' : ''
                      } ${card.isMatched ? 'scale-105' : 'hover:scale-105'}`}
                    >
                      <div className="absolute inset-0 backface-hidden">
                        <div className="w-full h-full bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg shadow-lg p-1">
                          <div className="w-full h-full border-2 border-blue-300 rounded flex items-center justify-center">
                            <div className={`bg-blue-200 rounded-full opacity-50 ${
                              cards.length <= 8 ? 'w-6 h-6' : 'w-5 h-5'
                            }`}></div>
                          </div>
                        </div>
                      </div>

                      <div className="absolute inset-0 backface-hidden rotate-y-180">
                        <div
                          className={`w-full h-full bg-white rounded-lg shadow-lg p-1 flex items-center justify-center border-2 border-gray-300 ${
                            card.isMatched ? 'animate-pulse ring-2 ring-yellow-400 bg-green-50' : ''
                          }`}
                        >
                          <Volume2 size={cards.length <= 8 ? 24 : 20} className={card.isMatched ? 'text-green-600' : 'text-gray-400'} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {popupText && (
          <div
            className={`fixed inset-0 flex items-center justify-center z-40 pointer-events-none transition-opacity duration-300 ${
              showPopup ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div
              className={`bg-white rounded-2xl px-8 py-6 max-w-2xl mx-4 shadow-2xl border-4 border-blue-500 transform transition-all duration-300 ${
                showPopup ? 'scale-100' : 'scale-95'
              }`}
            >
              <p className="text-2xl font-bold text-center text-gray-800">
                {popupText}
              </p>
            </div>
          </div>
        )}

        {showCompletionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
              <h2 className="text-3xl font-bold text-center mb-4 text-green-600">おめでとうございます!</h2>
              <p className="text-xl text-center mb-6 text-gray-700">
                全てのペアを見つけました!
              </p>
              <div className="bg-gray-100 rounded-lg p-4 mb-6 space-y-2">
                <p className="text-center text-lg">
                  <span className="text-gray-600">時間:</span>
                  <span className="font-bold text-2xl text-blue-600 ml-2">{formatTime(finalTime || elapsedTime)}</span>
                </p>
                <p className="text-center text-lg">
                  <span className="text-gray-600">手数:</span>
                  <span className="font-bold text-2xl text-orange-600 ml-2">{moves}</span>
                  <span className="text-gray-600 ml-1">手</span>
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={resetGame}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-bold transition-colors"
                >
                  もう一度
                </button>
                <button
                  onClick={onBack}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-bold transition-colors"
                >
                  メニューへ
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }

        .transform-style-3d {
          transform-style: preserve-3d;
        }

        .backface-hidden {
          backface-visibility: hidden;
        }

        .rotate-y-180 {
          transform: rotateY(180deg);
        }

        @keyframes dealCard {
          0% {
            opacity: 0;
            transform: translateY(-100px) scale(0.5) rotate(-10deg);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1) rotate(0deg);
          }
        }
      `}</style>
    </div>
  );
}
