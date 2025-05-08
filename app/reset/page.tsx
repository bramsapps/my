import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { resetDatabase } from "@/lib/reset-actions"

export const metadata = {
  title: "Database Reset - Twee Stoelen",
}

export default async function ResetPage() {
  // Voer de reset direct uit
  console.log("Starting reset process...")
  const { success, message } = await resetDatabase()
  console.log("Reset completed with status:", success, "and message:", message)

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <div className="mb-4">
        <Link href="/">
          <Button variant="ghost" className="pl-0">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Terug naar home
          </Button>
        </Link>
      </div>

      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Database Reset</h1>

        <div className={`p-4 mb-6 rounded-md ${success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
          <p>{message}</p>
        </div>

        <div className="flex justify-center">
          <Link href="/">
            <Button>{success ? "Ga naar Home" : "Terug naar Home"}</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
