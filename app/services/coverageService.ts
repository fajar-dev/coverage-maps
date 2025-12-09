interface GetCoverageParams {
  apiUrl: string
  longitude: number
  latitude: number
  mode: 'radius' | 'limit'
  value: number
}

interface ExportCoverageParams extends GetCoverageParams {
  types?: string[]
}

export async function getCoverage({
  apiUrl,
  longitude,
  latitude,
  mode,
  value
}: GetCoverageParams) {
  let url = `${apiUrl}/coverage?longitude=${longitude}&latitude=${latitude}`

  if (mode === 'radius') {
    url += `&radius=${value}`
  } else if (mode === 'limit') {
    url += `&limit=${value}`
  }

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch coverage: ${response.statusText}`)
  }

  return response.json()
}

export async function exportCoverage({
  apiUrl,
  longitude,
  latitude,
  mode,
  value,
  types
}: ExportCoverageParams): Promise<void> {
  if (typeof window === 'undefined') return

  let url = `${apiUrl}/export?longitude=${longitude}&latitude=${latitude}`

  if (mode === 'radius') {
    url += `&radius=${value}`
  } else if (mode === 'limit') {
    url += `&limit=${value}`
  }

  if (types && types.length > 0) {
    const typeParam = encodeURIComponent(types.join(','))
    url += `&type=${typeParam}`
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'text/csv'
    }
  })

  if (!response.ok) {
    console.error('Failed to export coverage', response.status, response.statusText)
    throw new Error(`Export failed: ${response.status} ${response.statusText}`)
  }

  const blob = await response.blob()
  const blobUrl = window.URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = blobUrl

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
  a.download = `coverage-${timestamp}.csv`

  document.body.appendChild(a)
  a.click()
  a.remove()

  window.URL.revokeObjectURL(blobUrl)
}
