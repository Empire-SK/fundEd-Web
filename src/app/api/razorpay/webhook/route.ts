
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { initializeFirebase } from '@/firebase/server-init';

// This is required to initialize the admin app on the server
const { firestore } = initializeFirebase();

export async function POST(request: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!secret) {
    console.error('Razorpay webhook secret not configured (RAZORPAY_WEBHOOK_SECRET is missing)');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  try {
    const text = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Signature missing' }, { status: 400 });
    }

    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(text);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(text);

    if (event.event === 'payment.captured') {
      const paymentEntity = event.payload.payment.entity;
      const orderId = paymentEntity.order_id;

      const { eventId, studentId, classId } = paymentEntity.notes || {};

      if (!classId || !eventId || !studentId) {
        console.warn('Webhook received for order without required notes:', orderId);
        return NextResponse.json({ status: 'ignored', reason: 'Missing required notes' });
      }

      // Use the Admin SDK's querying surface (do not mix client SDK helpers)
      const paymentsCollectionRef = firestore.collection(`classes/${classId}/payments`);
      const querySnapshot = await paymentsCollectionRef.where('razorpay_order_id', '==', orderId).get();

      if (querySnapshot.empty) {
        console.error('No payment document found for order_id:', orderId);
        return NextResponse.json({ error: 'Payment document not found' }, { status: 404 });
      }

      const paymentDoc = querySnapshot.docs[0];
      const paymentRef = paymentDoc.ref;

      // Update the payment doc (idempotent)
      await paymentRef.update({
        status: 'Paid',
        transactionId: paymentEntity.id,
      });

      console.log(`Payment ${paymentDoc.id} updated to Paid for order ${orderId}`);
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
