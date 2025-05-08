// Hulpfuncties voor netwerkoperaties

// Functie om te controleren of de netwerk verbinding beschikbaar is
export function isOnline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine
}

// Functie om een fetch uit te voeren met timeout
export async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 10000): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

// Functie om een fetch uit te voeren met retry en timeout
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = 3,
  timeout = 10000,
): Promise<Response> {
  let lastError: Error | null = null

  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      return response
    } catch (error: any) {
      console.warn(`Fetch poging ${i + 1} mislukt:`, error)
      lastError = error
      // Wacht even voordat we opnieuw proberen (exponentiële backoff)
      await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, i)))
    }
  }

  throw lastError || new Error("Fetch mislukt na meerdere pogingen")
}

// Functie om een API aanroep te doen met betere foutafhandeling
export async function apiCall<T>(
  url: string,
  options: RequestInit = {},
): Promise<{ data: T | null; error: string | null }> {
  try {
    if (!isOnline()) {
      return { data: null, error: "Je bent offline. Controleer je internetverbinding." }
    }

    const response = await fetchWithRetry(url, options)

    if (!response.ok) {
      let errorMessage = `Server fout: ${response.status}`
      try {
        const errorData = await response.json()
        errorMessage = errorData.error || errorMessage
      } catch (e) {
        // Kon de foutmelding niet parsen, gebruik de standaard
      }
      return { data: null, error: errorMessage }
    }

    try {
      const data = await response.json()
      return { data, error: null }
    } catch (error) {
      return { data: null, error: "Kon de server response niet verwerken" }
    }
  } catch (error: any) {
    const errorMessage =
      error.name === "AbortError"
        ? "De aanvraag duurde te lang. Probeer het later opnieuw."
        : error.message || "Er is een onverwachte fout opgetreden"
    return { data: null, error: errorMessage }
  }
}
