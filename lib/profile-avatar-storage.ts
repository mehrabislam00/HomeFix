import "server-only"

import { Readable } from "node:stream"
import { pipeline } from "node:stream/promises"
import { GridFSBucket, ObjectId } from "mongodb"

import { db } from "@/lib/auth"

export const MAX_PROFILE_AVATAR_SIZE = 5 * 1024 * 1024

const bucket = new GridFSBucket(db, { bucketName: "profile_avatars" })

export class InvalidProfileAvatarError extends Error {}

export async function storeProfileAvatar(userId: string, file: File) {
  if (file.size === 0 || file.size > MAX_PROFILE_AVATAR_SIZE) {
    throw new InvalidProfileAvatarError(
      "Choose an image smaller than 5 MB."
    )
  }
  if (file.type !== "image/jpeg" && file.type !== "image/png") {
    throw new InvalidProfileAvatarError("Upload a JPG, JPEG, or PNG image.")
  }

  const contents = Buffer.from(await file.arrayBuffer())
  const isPng =
    contents.length >= 8 &&
    contents.subarray(0, 8).equals(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    )
  const isJpeg =
    contents.length >= 3 &&
    contents[0] === 0xff &&
    contents[1] === 0xd8 &&
    contents[2] === 0xff

  if ((file.type === "image/png" && !isPng) || (file.type === "image/jpeg" && !isJpeg)) {
    throw new InvalidProfileAvatarError(
      "The selected file is not a valid JPG or PNG image."
    )
  }

  const extension = file.type === "image/png" ? "png" : "jpg"
  const upload = bucket.openUploadStream(`${userId}.${extension}`, {
    metadata: { userId, contentType: file.type },
  })

  try {
    await pipeline(Readable.from([contents]), upload)
  } catch (error) {
    try {
      await bucket.delete(upload.id)
    } catch (cleanupError) {
      console.error("Unable to clean up an incomplete profile photo.", cleanupError)
    }
    throw error
  }

  return {
    id: upload.id,
    image: `/api/profile/avatar/${upload.id.toString()}`,
  }
}

export async function deleteProfileAvatar(
  image: string | null | undefined,
  userId: string
) {
  const match = image?.match(/^\/api\/profile\/avatar\/([a-f\d]{24})$/i)
  if (!match) return

  const id = new ObjectId(match[1])
  const existing = await bucket
    .find({ _id: id, "metadata.userId": userId })
    .next()
  if (existing) await bucket.delete(id)
}

export { bucket as profileAvatarBucket }
