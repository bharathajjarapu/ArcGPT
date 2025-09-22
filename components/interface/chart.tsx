'use client'

import React, { useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { useTheme } from '../../lib/themer'

// Define chart configuration types
interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'area' | 'scatter'
  data: any[]
  title?: string
  xAxis?: string
  yAxis?: string | string[]
  colors?: string[]
  width?: number
  height?: number
}

// Dark theme optimized color palette
const DEFAULT_COLORS = [
  '#6366f1', // indigo-500
  '#10b981', // emerald-500  
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#06b6d4', // cyan-500
  '#f97316', // orange-500
  '#84cc16', // lime-500
  '#ec4899', // pink-500
  '#14b8a6'  // teal-500
]

interface ChartRendererProps {
  config: ChartConfig
}

// Helper function to get CSS custom property as HSL color
const getCSSVariable = (variable: string): string => {
  if (typeof window === 'undefined') return '0 0% 50%'
  return getComputedStyle(document.documentElement).getPropertyValue(variable).trim()
}

// Convert HSL string to hex color for Recharts compatibility
const hslToHex = (hslString: string): string => {
  if (typeof window === 'undefined') return '#71717a'
  
  try {
    // Parse HSL values from string like "240 5% 64.9%"
    const values = hslString.trim().split(/\s+/)
    if (values.length !== 3) return '#71717a'
    
    const h = parseFloat(values[0])
    const s = parseFloat(values[1].replace('%', '')) / 100
    const l = parseFloat(values[2].replace('%', '')) / 100
    
    // Convert HSL to RGB
    const c = (1 - Math.abs(2 * l - 1)) * s
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
    const m = l - c / 2
    
    let r = 0, g = 0, b = 0
    
    if (0 <= h && h < 60) {
      r = c; g = x; b = 0
    } else if (60 <= h && h < 120) {
      r = x; g = c; b = 0
    } else if (120 <= h && h < 180) {
      r = 0; g = c; b = x
    } else if (180 <= h && h < 240) {
      r = 0; g = x; b = c
    } else if (240 <= h && h < 300) {
      r = x; g = 0; b = c
    } else if (300 <= h && h < 360) {
      r = c; g = 0; b = x
    }
    
    // Convert to 0-255 range and then to hex
    r = Math.round((r + m) * 255)
    g = Math.round((g + m) * 255)
    b = Math.round((b + m) * 255)
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  } catch (error) {
    console.warn('Failed to convert HSL to hex:', hslString, error)
    return '#71717a' // fallback color
  }
}

// Build a theme-derived color palette for chart series
const getThemeSeriesColors = (): string[] => {
  if (typeof window === 'undefined') return DEFAULT_COLORS

  const candidates = [
    getCSSVariable('--primary'),
    getCSSVariable('--accent'),
    getCSSVariable('--ring'),
    getCSSVariable('--destructive'),
  ]

  const hexes = candidates
    .map((hsl) => (hsl && hsl.length ? hslToHex(hsl) : ''))
    .filter((hex) => Boolean(hex)) as string[]

  // Ensure we have enough colors and keep them unique
  const unique = Array.from(new Set(hexes))
  const palette = unique.length ? unique : DEFAULT_COLORS
  return [...palette, ...DEFAULT_COLORS].slice(0, 10)
}

export function ChartRenderer({ config }: ChartRendererProps) {
  const [isClient, setIsClient] = useState(false)
  const [themeColors, setThemeColors] = useState({
    gridColor: '#27272a',
    textColor: '#a1a1aa',
    axisColor: '#27272a',
    tooltipBg: '#09090b',
    tooltipBorder: '#27272a',
    tooltipText: '#fafafa',
    labelColor: '#fafafa'
  })
  const { isDark, theme } = useTheme()

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Update theme colors when theme changes
  useEffect(() => {
    if (typeof window !== 'undefined' && isClient) {
      // Add small delay to ensure CSS variables are loaded
      const timeoutId = setTimeout(() => {
        const newColors = {
          gridColor: hslToHex(getCSSVariable('--border')),
          textColor: hslToHex(getCSSVariable('--muted-foreground')),
          axisColor: hslToHex(getCSSVariable('--border')),
          tooltipBg: hslToHex(getCSSVariable('--popover')),
          tooltipBorder: hslToHex(getCSSVariable('--border')),
          tooltipText: hslToHex(getCSSVariable('--popover-foreground')),
          labelColor: hslToHex(getCSSVariable('--foreground'))
        }
        setThemeColors(newColors)
      }, 50)
      
      return () => clearTimeout(timeoutId)
    }
  }, [isDark, theme, isClient])

  const {
    type,
    data,
    title,
    xAxis = 'name',
    yAxis = 'value',
    colors = DEFAULT_COLORS,
    width,
    height = 300,
  } = config

  // Prefer user-provided colors; otherwise derive from theme (recompute every render)
  const providedColors = Array.isArray(config.colors) && config.colors.length > 0
  const seriesColors = providedColors ? colors : (isClient ? getThemeSeriesColors() : DEFAULT_COLORS)
  const rechartKey = isClient ? `${theme}-${isDark}-${seriesColors.join(',')}` : 'ssr'

  // Error handling for invalid data
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="p-4 border border-border/50 rounded-lg bg-muted/20">
        <p className="text-sm text-muted-foreground">No data available for chart</p>
      </div>
    )
  }

  // Don't render charts on server-side
  if (!isClient) {
    return (
      <div className="my-4 p-4 border border-border/50 rounded-lg bg-card/50 shadow-sm">
        {title && (
          <h3 className="text-lg font-medium mb-4 text-foreground">{title}</h3>
        )}
        <div className="flex items-center justify-center h-64 bg-muted/20 rounded-lg">
          <p className="text-sm text-muted-foreground">Loading chart...</p>
        </div>
      </div>
    )
  }

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
            <XAxis 
              dataKey={xAxis} 
              tick={{ fontSize: 12, fill: themeColors.textColor }}
              axisLine={{ stroke: themeColors.axisColor }}
              tickLine={{ stroke: themeColors.axisColor }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: themeColors.textColor }}
              axisLine={{ stroke: themeColors.axisColor }}
              tickLine={{ stroke: themeColors.axisColor }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: themeColors.tooltipBg,
                border: `1px solid ${themeColors.tooltipBorder}`,
                borderRadius: '8px',
                fontSize: '12px',
                color: themeColors.tooltipText,
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
              }}
              labelStyle={{ color: themeColors.tooltipText }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', color: themeColors.textColor }} />
            {Array.isArray(yAxis) ? (
              yAxis.map((key, index) => (
                <Bar 
                  key={key} 
                  dataKey={key} 
                  fill={seriesColors[index % seriesColors.length]}
                  radius={[2, 2, 0, 0]}
                />
              ))
            ) : (
              <Bar 
                dataKey={yAxis} 
                fill={seriesColors[0]}
                radius={[2, 2, 0, 0]}
              />
            )}
          </BarChart>
        )

      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
            <XAxis 
              dataKey={xAxis} 
              tick={{ fontSize: 12, fill: themeColors.textColor }}
              axisLine={{ stroke: themeColors.axisColor }}
              tickLine={{ stroke: themeColors.axisColor }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: themeColors.textColor }}
              axisLine={{ stroke: themeColors.axisColor }}
              tickLine={{ stroke: themeColors.axisColor }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: themeColors.tooltipBg,
                border: `1px solid ${themeColors.tooltipBorder}`,
                borderRadius: '8px',
                fontSize: '12px',
                color: themeColors.tooltipText,
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
              }}
              labelStyle={{ color: themeColors.tooltipText }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', color: themeColors.textColor }} />
            {Array.isArray(yAxis) ? (
              yAxis.map((key, index) => (
                <Line 
                  key={key} 
                  type="monotone" 
                  dataKey={key} 
                  stroke={seriesColors[index % seriesColors.length]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              ))
            ) : (
              <Line 
                type="monotone" 
                dataKey={yAxis} 
                stroke={seriesColors[0]}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            )}
          </LineChart>
        )

      case 'area':
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
            <XAxis 
              dataKey={xAxis} 
              tick={{ fontSize: 12, fill: themeColors.textColor }}
              axisLine={{ stroke: themeColors.axisColor }}
              tickLine={{ stroke: themeColors.axisColor }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: themeColors.textColor }}
              axisLine={{ stroke: themeColors.axisColor }}
              tickLine={{ stroke: themeColors.axisColor }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: themeColors.tooltipBg,
                border: `1px solid ${themeColors.tooltipBorder}`,
                borderRadius: '8px',
                fontSize: '12px',
                color: themeColors.tooltipText,
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
              }}
              labelStyle={{ color: themeColors.tooltipText }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', color: themeColors.textColor }} />
            {Array.isArray(yAxis) ? (
              yAxis.map((key, index) => (
                <Area 
                  key={key} 
                  type="monotone" 
                  dataKey={key} 
                  stackId="1"
                  stroke={seriesColors[index % seriesColors.length]}
                  fill={seriesColors[index % seriesColors.length]}
                  fillOpacity={0.6}
                />
              ))
            ) : (
              <Area 
                type="monotone" 
                dataKey={yAxis} 
                stroke={seriesColors[0]}
                fill={seriesColors[0]}
                fillOpacity={0.6}
              />
            )}
          </AreaChart>
        )

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={Math.min(height * 0.35, 120)}
              fill="#8884d8"
              dataKey={Array.isArray(yAxis) ? yAxis[0] : yAxis}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={seriesColors[index % seriesColors.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: themeColors.tooltipBg,
                border: `1px solid ${themeColors.tooltipBorder}`,
                borderRadius: '8px',
                fontSize: '12px',
                color: themeColors.tooltipText,
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
              }}
              labelStyle={{ color: themeColors.tooltipText }}
              itemStyle={{ color: themeColors.tooltipText }}
            />
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
              iconType="circle"
              formatter={(value) => <span style={{ color: themeColors.textColor }}>{value}</span>}
            />
          </PieChart>
        )

      case 'scatter':
        return (
          <ScatterChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
            <XAxis 
              dataKey={xAxis} 
              tick={{ fontSize: 12, fill: themeColors.textColor }}
              axisLine={{ stroke: themeColors.axisColor }}
              tickLine={{ stroke: themeColors.axisColor }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: themeColors.textColor }}
              axisLine={{ stroke: themeColors.axisColor }}
              tickLine={{ stroke: themeColors.axisColor }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: themeColors.tooltipBg,
                border: `1px solid ${themeColors.tooltipBorder}`,
                borderRadius: '8px',
                fontSize: '12px',
                color: themeColors.tooltipText,
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
              }}
              labelStyle={{ color: themeColors.tooltipText }}
            />
            <Scatter 
              dataKey={Array.isArray(yAxis) ? yAxis[0] : yAxis}
              fill={seriesColors[0]}
            />
          </ScatterChart>
        )

      default:
        return (
          <div className="p-4 border border-border/50 rounded-lg bg-muted/20">
            <p className="text-sm text-muted-foreground">Unsupported chart type: {type}</p>
          </div>
        )
    }
  }

  return (
    <div className="my-4 p-6 border border-border rounded-xl bg-card backdrop-blur-sm shadow-xl">
      {title && (
        <h3 className="text-lg font-semibold mb-6 text-foreground">{title}</h3>
      )}
      <div style={{ width: '100%', height: 400, minWidth: 0 }}>
        <ResponsiveContainer key={rechartKey} width="100%" height="100%" minWidth={300}>
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// Helper function to parse chart configuration from code block content
export function parseChartConfig(content: string): ChartConfig | null {
  try {
    const config = JSON.parse(content.trim())
    
    // Validate required fields
    if (!config.type || !config.data) {
      return null
    }

    // Ensure data is an array
    if (!Array.isArray(config.data)) {
      return null
    }

    return config as ChartConfig
  } catch (error) {
    return null
  }
}
