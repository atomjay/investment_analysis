'use client'

import { ChartBarIcon } from '@heroicons/react/24/outline'

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <nav className="container-custom">
        <div className="flex items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-primary-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">
              iBank
            </span>
          </div>
        </div>
      </nav>
    </header>
  )
}