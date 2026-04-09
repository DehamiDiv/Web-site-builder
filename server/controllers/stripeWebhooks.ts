import { Request, Response } from "express";
import Stripe from "stripe";
import prisma from "../lib/prisma.js";

export const stripeWebhooks = async (req: Request, res: Response) => {
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) {
        console.error("Missing STRIPE_SECRET_KEY");
        res.status(500).send("Stripe not configured");
        return;
    }
    const stripe = new Stripe(stripeSecret);
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    if (endpointSecret) {
        // Get the signature sent by Stripe
        const signature = req.headers['stripe-signature'] as string;
        try {
            event = stripe.webhooks.constructEvent(
                req.body,
                signature,
                endpointSecret
            );
        } catch (err: any) {
            console.log(`⚠️ Webhook signature verification failed.`, err.message);
            res.sendStatus(400);
            return;
        }

        // Handle the event
        switch (event.type) {
            case 'payment_intent.succeeded':
            case 'checkout.session.completed': {
                const stripeObject = event.data.object as any;
                let session;

                if (event.type === 'payment_intent.succeeded') {
                    const sessionList = await stripe.checkout.sessions.list({
                        payment_intent: stripeObject.id
                    });
                    session = sessionList.data[0];
                } else {
                    session = stripeObject; // for checkout.session.completed
                }

                if (!session || !session.metadata) break;

                const { transactionId, appId } = session.metadata as { transactionId?: string; appId?: string };
                if (appId === 'ai-site-builder' && transactionId) {
                    try {
                        const transaction = await prisma.transaction.update({
                            where: {
                                id: transactionId
                            },
                            data: {
                                isPaid: true
                            }
                        });

                        await prisma.user.update({
                            where: {
                                id: transaction.userId
                            },
                            data: {
                                credits: {
                                    increment: transaction.credits
                                }
                            }
                        });
                    } catch (dbError) {
                        console.error('Error updating transaction/user:', dbError);
                    }
                }
                break;
            }

            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        // Return a response to acknowledge receipt of the event
        res.json({ received: true });
    } else {
        res.status(500).json({ error: "Missing STRIPE_WEBHOOK_SECRET" });
    }
};
