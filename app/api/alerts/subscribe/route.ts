import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { subscription, userProfile } = body;

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: 'Invalid subscription payload: missing endpoint' },
        { status: 400 }
      );
    }

    // If Supabase is connected, persist to push_subscriptions table
    if (supabase) {
      const payload = {
        endpoint: subscription.endpoint,
        p256dh: subscription.keys?.p256dh || '',
        auth: subscription.keys?.auth || '',
        user_agent: request.headers.get('user-agent') || '',
        is_active: true,
      };

      const { error } = await supabase.from('push_subscriptions').upsert(payload, {
        onConflict: 'endpoint',
      });

      if (error) {
        console.error('Supabase push subscription insert error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Push notification subscription registered successfully',
    });
  } catch (error: any) {
    console.error('Failed to register push subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
