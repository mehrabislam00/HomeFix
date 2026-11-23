import { NextResponse } from 'next/server'
import { startCustomerPayment } from '../../../lib/Action/payment-actions'

export async function POST(request) {
  let bookingId
  try {
    const body = await request.json()
    bookingId = body?.bookingId
  } catch {
    return NextResponse.json({ error: 'A valid booking ID is required.' }, { status: 400 })
  }
  if (typeof bookingId !== 'string' || !bookingId.trim()) {
    return NextResponse.json({ error: 'A valid booking ID is required.' }, { status: 400 })
  }

  const result = await startCustomerPayment(bookingId)
  return result.ok
    ? NextResponse.json({ checkoutUrl: result.checkoutUrl })
    : NextResponse.json({ error: result.error }, { status: result.status })
}