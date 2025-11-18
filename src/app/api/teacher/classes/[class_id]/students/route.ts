import { NextResponse } from 'next/server';
import { getClassStudents } from '@/lib/services/teacherService';

export const dynamic = 'force-dynamic';

/**
 * GET /api/teacher/classes/[class_id]/students
 * クラスの生徒一覧を取得
 */
export async function GET(
  request: Request,
  { params }: { params: { class_id: string } }
) {
  try {
    const classId = params.class_id;

    if (!classId) {
      return NextResponse.json(
        { error: 'クラスIDが指定されていません' },
        { status: 400 }
      );
    }

    // クラスの生徒一覧を取得
    const result = await getClassStudents(classId);

    return NextResponse.json(result);
  } catch (error) {
    console.error(
      '[API] /api/teacher/classes/[class_id]/students エラー:',
      error
    );
    return NextResponse.json(
      { error: '生徒一覧の取得に失敗しました' },
      { status: 500 }
    );
  }
}
