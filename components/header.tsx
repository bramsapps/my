import Image from "next/image"
import Link from "next/link"
import { Archive } from "lucide-react"

export default function Header() {
  return (
    <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-12 w-12">
            <Image src="/logo.png" alt="Twee Stoelen Logo" fill className="object-contain" priority />
          </div>
          <div>
            <h1 className="text-xl font-bold text-teal-600">Twee Stoelen</h1>
            <p className="text-sm text-orange-500">Waar staan ze deze keer</p>
          </div>
        </Link>
        <nav>
          <Link href="/archief" className="flex items-center gap-1 text-teal-600 hover:text-teal-800">
            <Archive className="h-4 w-4" />
            <span>Archief</span>
          </Link>
        </nav>
      </div>
    </header>
  )
}
