import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { doc, updateDoc } from 'firebase/firestore'
import { signInAnonymously } from 'firebase/auth'
import { db, storage, auth } from '../lib/firebase'

const STANDARD_WIDTH = 3500

interface UploadResult {
  url: string
  width: number
  height: number
}

async function ensureAuth() {
  if (!auth.currentUser) {
    await signInAnonymously(auth)
  }
}

/**
 * Resize an image to STANDARD_WIDTH (3500px) to normalize coordinate space.
 */
function resizeImage(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.onload = () => {
      const scale = STANDARD_WIDTH / img.naturalWidth
      const w = STANDARD_WIDTH
      const h = Math.round(img.naturalHeight * scale)

      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, w, h)

      canvas.toBlob(
        (b) => (b ? resolve({ blob: b, width: w, height: h }) : reject(new Error('Resize failed'))),
        'image/png'
      )
      URL.revokeObjectURL(img.src)
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Upload an image file (PNG/JPG) — resized to standard width first.
 */
export async function uploadImageFile(
  eventId: string,
  file: File
): Promise<UploadResult> {
  console.log('[Upload] uploadImageFile called, file:', file.name)
  await ensureAuth()

  // Resize to standard width
  const { blob, width, height } = await resizeImage(file)
  console.log('[Upload] Resized to:', width, 'x', height)

  // Upload
  const storageRef = ref(storage, `venues/${eventId}/floorplan.png`)
  await uploadBytes(storageRef, blob)
  const url = await getDownloadURL(storageRef)
  console.log('[Upload] Uploaded, URL:', url)

  // Update Firestore
  await updateDoc(doc(db, 'events', eventId), {
    venueImageUrl: url,
    venueImageWidth: width,
    venueImageHeight: height,
  })

  return { url, width, height }
}

/**
 * Upload a rendered PDF page (as Blob) to Firebase Storage.
 */
export async function uploadPdfBlob(
  eventId: string,
  blob: Blob,
  width: number,
  height: number
): Promise<UploadResult> {
  await ensureAuth()

  const storageRef = ref(storage, `venues/${eventId}/floorplan.png`)
  await uploadBytes(storageRef, blob)
  const url = await getDownloadURL(storageRef)

  await updateDoc(doc(db, 'events', eventId), {
    venueImageUrl: url,
    venueImageWidth: width,
    venueImageHeight: height,
  })

  return { url, width, height }
}
