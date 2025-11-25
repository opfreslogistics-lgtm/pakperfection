import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

// Debug endpoint to check what settings are available
export async function GET(request: NextRequest) {
  try {
    const debugInfo: any = {
      timestamp: new Date().toISOString(),
      sources: {},
    }

    // Check database
    try {
      // Try service role client first (bypasses RLS)
      const serviceClient = createServiceClient()
      let data = null
      let error = null

      if (serviceClient) {
        const result = await serviceClient
          .from('email_settings')
          .select('*')
          .eq('id', 1)
          .maybeSingle()
        data = result.data
        error = result.error
        debugInfo.sources.database.method = 'service_role'
      } else {
        // Fallback to regular client
        const supabase = await createClient()
        const result = await supabase
          .from('email_settings')
          .select('*')
          .eq('id', 1)
          .maybeSingle()
        data = result.data
        error = result.error
        debugInfo.sources.database.method = 'regular_client'
        debugInfo.sources.database.serviceRoleAvailable = false
      }

      debugInfo.sources.database = {
        found: !!data,
        error: error?.message || null,
        hasCredentials: !!(data?.smtp_user && data?.smtp_pass),
        host: data?.smtp_host || null,
        user: data?.smtp_user ? `${data.smtp_user.substring(0, 3)}***` : null,
        method: debugInfo.sources.database?.method || 'unknown',
        serviceRoleAvailable: !!serviceClient,
      }
    } catch (error: any) {
      debugInfo.sources.database = {
        error: error.message,
        method: 'error',
      }
    }

    // Check environment variables
    debugInfo.sources.environment = {
      hasHost: !!process.env.SMTP_HOST,
      hasUser: !!process.env.SMTP_USER,
      hasPassword: !!process.env.SMTP_PASS,
      host: process.env.SMTP_HOST || null,
      port: process.env.SMTP_PORT || null,
      user: process.env.SMTP_USER ? `${process.env.SMTP_USER.substring(0, 3)}***` : null,
    }

    // Determine which source would be used
    if (debugInfo.sources.database?.hasCredentials) {
      debugInfo.activeSource = 'database'
    } else if (debugInfo.sources.environment?.hasUser && debugInfo.sources.environment?.hasPassword) {
      debugInfo.activeSource = 'environment'
    } else {
      debugInfo.activeSource = 'none'
      debugInfo.error = 'No SMTP credentials found in database or environment variables'
    }

    return NextResponse.json(debugInfo, { status: 200 })
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Failed to debug settings',
        details: error.message,
      },
      { status: 500 }
    )
  }
}

