import { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, ExternalLink, RefreshCw, Settings, AlertCircle, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface NotionItem {
  id: string;
  title: string;
  status: string;
  select: string;
  richTexts: Record<string, string>;
  notionUrl: string;
  createdTime: string;
  lastEditedTime: string;
}

interface VocabularyNotionViewerProps {
  onBack?: () => void;
}

export default function VocabularyNotionViewer({ onBack }: VocabularyNotionViewerProps) {
  const [items, setItems] = useState<NotionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNotConfigured, setIsNotConfigured] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    setIsNotConfigured(false);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('ログインが必要です');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notion-database-query`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ db_type: 'vocab' }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (data.not_configured) {
          setIsNotConfigured(true);
        } else {
          throw new Error(data.error || 'データの取得に失敗しました');
        }
        return;
      }

      setItems(data.results || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
              <div className="p-2 bg-green-100 rounded-lg">
                <BookOpen className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ボキャブラ</h1>
                <p className="text-sm text-gray-500">
                  {loading ? '読み込み中...' : isNotConfigured ? '未設定' : `${items.length}件`}
                </p>
              </div>
            </div>
            {!loading && !isNotConfigured && !error && (
              <button
                onClick={fetchData}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 text-gray-500 hover:text-green-600"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 text-sm">Notionからデータを取得中...</p>
          </div>
        )}

        {!loading && isNotConfigured && (
          <div className="bg-white rounded-2xl shadow-sm border border-amber-200 p-10 text-center max-w-md mx-auto mt-8">
            <div className="flex justify-center mb-5">
              <div className="p-4 bg-amber-100 rounded-full">
                <Settings className="h-10 w-10 text-amber-600" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Notion設定が未完了です</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              設定画面でNotion APIキーと<br />語彙DB IDを登録してください。
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-8 max-w-lg mx-auto mt-8">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h2 className="text-base font-semibold text-gray-900 mb-1">エラーが発生しました</h2>
                <p className="text-red-600 text-sm mb-4">{error}</p>
                <button
                  onClick={fetchData}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  再試行
                </button>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && !isNotConfigured && items.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 text-center mt-8">
            <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400">データが見つかりませんでした</p>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="grid gap-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-gray-100 hover:border-green-200 hover:shadow-md transition-all duration-200"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 mb-2 truncate">
                        {item.title || '(無題)'}
                      </h3>
                      {Object.keys(item.richTexts).length > 0 && (
                        <div className="space-y-1 mb-3">
                          {Object.entries(item.richTexts).map(([key, val]) => (
                            <p key={key} className="text-sm text-gray-600 truncate">
                              <span className="font-medium text-gray-400 mr-1">{key}:</span>{val}
                            </p>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-2 flex-wrap mt-1">
                        {item.status && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            {item.status}
                          </span>
                        )}
                        {item.select && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                            {item.select}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Calendar className="h-3 w-3" />
                          {formatDate(item.lastEditedTime)}
                        </span>
                      </div>
                    </div>
                    <a
                      href={item.notionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 p-2 text-gray-300 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
