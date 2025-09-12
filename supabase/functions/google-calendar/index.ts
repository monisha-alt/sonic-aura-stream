import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Invalid token');
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    if (action === 'get_auth_url') {
      // Generate Google OAuth URL
      const googleClientId = Deno.env.get('GOOGLE_CLIENT_ID');
      const redirectUri = `${url.origin}/google-callback`;
      const scopes = [
        'https://www.googleapis.com/auth/calendar.readonly',
        'https://www.googleapis.com/auth/userinfo.email'
      ].join(' ');

      const state = crypto.randomUUID();
      const authUrl = `https://accounts.google.com/o/oauth2/auth?` +
        `response_type=code&` +
        `client_id=${googleClientId}&` +
        `scope=${encodeURIComponent(scopes)}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `state=${state}&` +
        `access_type=offline&` +
        `prompt=consent`;

      return new Response(JSON.stringify({ authUrl, state }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'exchange_code') {
      const { code } = await req.json();
      
      const googleClientId = Deno.env.get('GOOGLE_CLIENT_ID');
      const googleClientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
      const redirectUri = `${url.origin}/google-callback`;

      // Exchange code for tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: googleClientId,
          client_secret: googleClientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        }),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('Token exchange failed:', errorText);
        throw new Error('Failed to exchange code for tokens');
      }

      const tokens = await tokenResponse.json();

      // Store tokens securely in database
      const { error: insertError } = await supabase
        .from('user_integrations')
        .upsert({
          user_id: user.id,
          integration_type: 'google_calendar',
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
          scope: tokens.scope?.split(' ') || [],
          is_active: true,
        });

      if (insertError) {
        console.error('Error storing tokens:', insertError);
        throw new Error('Failed to store tokens');
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'get_current_events') {
      // Get user's Google Calendar token
      const { data: integration } = await supabase
        .from('user_integrations')
        .select('access_token, expires_at, refresh_token')
        .eq('user_id', user.id)
        .eq('integration_type', 'google_calendar')
        .eq('is_active', true)
        .single();

      if (!integration) {
        throw new Error('Google Calendar not connected');
      }

      // Check if token needs refresh
      let accessToken = integration.access_token;
      if (new Date(integration.expires_at) <= new Date()) {
        // Refresh token
        const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: Deno.env.get('GOOGLE_CLIENT_ID'),
            client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET'),
            refresh_token: integration.refresh_token,
            grant_type: 'refresh_token',
          }),
        });

        if (refreshResponse.ok) {
          const newTokens = await refreshResponse.json();
          accessToken = newTokens.access_token;

          // Update stored token
          await supabase
            .from('user_integrations')
            .update({
              access_token: newTokens.access_token,
              expires_at: new Date(Date.now() + newTokens.expires_in * 1000).toISOString(),
            })
            .eq('user_id', user.id)
            .eq('integration_type', 'google_calendar');
        }
      }

      // Get current and upcoming events
      const now = new Date();
      const oneHour = new Date(now.getTime() + 60 * 60 * 1000);
      
      const eventsResponse = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
        `timeMin=${now.toISOString()}&` +
        `timeMax=${oneHour.toISOString()}&` +
        `singleEvents=true&` +
        `orderBy=startTime`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!eventsResponse.ok) {
        throw new Error('Failed to fetch calendar events');
      }

      const events = await eventsResponse.json();
      
      // Analyze event types for music context
      const currentEvents = events.items?.map((event: any) => ({
        id: event.id,
        summary: event.summary || '',
        description: event.description || '',
        start: event.start?.dateTime || event.start?.date,
        end: event.end?.dateTime || event.end?.date,
        type: analyzeEventType(event.summary || '', event.description || ''),
      })) || [];

      return new Response(JSON.stringify({ events: currentEvents }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in google-calendar function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function analyzeEventType(summary: string, description: string): string {
  const text = `${summary} ${description}`.toLowerCase();
  
  if (text.includes('meeting') || text.includes('call') || text.includes('conference')) {
    return 'meeting';
  }
  if (text.includes('study') || text.includes('learn') || text.includes('exam') || text.includes('homework')) {
    return 'study';
  }
  if (text.includes('workout') || text.includes('gym') || text.includes('exercise') || text.includes('run')) {
    return 'workout';
  }
  if (text.includes('focus') || text.includes('work') || text.includes('task') || text.includes('deadline')) {
    return 'focus';
  }
  if (text.includes('break') || text.includes('lunch') || text.includes('coffee')) {
    return 'break';
  }
  
  return 'general';
}