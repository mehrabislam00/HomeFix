import { Readable } from "node:stream"
import { ObjectId } from "mongodb"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import { profileAvatarBucket } from "@/lib/profile-avatar-storage"

export const runtime = "nodejs"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || session.user.role !== "customer") {
    return new Response("Unauthorized", { status: 401 })
  }

  const { id } = await params
  if (!/^[a-f\d]{24}$/i.test(id)) {
    return new Response("Not found", { status: 404 })
  }

  try {
    const objectId = new ObjectId(id)
    const file = await profileAvatarBucket
      .find({ _id: objectId, "metadata.userId": session.user.id })
      .next()
    if (!file) return new Response("Not found", { status: 404 })

    const contentType =
      file.metadata?.contentType === "image/png"
        ? "image/png"
        : file.metadata?.contentType === "image/jpeg"
          ? "image/jpeg"
          : null
    if (!contentType) return new Response("Not found", { status: 404 })

    const stream = profileAvatarBucket.openDownloadStream(objectId)
    return new Response(Readable.toWeb(stream) as ReadableStream<Uint8Array>, {
      headers: {
        "Cache-Control": "private, max-age=3600, immutable",
        "Content-Type": contentType,
        "X-Content-Type-Options": "nosniff",
      },
    })
  } catch (error) {
    console.error("Unable to load the profile photo.", error)
    return new Response("Unable to load profile photo", { status: 500 })
  }
}
