'use client'

import { useState } from 'react'
import { ChartBarIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigation = [
    { name: '首頁', href: '#home' },
    { name: '功能介紹', href: '#features' },
    { name: '市場概況', href: '#market' },
  ]

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <nav className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <ChartBarIcon className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                iBank
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-600 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors duration-200"
                  onClick={(e) => {
                    e.preventDefault()
                    const element = document.querySelector(item.href)
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' })
                    }
                  }}
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <button
              onClick={() => {
                const searchElement = document.querySelector('#stock-search')
                if (searchElement) {
                  searchElement.scrollIntoView({ behavior: 'smooth' })
                }
              }}
              className="btn-primary"
            >
              開始分析
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" />
              ) : (
                <Bars3Icon className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-gray-600 hover:text-primary-600 block px-3 py-2 text-base font-medium transition-colors duration-200"
                    onClick={(e) => {
                      e.preventDefault()
                      setMobileMenuOpen(false)
                      const element = document.querySelector(item.href)
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' })
                      }
                    }}
                  >
                    {item.name}
                  </a>
                ))}
                <div className="px-3 pt-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      const searchElement = document.querySelector('#stock-search')
                      if (searchElement) {
                        searchElement.scrollIntoView({ behavior: 'smooth' })
                      }
                    }}
                    className="w-full btn-primary"
                  >
                    開始分析
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  )
}