import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"
import { nl } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string, showTime = false): string {
  const date = new Date(dateString)

  if (showTime) {
    return format(date, "d MMMM yyyy 'om' HH:mm", { locale: nl })
  }

  return format(date, "d MMMM yyyy", { locale: nl })
}

// Veilige fetch functie die nooit faalt
export async function safeFetch(url: string, options: RequestInit = {}): Promise<Response> {
  try {
    const response = await fetch(url, options)
    return response
  } catch (error) {
    console.error("Fetch error:", error)
    // Retourneer een mock response bij een fetch error
    return new Response(JSON.stringify({ error: "Netwerkfout, kon geen verbinding maken" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
