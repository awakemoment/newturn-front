import { apiClient } from '../axios'

export interface ContentSource {
  id: number
  name: string
  slug: string
  source_type: string
  description?: string
  website?: string
  logo_url?: string
  is_free: boolean
  price_info?: string
  quality_rating: number
  reliability: number
  target_audience?: string
  specialty?: string
}

export interface ContentCategory {
  id: number
  name: string
  slug: string
  description?: string
}

export interface CuratedContent {
  id: number
  title: string
  description: string
  source: ContentSource | null
  url: string
  thumbnail?: string
  creator?: string
  duration?: string
  category: ContentCategory | null
  difficulty: number
  tags: string[]
  curator_note?: string
  is_required: boolean
  is_featured: boolean
  priority: number
  views: number
}

interface CuratedListResponse {
  results: CuratedContent[]
  total: number
}

export async function fetchFeaturedCurations(limit = 6) {
  const params = new URLSearchParams({
    is_featured: 'true',
    limit: String(limit),
  })

  const response = await apiClient.get<CuratedListResponse>(`/content/?${params}`)
  return response.data
}


