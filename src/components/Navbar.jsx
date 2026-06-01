import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Navbar() {
  return (
    <nav className="w-full bg-white border-b 
    border-gray-200 px-6 py-4">
      <div className="max-w-6xl mx-auto flex 
      items-center justify-between">
        
        {/* Logo */}
        <Link href="/">
          <h1 className="text-2xl font-bold 
          text-blue-600 cursor-pointer">
            ExamBuddy 🎓
          </h1>
        </Link>

        {/* Buttons */}
        <div className="flex gap-3">
          <Link href="/login">
            <Button variant="outline">
              Login
            </Button>
          </Link>
          <Link href="/register">
            <Button>
              Register
            </Button>
          </Link>
        </div>

      </div>
    </nav>
  )
}