import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    // Check database connectivity
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
      .single()

    // Check if we can connect to the database
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" which is OK for health check
      throw error
    }

    // Check environment variables
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY'
    ]

    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar])
    if (missingEnvVars.length > 0) {
      throw new Error(`Missing environment variables: ${missingEnvVars.join(', ')}`)
    }

    // Get system information
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024)
      },
      database: {
        status: 'connected',
        latency: Date.now() // This would be more accurate with actual latency measurement
      },
      services: {
        supabase: 'connected',
        nextjs: 'running'
      }
    }

    return NextResponse.json(healthData, { status: 200 })

  } catch (error) {
    console.error('Health check failed:', error)
    
    const errorResponse = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      services: {
        supabase: 'disconnected',
        nextjs: 'running'
      }
    }

    return NextResponse.json(errorResponse, { status: 503 })
  }
}

// Also support HEAD requests for simple health checks
export async function HEAD() {
  try {
    const supabase = await createClient()
    await supabase.from('profiles').select('count').limit(1).single()
    return new NextResponse(null, { status: 200 })
  } catch (error) {
    return new NextResponse(null, { status: 503 })
  }
}