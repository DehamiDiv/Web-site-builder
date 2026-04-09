import { Request, Response } from "express";
import Stripe from "stripe";


export const sripeWebhook = async (req: Request, res: Response) => {
   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
   const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
     let event;
  if (endpointSecret) {
    // Get the signature sent by Stripe
    const signature = reqest.headers['stripe-signature'] as string;
    try {
      event = stripe.webhooks.constructEvent(
        request.body,
        signature,
        endpointSecret
      );
    } catch (err:any) {
      console.log(`⚠️ Webhook signature verification failed.`, err.message);
      return response.sendStatus(400);
    }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      const sessionList = await stripe.checkout.sessions.list({
        payment_intent: paymentIntent.id
      })
      const session = sessionList.data[0];
      const {transactionId, appId} = session.metadata as {transactionId: string; appId: string}
      if(appId === 'ai-site-builder' && transactionId){
        const transaction = await prisma.transaction.update({
            where: {
                id: transactionId
            },
            data: {
                isPaid: true,
                status: 'success'
            }
        })

        await prisma.user.update({
            where: {
                id: transactionId
            },
            data: {
                isPaid: true
            }
        })
      }
      // Then define and call a method to handle the successful payment intent.
      // handlePaymentIntentSucceeded(paymentIntent);
      break;
    
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  response.json({received: true});
}
}