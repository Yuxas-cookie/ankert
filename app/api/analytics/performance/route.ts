import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { page, metrics, timestamp, userAgent, url } = body

    // Validate required fields
    if (!page || !metrics || !timestamp) {
      return NextResponse.json(
        { error: 'Missing required fields: page, metrics, timestamp' },
        { status: 400 }
      )
    }

    // Get user session if available
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Store performance metrics
    const { error } = await supabase
      .from('performance_metrics')
      .insert({
        user_id: user?.id || null,
        page_name: page,
        page_load_time: metrics.pageLoadTime,
        first_contentful_paint: metrics.firstContentfulPaint,
        largest_contentful_paint: metrics.largestContentfulPaint,
        cumulative_layout_shift: metrics.cumulativeLayoutShift,
        first_input_delay: metrics.firstInputDelay,
        time_to_interactive: metrics.timeToInteractive,
        user_agent: userAgent,
        url: url,
        timestamp: new Date(timestamp).toISOString(),
        created_at: new Date().toISOString()
      })

    if (error) {
      console.error('Failed to store performance metrics:', error)
      return NextResponse.json(
        { error: 'Failed to store performance metrics' },
        { status: 500 }
      )
    }

    // Also send to external analytics if configured
    if (process.env.GOOGLE_ANALYTICS_ID) {
      try {
        await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${process.env.GOOGLE_ANALYTICS_ID}&api_secret=${process.env.GA_API_SECRET}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            client_id: user?.id || 'anonymous',
            events: [{
              name: 'page_performance',
              params: {
                page_title: page,
                page_load_time: metrics.pageLoadTime,
                first_contentful_paint: metrics.firstContentfulPaint,
                largest_contentful_paint: metrics.largestContentfulPaint,
                cumulative_layout_shift: metrics.cumulativeLayoutShift,
                first_input_delay: metrics.firstInputDelay,
                time_to_interactive: metrics.timeToInteractive
              }
            }]
          })
        })
      } catch (error) {
        console.warn('Failed to send to Google Analytics:', error)
      }
    }

    return NextResponse.json({ success: true }, { status: 200 })

  } catch (error) {
    console.error('Performance analytics endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get performance analytics data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const limit = parseInt(searchParams.get('limit') || '100')

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    let query = supabase
      .from('performance_metrics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    // Apply filters
    if (page) {
      query = query.eq('page_name', page)
    }

    if (startDate) {
      query = query.gte('created_at', startDate)
    }

    if (endDate) {
      query = query.lte('created_at', endDate)
    }

    const { data, error } = await query

    if (error) {
      console.error('Failed to fetch performance metrics:', error)
      return NextResponse.json(
        { error: 'Failed to fetch performance metrics' },
        { status: 500 }
      )
    }

    // Calculate aggregated metrics
    const aggregated = {
      totalSamples: data.length,
      averagePageLoadTime: data.reduce((sum, item) => sum + (item.page_load_time || 0), 0) / data.length,
      averageFirstContentfulPaint: data.reduce((sum, item) => sum + (item.first_contentful_paint || 0), 0) / data.length,
      averageLargestContentfulPaint: data.reduce((sum, item) => sum + (item.largest_contentful_paint || 0), 0) / data.length,
      averageCumulativeLayoutShift: data.reduce((sum, item) => sum + (item.cumulative_layout_shift || 0), 0) / data.length,
      averageFirstInputDelay: data.reduce((sum, item) => sum + (item.first_input_delay || 0), 0) / data.length,
      averageTimeToInteractive: data.reduce((sum, item) => sum + (item.time_to_interactive || 0), 0) / data.length,
    }

    return NextResponse.json({
      metrics: data,
      aggregated,
      success: true
    }, { status: 200 })

  } catch (error) {
    console.error('Performance analytics GET endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}