import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, message, page } = await req.json();

    // Validate
    if (!type || !message) {
      return NextResponse.json({ error: 'Type and message are required' }, { status: 400 });
    }

    if (!['bug', 'feature', 'general'].includes(type)) {
      return NextResponse.json({ error: 'Invalid feedback type' }, { status: 400 });
    }

    if (message.length > 5000) {
      return NextResponse.json({ error: 'Message too long' }, { status: 400 });
    }

    // Save to database
    const feedback = await prisma.feedback.create({
      data: {
        userId: session.user.id,
        type,
        message,
        page: page || null,
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    // Log feedback for now (email notification can be added later)
    console.log('[Feedback] New submission:', {
      id: feedback.id,
      type: feedback.type,
      from: feedback.user.email,
      page: feedback.page,
      message: feedback.message.substring(0, 100) + (feedback.message.length > 100 ? '...' : ''),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Feedback] Submission error:', error);
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
  }
}
