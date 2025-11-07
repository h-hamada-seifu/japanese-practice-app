import { Feedback } from '@/types';

/**
 * Gemini 2.0 Flash APIを使用してフィードバックを生成
 * @param transcription 文字起こし結果
 * @param topicTitle 話題のタイトル
 * @returns フィードバックオブジェクト
 */
export async function generateFeedback(
  transcription: string,
  topicTitle: string
): Promise<Feedback> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }

  // Geminiへのプロンプト
  const prompt = `
あなたは日本語教師です。JLPT N2-N3レベルの留学生の発話を添削してください。

【話題】${topicTitle}
【学生の発話】
${transcription}

【出力形式】
以下のJSON形式で返してください:
{
  "goodPoints": ["良い点1", "良い点2"],
  "improvements": ["改善点1", "改善点2"],
  "correctedText": "修正後の文章",
  "score": 85
}

【添削のポイント】
- 文法の誤り（助詞、活用、語順など）
- 不自然な表現や語彙の選択
- より適切な語彙・表現の提案
- 肯定的なフィードバックも必ず含める
- スコアは文法・語彙・自然さを総合して100点満点で評価
`;

  // Gemini APIへのリクエスト
  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1000,
          responseMimeType: 'application/json',
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Gemini API request failed: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  const data = await response.json();

  // レスポンスの検証
  if (
    !data.candidates ||
    !data.candidates[0] ||
    !data.candidates[0].content ||
    !data.candidates[0].content.parts ||
    !data.candidates[0].content.parts[0]
  ) {
    throw new Error('Invalid response structure from Gemini API');
  }

  const feedbackText = data.candidates[0].content.parts[0].text;

  // JSONのパース
  let feedback: Feedback;
  try {
    feedback = JSON.parse(feedbackText);
  } catch (error) {
    throw new Error(`Failed to parse feedback JSON: ${error}`);
  }

  // フィードバックの検証
  if (
    !feedback.goodPoints ||
    !Array.isArray(feedback.goodPoints) ||
    !feedback.improvements ||
    !Array.isArray(feedback.improvements) ||
    typeof feedback.correctedText !== 'string' ||
    typeof feedback.score !== 'number'
  ) {
    throw new Error('Invalid feedback structure');
  }

  return feedback;
}
