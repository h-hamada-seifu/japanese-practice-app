import { useState, useRef, useCallback } from 'react';

export type RecordingState = 'idle' | 'recording' | 'paused' | 'stopped';

export interface UseAudioRecorderReturn {
  recordingState: RecordingState;
  audioURL: string | null;
  audioBlob: Blob | null;
  duration: number;
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  clearRecording: () => void;
}

export const useAudioRecorder = (): UseAudioRecorderReturn => {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // タイマーをクリア
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // 録音時間を更新
  const updateDuration = useCallback(() => {
    const elapsed = Date.now() - startTimeRef.current - pausedTimeRef.current;
    setDuration(Math.floor(elapsed / 1000));
  }, []);

  // 録音開始
  const startRecording = useCallback(async () => {
    try {
      setError(null);
      audioChunksRef.current = [];

      // マイク許可を取得
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;

      // MediaRecorderを作成（WebM形式）
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      // データが利用可能になったときのハンドラ
      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // 録音停止時のハンドラ
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setAudioURL(url);
        setRecordingState('stopped');
        clearTimer();

        // ストリームを停止
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };

      // エラーハンドラ
      mediaRecorder.onerror = (event: Event) => {
        const errorEvent = event as ErrorEvent;
        setError(`録音エラー: ${errorEvent.message || '不明なエラー'}`);
        setRecordingState('idle');
        clearTimer();
      };

      // 録音開始
      mediaRecorder.start(1000); // 1秒ごとにデータを取得
      setRecordingState('recording');
      startTimeRef.current = Date.now();
      pausedTimeRef.current = 0;
      setDuration(0);

      // タイマー開始
      timerRef.current = setInterval(updateDuration, 100);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '不明なエラー';
      if (
        errorMessage.includes('Permission denied') ||
        errorMessage.includes('NotAllowedError')
      ) {
        setError(
          'マイクへのアクセスが拒否されました。ブラウザの設定でマイクの許可を有効にしてください。'
        );
      } else if (errorMessage.includes('NotFoundError')) {
        setError(
          'マイクが見つかりませんでした。マイクが接続されているか確認してください。'
        );
      } else {
        setError(`録音開始エラー: ${errorMessage}`);
      }
      setRecordingState('idle');
    }
  }, [clearTimer, updateDuration]);

  // 録音停止
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState !== 'idle') {
      mediaRecorderRef.current.stop();
    }
  }, [recordingState]);

  // 録音一時停止
  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState === 'recording') {
      mediaRecorderRef.current.pause();
      setRecordingState('paused');
      clearTimer();
      pausedTimeRef.current = Date.now() - startTimeRef.current;
    }
  }, [recordingState, clearTimer]);

  // 録音再開
  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState === 'paused') {
      mediaRecorderRef.current.resume();
      setRecordingState('recording');
      startTimeRef.current = Date.now() - pausedTimeRef.current;
      timerRef.current = setInterval(updateDuration, 100);
    }
  }, [recordingState, updateDuration]);

  // 録音クリア
  const clearRecording = useCallback(() => {
    // 既存のURLを解放
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }

    setAudioURL(null);
    setAudioBlob(null);
    setDuration(0);
    setRecordingState('idle');
    setError(null);
    audioChunksRef.current = [];
    clearTimer();
  }, [audioURL, clearTimer]);

  return {
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
  };
};
