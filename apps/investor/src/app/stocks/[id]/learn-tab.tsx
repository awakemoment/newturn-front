'use client'

import { useState, useEffect } from 'react'
import MateInfoModal from '@/components/MateInfoModal'
import { apiClient } from '@/lib/axios'

interface CuratedContent {
  id: number
  title: string
  description: string
  source: {
    name: string
    source_type: string
    is_free: boolean
    price_info: string
  }
  creator: string
  url: string
  thumbnail: string
  duration: string
  difficulty: number
  category: {
    name: string
  }
  tags: string[]
  curator_note: string
  is_required: boolean
  is_featured: boolean
}

interface Props {
  stockId: number
  stockCode: string
  stockName: string
}

export default function LearnTab({ stockId, stockCode, stockName }: Props) {
  const [contents, setContents] = useState<CuratedContent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMate, setSelectedMate] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    fetchContents()
  }, [stockId])

  const fetchContents = async () => {
    try {
      const { data } = await apiClient.get(`/api/content/stocks/${stockId}/`)
      setContents(data.contents || [])
    } catch (error) {
      console.error('Failed to fetch contents:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyStars = (difficulty: number) => {
    return '⭐'.repeat(difficulty)
  }

  const getDifficultyText = (difficulty: number) => {
    const texts: Record<number, string> = {
      1: '입문',
      2: '초급',
      3: '중급',
      4: '고급',
      5: '전문가'
    }
    return texts[difficulty] || '중급'
  }

  const categories = ['all', '필수', '초보자', '재무제표', '종목분석', '거시경제', '산업분석']
  
  const filteredContents = selectedCategory === 'all' 
    ? contents 
    : selectedCategory === '필수'
    ? contents.filter(c => c.is_required)
    : contents.filter(c => c.category.name === selectedCategory)

  const requiredContents = contents.filter(c => c.is_required)
  const featuredContents = contents.filter(c => c.is_featured && !c.is_required)
  const otherContents = contents.filter(c => !c.is_required && !c.is_featured)

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        <p className="mt-4 text-gray-600">콘텐츠 로딩 중...</p>
      </div>
    )
  }

  if (contents.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">📚</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">아직 큐레이션된 콘텐츠가 없습니다</h3>
        <p className="text-gray-600">
          곧 {stockName}에 대한 양질의 학습 콘텐츠를<br />
          큐레이션하여 제공하겠습니다!
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          📚 {stockName} 투자 가이드
        </h2>
        <p className="text-gray-600">
          {stockCode}에 투자하기 전에 알아야 할 모든 것을 엄선된 콘텐츠로 배워보세요.
        </p>
      </div>

      {/* 필수 시청 */}
      {requiredContents.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-xl font-bold text-red-600">🎯 필수 학습</h3>
            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
              {requiredContents.length}개
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            이 종목을 이해하는 데 꼭 필요한 콘텐츠입니다
          </p>

          <div className="space-y-4">
            {requiredContents.map((content) => (
              <ContentCard key={content.id} content={content} />
            ))}
          </div>
        </div>
      )}

      {/* 추천 콘텐츠 */}
      {featuredContents.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-xl font-bold text-green-600">✨ 추천 콘텐츠</h3>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
              {featuredContents.length}개
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredContents.map((content) => (
              <ContentCard key={content.id} content={content} compact />
            ))}
          </div>
        </div>
      )}

      {/* 추가 학습 자료 */}
      {otherContents.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-xl font-bold text-gray-700">📖 추가 학습 자료</h3>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
              {otherContents.length}개
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {otherContents.map((content) => (
              <ContentCard key={content.id} content={content} compact />
            ))}
          </div>
        </div>
      )}

      {/* Mate Info Modal */}
      {selectedMate && (
        <MateInfoModal
          isOpen={!!selectedMate}
          onClose={() => setSelectedMate(null)}
          mateType={selectedMate}
        />
      )}
    </div>
  )
}

// ContentCard Component
function ContentCard({ content, compact = false }: { content: CuratedContent, compact?: boolean }) {
  const [showNote, setShowNote] = useState(false)

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return 'text-green-600'
    if (difficulty <= 3) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (compact) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <a href={content.url} target="_blank" rel="noopener noreferrer" className="block">
          {content.thumbnail && (
            <img 
              src={content.thumbnail} 
              alt={content.title}
              className="w-full h-32 object-cover rounded mb-3"
            />
          )}
          
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-bold text-gray-900 text-sm line-clamp-2 flex-1">
              {content.title}
            </h4>
            <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
              {content.duration}
            </span>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
              {content.source.name}
            </span>
            <span className={`text-xs ${getDifficultyColor(content.difficulty)}`}>
              {'⭐'.repeat(content.difficulty)}
            </span>
          </div>

          <p className="text-xs text-gray-600 line-clamp-2">
            {content.description}
          </p>
        </a>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex gap-6">
        {/* Thumbnail */}
        {content.thumbnail && (
          <a href={content.url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
            <img 
              src={content.thumbnail} 
              alt={content.title}
              className="w-48 h-28 object-cover rounded-lg"
            />
          </a>
        )}

        {/* Content Info */}
        <div className="flex-1">
          <a href={content.url} target="_blank" rel="noopener noreferrer">
            <h4 className="text-xl font-bold text-gray-900 mb-2 hover:text-green-600 transition-colors">
              {content.title}
            </h4>
          </a>

          <div className="flex items-center gap-3 mb-3">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
              {content.source.name}
            </span>
            <span className="text-sm text-gray-600">
              {content.creator}
            </span>
            <span className="text-sm text-gray-500">
              {content.duration}
            </span>
            <span className={`text-sm font-semibold ${getDifficultyColor(content.difficulty)}`}>
              {'⭐'.repeat(content.difficulty)} {getDifficultyText(content.difficulty)}
            </span>
          </div>

          <p className="text-gray-700 mb-3">
            {content.description}
          </p>

          {/* Curator Note Toggle */}
          {content.curator_note && (
            <button
              onClick={() => setShowNote(!showNote)}
              className="text-sm text-green-600 hover:text-green-700 font-semibold"
            >
              {showNote ? '▼ 큐레이터 노트 접기' : '▶ 왜 이 콘텐츠를 소개하나요?'}
            </button>
          )}

          {/* Curator Note */}
          {showNote && content.curator_note && (
            <div className="mt-3 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
              <div className="text-sm text-gray-800 whitespace-pre-line">
                {content.curator_note}
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-3">
            {content.tags.map((tag, idx) => (
              <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <a
          href={content.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
        >
          {content.source?.source_type === 'our_content'
            ? '이어서 보기 →'
            : content.source?.is_free
              ? '무료로 보기 →'
              : `보러가기 (${content.source?.price_info || ''}) →`}
        </a>
      </div>
    </div>
  )
}

function getDifficultyText(difficulty: number) {
  const texts: Record<number, string> = {
    1: '입문',
    2: '초급',
    3: '중급',
    4: '고급',
    5: '전문가'
  }
  return texts[difficulty] || '중급'
}

