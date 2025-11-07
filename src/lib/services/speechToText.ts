import { SpeechClient } from '@google-cloud/speech';

/**
 * Google Speech-to-Text APIを使用して音声をテキストに変換
 * @param audioBuffer 音声ファイルのBuffer (WebM Opus形式)
 * @returns 文字起こし結果のテキスト
 */
export async function transcribeAudio(audioBuffer: Buffer): Promise<string> {
  // 環境変数からGoogle認証情報を取得
  const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

  if (!credentialsJson) {
    throw new Error(
      'GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable is not set'
    );
  }

  let credentials;
  try {
    credentials = JSON.parse(credentialsJson);
  } catch (error) {
    throw new Error(
      `Failed to parse GOOGLE_APPLICATION_CREDENTIALS_JSON: ${error}`
    );
  }

  // Speech-to-Textクライアントの初期化
  const client = new SpeechClient({
    credentials: {
      client_email: credentials.client_email,
      private_key: credentials.private_key,
    },
    projectId: credentials.project_id,
  });

  // 音声データの準備
  const audio = {
    content: audioBuffer.toString('base64'),
  };

  // 音声認識の設定
  const config = {
    encoding: 'WEBM_OPUS' as const,
    sampleRateHertz: 48000,
    languageCode: 'ja-JP',
    model: 'latest_long',
    enableAutomaticPunctuation: true,
  };

  // 音声認識の実行
  const [response] = await client.recognize({ audio, config });

  // 結果の取得
  if (!response.results || response.results.length === 0) {
    throw new Error(
      'No transcription results returned from Speech-to-Text API'
    );
  }

  const transcription = response.results
    .map((result) => result.alternatives?.[0]?.transcript || '')
    .join('')
    .trim();

  if (!transcription) {
    throw new Error('Transcription is empty');
  }

  return transcription;
}
