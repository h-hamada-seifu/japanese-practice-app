'use client';

import { useAudioRecorder } from '@/hooks/useAudioRecorder';

interface AudioRecorderProps {
  onRecordingComplete?: (blob: Blob, url: string) => void;
  maxDuration?: number; // 最大録音時間（秒）
}

export const Recorder: React.FC<AudioRecorderProps> = ({
  onRecordingComplete,
  maxDuration = 300, // デフォルト5分
}) => {
  const {
    recordingState,
    audioURL,
    audioBlob,
    duration,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    clearRecording,
  } = useAudioRecorder();

  // 録音時間を分:秒形式にフォーマット
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 最大録音時間に達したら自動停止
  if (recordingState === 'recording' && duration >= maxDuration) {
    stopRecording();
  }

  // 録音完了時のコールバック
  const handleStopRecording = () => {
    stopRecording();
    if (audioBlob && audioURL && onRecordingComplete) {
      onRecordingComplete(audioBlob, audioURL);
    }
  };

  // 録音状態に応じたメッセージ
  const getStatusMessage = () => {
    switch (recordingState) {
      case 'recording':
        return '録音中...';
      case 'paused':
        return '一時停止中';
      case 'stopped':
        return '録音完了';
      default:
        return 'マイクボタンを押して録音を開始してください';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      {/* エラー表示 */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* 録音状態表示 */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-2">
          {recordingState === 'recording' && (
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2"></div>
          )}
          <p className="text-lg font-medium text-gray-700">
            {getStatusMessage()}
          </p>
        </div>
        <p className="text-3xl font-bold text-gray-900">
          {formatDuration(duration)}
        </p>
        {maxDuration && (
          <p className="text-sm text-gray-500 mt-1">
            最大録音時間: {formatDuration(maxDuration)}
          </p>
        )}
      </div>

      {/* コントロールボタン */}
      <div className="flex justify-center gap-4 mb-6">
        {recordingState === 'idle' && (
          <button
            onClick={startRecording}
            className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                clipRule="evenodd"
              />
            </svg>
            録音開始
          </button>
        )}

        {recordingState === 'recording' && (
          <>
            <button
              onClick={pauseRecording}
              className="flex items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              一時停止
            </button>
            <button
              onClick={handleStopRecording}
              className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
                  clipRule="evenodd"
                />
              </svg>
              停止
            </button>
          </>
        )}

        {recordingState === 'paused' && (
          <>
            <button
              onClick={resumeRecording}
              className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
              再開
            </button>
            <button
              onClick={handleStopRecording}
              className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
                  clipRule="evenodd"
                />
              </svg>
              停止
            </button>
          </>
        )}

        {recordingState === 'stopped' && audioURL && (
          <button
            onClick={clearRecording}
            className="flex items-center gap-2 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clipRule="evenodd"
              />
            </svg>
            新しく録音
          </button>
        )}
      </div>

      {/* 音声プレビュー */}
      {recordingState === 'stopped' && audioURL && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-2">
            録音プレビュー:
          </p>
          <audio
            src={audioURL}
            controls
            className="w-full"
            preload="metadata"
          />
          <p className="text-xs text-gray-500 mt-2">
            形式: WebM | 長さ: {formatDuration(duration)}
          </p>
        </div>
      )}
    </div>
  );
};
