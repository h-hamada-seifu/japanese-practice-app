import { NextResponse } from 'next/server';
import { getStudentDetails } from '@/lib/services/teacherService';

export const dynamic = 'force-dynamic';

/**
 * GET /api/teacher/students/[student_id]
 * 生徒詳細情報を取得
 */
export async function GET(
  request: Request,
  { params }: { params: { student_id: string } }
) {
  try {
    const studentId = params.student_id;

    if (!studentId) {
      return NextResponse.json(
        { error: '生徒IDが指定されていません' },
        { status: 400 }
      );
    }

    // 生徒詳細情報を取得
    const result = await getStudentDetails(studentId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('[API] /api/teacher/students/[student_id] エラー:', error);
    return NextResponse.json(
      { error: '生徒詳細情報の取得に失敗しました' },
      { status: 500 }
    );
  }
}
