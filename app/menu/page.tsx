'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'

const MOCK_CATEGORIES = [
  { id: '1', name: 'Пицца', icon: '🍕' },
  { id: '2', name: 'Бургеры', icon: '🍔' },
  { id: '3', name: 'Салаты', icon: '🥗' },
  { id: '4', name: 'Супы', icon: '🍜' },
  { id: '5', name: 'Десерты', icon: '🍰' },
  { id: '6', name: 'Напитки', icon: '🥤' },
  { id: '7', name: 'Закуски', icon: '🍟' },
  { id: '8', name: 'Паста', icon: '🍝' }
]

const MOCK_BANNERS = [
  {
    id: '1',
    title: 'Скидка 20%',
    description: 'На все пиццы до конца недели',
    bgColor: 'from-orange-400 to-red-500'
  },
  {
    id: '2',
    title: 'Комбо обед',
    description: 'Суп + основное блюдо за 3500₸',
    bgColor: 'from-green-400 to-emerald-500'
  },
  {
    id: '3',
    title: 'Happy Hours',
    description: '2 напитка по цене 1 с 14:00-16:00',
    bgColor: 'from-blue-400 to-cyan-500'
  }
]

const MOCK_ITEMS = [
  {
    id: '1',
    categoryId: '1',
    name: 'Маргарита',
    description: 'Томатный соус, моцарелла, базилик',
    price: 2500,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop'
  },
  {
    id: '2',
    categoryId: '1',
    name: 'Пепперони',
    description: 'Томатный соус, моцарелла, пепперони',
    price: 3000,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop'
  },
  {
    id: '3',
    categoryId: '2',
    name: 'Классический бургер',
    description: 'Говяжья котлета, салат, томат, соус',
    price: 2800,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop'
  },
  {
    id: '4',
    categoryId: '3',
    name: 'Цезарь',
    description: 'Курица, салат романо, пармезан, соус цезарь',
    price: 2200,
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop'
  },
  {
    id: '5',
    categoryId: '5',
    name: 'Тирамису',
    description: 'Классический итальянский десерт',
    price: 1800,
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop'
  }
]

export default function MenuPage() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const categoryRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({})
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isCategoriesOpen && selectedCategory && categoryRefs.current[selectedCategory]) {
      setTimeout(() => {
        categoryRefs.current[selectedCategory]?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        })
      }, 100)
    }
  }, [isCategoriesOpen, selectedCategory])

  const filteredItems = MOCK_ITEMS.filter(item => {
    const matchesCategory = !selectedCategory || item.categoryId === selectedCategory
    const matchesSearch = !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-gray-50 to-white pb-32">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="px-4 py-6">
          <h1 className="text-2xl font-semibold text-center text-gray-900">
            Кофейня Magribi
          </h1>
        </div>
      </header>

      <div className="px-4 py-4">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          {MOCK_BANNERS.map(banner => (
            <div
              key={banner.id}
              className={`flex-shrink-0 w-[280px] h-32 rounded-3xl bg-white p-5 text-white border border-gray-200 active:scale-95 transition-transform`}
            >
              <h3 className="text-xl font-bold mb-1">{banner.title}</h3>
              <p className="text-sm text-white/90">{banner.description}</p>
            </div>
          ))}
        </div>
      </div>

      <main className="px-4 py-2 space-y-4">
        {filteredItems.map(item => (
          <div
            key={item.id}
            className="bg-white rounded-3xl overflow-hidden shadow-sm active:scale-[0.98] transition-transform"
          >
            <div className="flex gap-4 p-4">
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-100">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg text-gray-900 truncate">
                  {item.name}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                  {item.description}
                </p>
                <p className="text-lg font-bold text-gray-900 mt-2">
                  {item.price.toLocaleString('ru-KZ')} ₸
                </p>
              </div>
            </div>
          </div>
        ))}
      </main>

      <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50 px-4">
        <div className="bg-white rounded-[28px] shadow-2xl border border-gray-200/50 backdrop-blur-xl">
          <div className="flex items-center gap-2 p-2">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-14 h-14 rounded-full flex items-center justify-center active:scale-90 transition-transform"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            <button
              onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
              className="w-14 h-14 rounded-full flex items-center justify-center active:scale-90 transition-transform"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <button
              className="w-14 h-14 rounded-full flex items-center justify-center active:scale-90 transition-transform"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isCategoriesOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setIsCategoriesOpen(false)}
          />
          <div className="fixed bottom-28 left-0 right-0 z-50 px-4">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-200/50 p-2 max-w-[90vw] mx-auto">
              <div
                ref={scrollContainerRef}
                className="flex gap-2 overflow-x-auto scrollbar-hide py-2 px-1"
              >
                <button
                  ref={(el) => { categoryRefs.current['all'] = el }}
                  onClick={() => {
                    setSelectedCategory(null)
                    setIsCategoriesOpen(false)
                  }}
                  className={`flex-shrink-0 px-5 py-3 rounded-2xl font-medium transition-all whitespace-nowrap ${!selectedCategory
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 active:bg-gray-200'
                    }`}
                >
                  Все
                </button>
                {MOCK_CATEGORIES.map(category => (
                  <button
                    key={category.id}
                    ref={(el) => { categoryRefs.current[category.id] = el }}
                    onClick={() => {
                      setSelectedCategory(category.id)
                      setIsCategoriesOpen(false)
                    }}
                    className={`flex-shrink-0 px-5 py-3 rounded-2xl font-medium transition-all whitespace-nowrap ${selectedCategory === category.id
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 active:bg-gray-200'
                      }`}
                  >
                    {category.icon} {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {isSearchOpen && (
        <div className="fixed inset-0 bg-white z-50 animate-in slide-in-from-bottom duration-300">
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setIsSearchOpen(false)
                    setSearchQuery('')
                  }}
                  className="w-10 h-10 rounded-full flex items-center justify-center active:bg-gray-100 transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск блюд..."
                  autoFocus
                  className="flex-1 bg-gray-100 rounded-2xl px-4 py-3 text-base outline-none focus:ring-2 focus:ring-gray-300 transition-shadow"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {searchQuery && filteredItems.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">Ничего не найдено</p>
                </div>
              )}
              {searchQuery && filteredItems.map(item => (
                <div
                  key={item.id}
                  onClick={() => setIsSearchOpen(false)}
                  className="bg-gray-50 rounded-2xl p-4 active:bg-gray-100 transition-colors"
                >
                  <h4 className="font-semibold text-gray-900">{item.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                  <p className="font-bold text-gray-900 mt-2">
                    {item.price.toLocaleString('ru-KZ')} ₸
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}
