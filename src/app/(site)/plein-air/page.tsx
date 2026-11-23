import { GalleryPage, galleryMetadata } from '@/components/GalleryPage'
import { GALLERIES } from '@/lib/site'

const def = GALLERIES[1]

export const generateMetadata = () => galleryMetadata(def)

export default function PleinAirPage() {
  return <GalleryPage def={def} />
}
