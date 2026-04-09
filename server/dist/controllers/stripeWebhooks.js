"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeWebhooks = void 0;
const stripe_1 = __importDefault(require("stripe"));
const prisma_js_1 = __importDefault(require("../lib/prisma.js"));
const stripeWebhooks = async (req, res) => {
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) {
        console.error("Missing STRIPE_SECRET_KEY");
        res.status(500).send("Stripe not configured");
        return;
    }
    const stripe = new stripe_1.default(stripeSecret);
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;
    if (endpointSecret) {
        // Get the signature sent by Stripe
        const signature = req.headers['stripe-signature'];
        try {
            event = stripe.webhooks.constructEvent(req.body, signature, endpointSecret);
        }
        catch (err) {
            console.log(`⚠️ Webhook signature verification failed.`, err.message);
            res.sendStatus(400);
            return;
        }
        // Handle the event
        switch (event.type) {
            case 'payment_intent.succeeded':
            case 'checkout.session.completed': {
                const stripeObject = event.data.object;
                let session;
                if (event.type === 'payment_intent.succeeded') {
                    const sessionList = await stripe.checkout.sessions.list({
                        payment_intent: stripeObject.id
                    });
                    session = sessionList.data[0];
                }
                else {
                    session = stripeObject; // for checkout.session.completed
                }
                if (!session || !session.metadata)
                    break;
                const { transactionId, appId } = session.metadata;
                if (appId === 'ai-site-builder' && transactionId) {
                    try {
                        const transaction = await prisma_js_1.default.transaction.update({
                            where: {
                                id: transactionId
                            },
                            data: {
                                isPaid: true
                            }
                        });
                        await prisma_js_1.default.user.update({
                            where: {
                                id: transaction.userId
                            },
                            data: {
                                credits: {
                                    increment: transaction.credits
                                }
                            }
                        });
                    }
                    catch (dbError) {
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
    }
    else {
        res.status(500).json({ error: "Missing STRIPE_WEBHOOK_SECRET" });
    }
};
exports.stripeWebhooks = stripeWebhooks;
