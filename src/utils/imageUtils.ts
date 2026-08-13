import heroBgImg from '../assets/images/resort_hero_bg_1785309990556.jpg';
import villaPoolImg from '../assets/images/resort_villa_pool_1785310007598.jpg';
import deluxeRoomImg from '../assets/images/resort_deluxe_room_1785310020129.jpg';
import infinityPoolImg from '../assets/images/resort_infinity_pool_1785310034114.jpg';

/**
 * Safely resolves raw or stale `/src/assets/images/...` image string paths
 * to bundled Vite asset URLs.
 */
export function resolveImageUrl(url?: string | null): string {
  if (!url) return '';

  // Data URLs, Blob URLs, and external http/https URLs are returned as-is
  if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('http://') || url.startsWith('https://')) {
    // If an external URL is NOT a /src/assets/ string, return it
    if (!url.includes('/src/assets/') && !url.includes('src/assets/')) {
      return url;
    }
  }

  if (url.includes('resort_infinity_pool_1785310034114') || url.includes('infinity_pool')) {
    return infinityPoolImg;
  }
  if (url.includes('resort_villa_pool_1785310007598') || url.includes('villa_pool')) {
    return villaPoolImg;
  }
  if (url.includes('resort_hero_bg_1785309990556') || url.includes('hero_bg')) {
    return heroBgImg;
  }
  if (url.includes('resort_deluxe_room_1785310020129') || url.includes('deluxe_room')) {
    return deluxeRoomImg;
  }

  if (url.includes('/src/assets/') || url.includes('src/assets/')) {
    if (url.includes('infinity')) return infinityPoolImg;
    if (url.includes('villa')) return villaPoolImg;
    if (url.includes('hero')) return heroBgImg;
    if (url.includes('deluxe')) return deluxeRoomImg;
  }

  return url;
}
