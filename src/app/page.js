import Navbar from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 
      py-20 text-center">
        
        <h1 className="text-6xl font-bold 
        text-gray-800 mb-6">
          Crack Your Exam with
          <span className="text-blue-600">
            {' '}ExamBuddy 🎓
          </span>
        </h1>

        <p className="text-xl text-gray-500 
        mb-8 max-w-2xl mx-auto">
          Smart preparation platform for 
          GPSC, UPSC, SSC & Railway exams. 
          Study smarter, not harder!
        </p>

        <div className="flex gap-4 
        justify-center mb-16">
          <Link href="/register">
            <Button size="lg" 
            className="text-lg px-8 py-6">
              Start Free 🚀
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline"
            className="text-lg px-8 py-6">
              Login
            </Button>
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 
        md:grid-cols-3 gap-6">
          
          <div className="bg-white rounded-xl 
          p-6 shadow-sm border border-gray-100">
            <div className="text-4xl mb-3">📝</div>
            <h3 className="text-lg font-semibold 
            text-gray-800 mb-2">
              Mock Tests
            </h3>
            <p className="text-gray-500 text-sm">
              Practice with real exam pattern 
              questions
            </p>
          </div>

          <div className="bg-white rounded-xl 
          p-6 shadow-sm border border-gray-100">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="text-lg font-semibold 
            text-gray-800 mb-2">
              Performance Analytics
            </h3>
            <p className="text-gray-500 text-sm">
              Track your progress with 
              detailed reports
            </p>
          </div>

          <div className="bg-white rounded-xl 
          p-6 shadow-sm border border-gray-100">
            <div className="text-4xl mb-3">🌐</div>
            <h3 className="text-lg font-semibold 
            text-gray-800 mb-2">
              Multilingual
            </h3>
            <p className="text-gray-500 text-sm">
              Study in Gujarati, Hindi 
              or English
            </p>
          </div>

        </div>
      </section>

    </main>
  )
}