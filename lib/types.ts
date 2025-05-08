export interface Photo {
  id: number
  image_url: string
  created_at: string
  is_current: boolean
  location_lat: number | null
  location_lng: number | null
  location_name: string | null
  description: string | null
  photo_date: string | null
}
