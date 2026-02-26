import { hexToRgb } from '@core/utils/colorConverter'

type ChartThemeColors = { colors: Record<string, unknown>; variables: Record<string, string | number> }

const colorVariables = (themeColors: ChartThemeColors) => {
  const themeSecondaryTextColor = `rgba(${hexToRgb(String(themeColors.colors['on-surface'] ?? ''))},${themeColors.variables['medium-emphasis-opacity']})`
  const themeDisabledTextColor = `rgba(${hexToRgb(String(themeColors.colors['on-surface'] ?? ''))},${themeColors.variables['disabled-opacity']})`
  const themeBorderColor = `rgba(${hexToRgb(String(themeColors.variables['border-color'] ?? ''))},${themeColors.variables['border-opacity']})`

  return { labelColor: themeDisabledTextColor, borderColor: themeBorderColor, legendColor: themeSecondaryTextColor }
}


export const getLatestBarChartConfig = (themeColors: ChartThemeColors) => {
  const { borderColor, labelColor } = colorVariables(themeColors)

  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 500 },
    scales: {
      x: {
        grid: {
          borderColor,
          drawBorder: false,
          color: borderColor,
        },
        ticks: { color: labelColor },
      },
      y: {
        min: 0,
        max: 400,
        grid: {
          borderColor,
          drawBorder: false,
          color: borderColor,
        },
        ticks: {
          stepSize: 100,
          color: labelColor,
        },
      },
    },
    plugins: {
      legend: { display: false },
    },
  }
}

export const getHorizontalBarChartConfig = (themeColors: ChartThemeColors) => {
  const { borderColor, labelColor, legendColor } = colorVariables(themeColors)

  return {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 500 },
    elements: {
      bar: {
        borderRadius: {
          topRight: 15,
          bottomRight: 15,
        },
      },
    },
    layout: {
      padding: { top: -4 },
    },
    scales: {
      x: {
        min: 0,
        grid: {
          drawTicks: false,
          drawBorder: false,
          color: borderColor,
        },
        ticks: { color: labelColor },
      },
      y: {
        grid: {
          borderColor,
          display: false,
          drawBorder: false,
        },
        ticks: { color: labelColor },
      },
    },
    plugins: {
      legend: {
        align: 'end',
        position: 'top',
        labels: { color: legendColor },
      },
    },
  }
}

export const getLineChartConfig = (themeColors: ChartThemeColors) => {
  const { borderColor, labelColor, legendColor } = colorVariables(themeColors)

  return {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: { color: labelColor },
        grid: {
          borderColor,
          drawBorder: false,
          color: borderColor,
        },
      },
      y: {
        min: 0,
        max: 400,
        ticks: {
          stepSize: 100,
          color: labelColor,
        },
        grid: {
          borderColor,
          drawBorder: false,
          color: borderColor,
        },
      },
    },
    plugins: {
      legend: {
        align: 'end',
        position: 'top',
        labels: {
          padding: 25,
          boxWidth: 10,
          color: legendColor,
          usePointStyle: true,
        },
      },
    },
  }
}

export const getRadarChartConfig = (themeColors: ChartThemeColors) => {
  const { borderColor, labelColor, legendColor } = colorVariables(themeColors)

  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 500 },
    layout: {
      padding: { top: -20 },
    },
    scales: {
      r: {
        ticks: {
          display: false,
          maxTicksLimit: 1,
          color: labelColor,
        },
        grid: { color: borderColor },
        pointLabels: { color: labelColor },
        angleLines: { color: borderColor },
      },
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          padding: 25,
          color: legendColor,
        },
      },
    },
  }
}

export const getPolarChartConfig = (themeColors: ChartThemeColors) => {
  const { legendColor } = colorVariables(themeColors)

  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 500 },
    layout: {
      padding: {
        top: -5,
        bottom: -45,
      },
    },
    scales: {
      r: {
        grid: { display: false },
        ticks: { display: false },
      },
    },
    plugins: {
      legend: {
        position: 'right',
        labels: {
          padding: 25,
          boxWidth: 9,
          color: legendColor,
          usePointStyle: true,
        },
      },
    },
  }
}

export const getBubbleChartConfig = (themeColors: ChartThemeColors) => {
  const { borderColor, labelColor } = colorVariables(themeColors)

  return {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        min: 0,
        max: 140,
        grid: {
          borderColor,
          drawBorder: false,
          color: borderColor,
        },
        ticks: {
          stepSize: 10,
          color: labelColor,
        },
      },
      y: {
        min: 0,
        max: 400,
        grid: {
          borderColor,
          drawBorder: false,
          color: borderColor,
        },
        ticks: {
          stepSize: 100,
          color: labelColor,
        },
      },
    },
    plugins: {
      legend: { display: false },
    },
  }
}

export const getDoughnutChartConfig = () => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 500 },
    cutout: 80,
    plugins: {
      legend: {
        display: false,
      },
    },
  }
}

export const getScatterChartConfig = (themeColors: ChartThemeColors) => {
  const { borderColor, labelColor, legendColor } = colorVariables(themeColors)

  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 800 },
    layout: {
      padding: { top: -20 },
    },
    scales: {
      x: {
        min: 0,
        max: 140,
        grid: {
          borderColor,
          drawTicks: false,
          drawBorder: false,
          color: borderColor,
        },
        ticks: {
          stepSize: 10,
          color: labelColor,
        },
      },
      y: {
        min: 0,
        max: 400,
        grid: {
          borderColor,
          drawTicks: false,
          drawBorder: false,
          color: borderColor,
        },
        ticks: {
          stepSize: 100,
          color: labelColor,
        },
      },
    },
    plugins: {
      legend: {
        align: 'start',
        position: 'top',
        labels: {
          padding: 25,
          boxWidth: 9,
          color: legendColor,
          usePointStyle: true,
        },
      },
    },
  }
}

export const getLineAreaChartConfig = (themeColors: ChartThemeColors) => {
  const { borderColor, labelColor, legendColor } = colorVariables(themeColors)

  return {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: { top: -20 },
    },
    scales: {
      x: {
        grid: {
          borderColor,
          color: 'transparent',
        },
        ticks: { color: labelColor },
      },
      y: {
        min: 0,
        max: 400,
        grid: {
          borderColor,
          color: 'transparent',
        },
        ticks: {
          stepSize: 100,
          color: labelColor,
        },
      },
    },
    plugins: {
      legend: {
        align: 'start',
        position: 'top',
        labels: {
          padding: 25,
          boxWidth: 9,
          color: legendColor,
          usePointStyle: true,
        },
      },
    },
  }
}
