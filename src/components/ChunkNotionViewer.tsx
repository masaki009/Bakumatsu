import { ArrowLeft, ExternalLink, Database, Info } from 'lucide-react';

interface ChunkNotionViewerProps {
  onBack?: () => void;
}

export default function ChunkNotionViewer({ onBack }: ChunkNotionViewerProps) {
  const notionUrl = 'https://www.notion.so/32b8e70327b38018836fdc1d1dedcb5d?v=32b8e70327b38127b17a000c012c6d83';

  const handleOpenNotion = () => {
    window.open(notionUrl, '_blank', 'noopener,noreferrer');
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
                <p className="text-sm text-gray-600">学習データベース</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-8 text-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Database className="h-10 w-10" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-2">チャンク学習データベース</h2>
                <p className="text-blue-100">Notionで学習内容を確認・管理できます</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Notionページを開きます</p>
                <p>以下のボタンをクリックすると、新しいタブでNotionページが開きます。</p>
              </div>
            </div>

            <button
              onClick={handleOpenNotion}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-6 px-8 rounded-xl transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg flex items-center justify-center gap-3 group"
            >
              <Database className="h-6 w-6" />
              <span className="text-lg">Notionで開く</span>
              <ExternalLink className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">このページについて</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• チャンク学習用のデータベース</li>
                <li>• 英語学習に必要なフレーズやパターンを管理</li>
                <li>• Notionで直接編集・追加が可能</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
