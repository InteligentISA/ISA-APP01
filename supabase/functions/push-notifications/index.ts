import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Web Push API configuration
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY') || ''
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') || ''

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { action, userId, notification, tokens, topic } = await req.json()

    switch (action) {
      case 'send':
        return await sendNotification(supabaseClient, notification, tokens)
      case 'send-to-user':
        return await sendToUser(supabaseClient, userId, notification)
      case 'send-to-topic':
        return await sendToTopic(supabaseClient, notification, topic)
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function sendNotification(supabase: any, notification: any, tokens: string[]) {
  const results = []
  
  for (const token of tokens) {
    try {
      // For Web Push API, we need to handle different token formats
      if (token.startsWith('https://fcm.googleapis.com/fcm/send/')) {
        // FCM token - use FCM API
        const fcmToken = token.replace('https://fcm.googleapis.com/fcm/send/', '')
        const result = await sendFCMNotification(fcmToken, notification)
        results.push({ token, success: result.success, result })
      } else {
        // Web Push token - use Web Push API
        const result = await sendWebPushNotification(token, notification)
        results.push({ token, success: result.success, result })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      results.push({ token, success: false, error: errorMessage })
    }
  }

  return new Response(
    JSON.stringify({ results }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function sendFCMNotification(token: string, notification: any) {
  const response = await fetch('https://fcm.googleapis.com/fcm/send', {
    method: 'POST',
    headers: {
      'Authorization': `key=${Deno.env.get('FCM_SERVER_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: token,
      notification: {
        title: notification.title,
        body: notification.body,
        icon: notification.icon || '/icon-192x192.png',
        badge: notification.badge || '/badge-72x72.png',
        image: notification.image,
        click_action: notification.click_action,
        sound: notification.sound || 'default'
      },
      data: notification.data || {},
      priority: 'high',
      android: {
        notification: {
          icon: 'ic_notification',
          color: '#4F46E5',
          sound: notification.sound || 'default',
          priority: 'high',
          channel_id: 'isa_notifications'
        }
      },
      apns: {
        payload: {
          aps: {
            badge: notification.badge || 1,
            sound: notification.sound || 'default',
            category: 'ISA_NOTIFICATION'
          }
        }
      }
    })
  })

  const result = await response.json()
  return { success: response.ok, result }
}

async function sendWebPushNotification(subscription: any, notification: any) {
  // For Web Push API, we need to encrypt the payload
  const payload = JSON.stringify({
    title: notification.title,
    body: notification.body,
    icon: notification.icon || '/icon-192x192.png',
    badge: notification.badge || '/badge-72x72.png',
    image: notification.image,
    data: notification.data || {},
    actions: notification.actions || []
  })

  // Simple Web Push implementation (for production, use a proper Web Push library)
  const response = await fetch(subscription.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      'TTL': '86400',
      'Urgency': 'high'
    },
    body: payload
  })

  return { success: response.ok, status: response.status }
}

async function sendToUser(supabase: any, userId: string, notification: any) {
  // Get user's notification tokens
  const { data: tokens, error } = await supabase
    .from('notification_tokens')
    .select('token')
    .eq('user_id', userId)
    .eq('is_active', true)

  if (error) {
    throw new Error(`Failed to get user tokens: ${error.message}`)
  }

  if (!tokens || tokens.length === 0) {
    return new Response(
      JSON.stringify({ message: 'No active tokens found for user' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const tokenList = tokens.map((t: { token: string }) => t.token)
  return await sendNotification(supabase, notification, tokenList)
}

async function sendToTopic(supabase: any, notification: any, topic: string) {
  // For topics, we'll use FCM
  const response = await fetch('https://fcm.googleapis.com/fcm/send', {
    method: 'POST',
    headers: {
      'Authorization': `key=${Deno.env.get('FCM_SERVER_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: `/topics/${topic}`,
      notification: {
        title: notification.title,
        body: notification.body,
        icon: notification.icon || '/icon-192x192.png',
        badge: notification.badge || '/badge-72x72.png',
        image: notification.image,
        click_action: notification.click_action,
        sound: notification.sound || 'default'
      },
      data: notification.data || {},
      priority: 'high'
    })
  })

  const result = await response.json()
  
  return new Response(
    JSON.stringify({ success: response.ok, result }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}
