import type { CoverageParams, CoverageResponse } from '~/types/coverage'

export async function getCoverage(
  apiUrl: string,
  { longitude, latitude, radius, limit }: CoverageParams
): Promise<CoverageResponse> {
  const url = `${apiUrl}/coverage?longitude=${longitude}&latitude=${latitude}&radius=${radius}&limit=${limit}`
  const res = await fetch(url)
  return await res.json()
}
