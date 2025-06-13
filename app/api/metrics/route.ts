import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Prometheus metrics endpoint
export async function GET() {
  try {
    const supabase = await createClient()

    // Collect basic application metrics
    const metrics = []

    // Health metrics
    metrics.push('# HELP survey_app_health Application health status')
    metrics.push('# TYPE survey_app_health gauge')
    metrics.push('survey_app_health 1')

    // Database connection metrics
    try {
      const { data, error } = await supabase.from('surveys').select('count').limit(1)
      metrics.push('# HELP survey_app_database_connected Database connection status')
      metrics.push('# TYPE survey_app_database_connected gauge')
      metrics.push(error ? 'survey_app_database_connected 0' : 'survey_app_database_connected 1')
    } catch (error) {
      metrics.push('survey_app_database_connected 0')
    }

    // Survey metrics
    try {
      const { count: totalSurveys } = await supabase
        .from('surveys')
        .select('*', { count: 'exact', head: true })

      const { count: activeSurveys } = await supabase
        .from('surveys')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published')

      const { count: totalResponses } = await supabase
        .from('survey_responses')
        .select('*', { count: 'exact', head: true })

      metrics.push('# HELP survey_app_total_surveys Total number of surveys')
      metrics.push('# TYPE survey_app_total_surveys counter')
      metrics.push(`survey_app_total_surveys ${totalSurveys || 0}`)

      metrics.push('# HELP survey_app_active_surveys Number of active surveys')
      metrics.push('# TYPE survey_app_active_surveys gauge')
      metrics.push(`survey_app_active_surveys ${activeSurveys || 0}`)

      metrics.push('# HELP survey_app_total_responses Total number of responses')
      metrics.push('# TYPE survey_app_total_responses counter')
      metrics.push(`survey_app_total_responses ${totalResponses || 0}`)
    } catch (error) {
      console.error('Failed to fetch survey metrics:', error)
    }

    // User metrics
    try {
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      const { count: activeUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('last_sign_in_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

      metrics.push('# HELP survey_app_total_users Total number of users')
      metrics.push('# TYPE survey_app_total_users counter')
      metrics.push(`survey_app_total_users ${totalUsers || 0}`)

      metrics.push('# HELP survey_app_active_users_24h Number of users active in last 24 hours')
      metrics.push('# TYPE survey_app_active_users_24h gauge')
      metrics.push(`survey_app_active_users_24h ${activeUsers || 0}`)
    } catch (error) {
      console.error('Failed to fetch user metrics:', error)
    }

    // Performance metrics
    try {
      const { data: performanceData } = await supabase
        .from('performance_metrics')
        .select('page_load_time, first_contentful_paint, largest_contentful_paint')
        .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())

      if (performanceData && performanceData.length > 0) {
        const avgPageLoadTime = performanceData.reduce((sum, item) => sum + (item.page_load_time || 0), 0) / performanceData.length
        const avgFCP = performanceData.reduce((sum, item) => sum + (item.first_contentful_paint || 0), 0) / performanceData.length
        const avgLCP = performanceData.reduce((sum, item) => sum + (item.largest_contentful_paint || 0), 0) / performanceData.length

        metrics.push('# HELP survey_app_avg_page_load_time_ms Average page load time in milliseconds (last hour)')
        metrics.push('# TYPE survey_app_avg_page_load_time_ms gauge')
        metrics.push(`survey_app_avg_page_load_time_ms ${avgPageLoadTime.toFixed(2)}`)

        metrics.push('# HELP survey_app_avg_first_contentful_paint_ms Average first contentful paint in milliseconds (last hour)')
        metrics.push('# TYPE survey_app_avg_first_contentful_paint_ms gauge')
        metrics.push(`survey_app_avg_first_contentful_paint_ms ${avgFCP.toFixed(2)}`)

        metrics.push('# HELP survey_app_avg_largest_contentful_paint_ms Average largest contentful paint in milliseconds (last hour)')
        metrics.push('# TYPE survey_app_avg_largest_contentful_paint_ms gauge')
        metrics.push(`survey_app_avg_largest_contentful_paint_ms ${avgLCP.toFixed(2)}`)
      }
    } catch (error) {
      console.error('Failed to fetch performance metrics:', error)
    }

    // System metrics
    const memoryUsage = process.memoryUsage()
    metrics.push('# HELP survey_app_memory_usage_bytes Memory usage in bytes')
    metrics.push('# TYPE survey_app_memory_usage_bytes gauge')
    metrics.push(`survey_app_memory_usage_bytes{type="rss"} ${memoryUsage.rss}`)
    metrics.push(`survey_app_memory_usage_bytes{type="heap_used"} ${memoryUsage.heapUsed}`)
    metrics.push(`survey_app_memory_usage_bytes{type="heap_total"} ${memoryUsage.heapTotal}`)
    metrics.push(`survey_app_memory_usage_bytes{type="external"} ${memoryUsage.external}`)

    metrics.push('# HELP survey_app_uptime_seconds Application uptime in seconds')
    metrics.push('# TYPE survey_app_uptime_seconds counter')
    metrics.push(`survey_app_uptime_seconds ${process.uptime()}`)

    return new NextResponse(metrics.join('\n'), {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    })

  } catch (error) {
    console.error('Metrics endpoint error:', error)
    return new NextResponse('# Error collecting metrics\n', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    })
  }
}