import { ArrowLeft, ExternalLink, Database, RefreshCw, AlertTriangle, Lock, Volume2 } from 'lucide-react';
import { useUserNotionData } from '../hooks/useUserNotionData';

interface ChunkNotionViewerProps {
  onBack?: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  'Done': 'bg-green-100 text-green-700 border-green-200',
  'In progress': 'bg-blue-100 text-blue-700 border-blue-200',
  'Not started': 'bg-gray-100 text-gray-600 border-gray-200',
  'Review': 'bg-amber-100 text-amber-700 border-amber-200',
};

function StatusBadge({ status }: { status: string }) {
  if (!status) return null;
  const colorClass = STATUS_COLORS[status] || 'bg-gray-100 text-gray-600 border-gray-200';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>
      {status}
    </span>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-gray-100 animate-pulse">
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
        <div className="h-3 bg-gray-100 rounded w-1/3" />
      </div>
      <div className="h-6 w-16 bg-gray-200 rounded-full" />
    </div>
  );
}

export default function ChunkNotionViewer({ onBack }: ChunkNotionViewerProps) {
  const { data, loading, error, notionDbUrl, refetch } = useUserNotionData('chunk');

  const isUpgradeNeeded = error?.includes('アップグレード');

  const handleOpenNotion = () => {
    if (notionDbUrl) {
      window.open(notionDbUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
                >
                  <ArrowLeft className="h-6 w-6 text-gray-600" />
                </button>
              )}
              <div className="p-2 bg-blue-100 rounded-lg">
                <Database className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">チャンク</h1>
                <p className="text-sm text-gray-500">学習データベース</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!loading && !error && (
                <button
                  onClick={refetch}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 text-gray-500 hover:text-gray-700"
                  title="更新"
                >
                  <RefreshCw className="h-5 w-5" />
                </button>
              )}
              {notionDbUrl && (
                <button
                  onClick={handleOpenNotion}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-md"
                >
                  <ExternalLink className="h-4 w-4" />
                  Notionで開く
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="h-5 bg-gray-200 rounded w-40 animate-pulse" />
            </div>
            {[...Array(8)].map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {isUpgradeNeeded ? (
              <div className="p-12 flex flex-col items-center text-center">
                <div className="p-4 bg-amber-50 rounded-full mb-4">
                  <Lock className="h-10 w-10 text-amber-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Notion設定が未完了です</h2>
                <p className="text-gray-500 mb-6 max-w-sm">
                  このコンテンツを利用するにはアップグレードが必要です。<br />
                  事務局までご連絡ください。
                </p>
              </div>
            ) : (
              <div className="p-12 flex flex-col items-center text-center">
                <div className="p-4 bg-red-50 rounded-full mb-4">
                  <AlertTriangle className="h-10 w-10 text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">エラーが発生しました</h2>
                <p className="text-gray-500 mb-2 max-w-sm text-sm leading-relaxed">{error}</p>
                <p className="text-gray-400 text-sm mb-6">問題が続く場合は事務局にお問い合わせください。</p>
                <button
                  onClick={refetch}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-200"
                >
                  <RefreshCw className="h-4 w-4" />
                  再試行
                </button>
              </div>
            )}
          </div>
        )}

        {!loading && !error && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-800">チャンクリスト</h2>
                <p className="text-xs text-gray-400 mt-0.5">{data.length} 件</p>
              </div>
            </div>

            {data.length === 0 ? (
              <div className="py-16 flex flex-col items-center text-center">
                <Database className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-400">データがありません</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {data.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 leading-snug truncate">
                        {item.name || '(無題)'}
                      </p>
                      {item.sound && (
                        <div className="flex items-center gap-1 mt-1">
                          <Volume2 className="h-3 w-3 text-gray-400 flex-shrink-0" />
                          <span className="text-xs text-gray-500 truncate">{item.sound}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <StatusBadge status={item.status} />
                      {item.notionUrl && (
                        <a
                          href={item.notionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-md text-gray-300 hover:text-blue-600 hover:bg-blue-50 transition-all opacity-0 group-hover:opacity-100"
                          title="Notionで開く"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
