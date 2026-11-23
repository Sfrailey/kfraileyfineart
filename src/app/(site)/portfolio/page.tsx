import { GalleryPage, galleryMetadata } from '@/components/GalleryPage'
import { GALLERIES } from '@/lib/site'

const def = GALLERIES[0]

export const generateMetadata = () => galleryMetadata(def)

export default function PortfolioPage() {
  return <GalleryPage def={def} />
}
