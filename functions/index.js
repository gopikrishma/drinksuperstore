/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// const {onRequest} = require("firebase-functions/v2/https");
// const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const functions = require("firebase-functions");
const stripe = require("stripe")(
    "sk_test_51Q6zRJ08j24kfnWIJkcDYQS14RvcoFailKK85NtxuccxDF7i3PXmoWJBmXSURl8PuQI8KHaErNq03nLDGvQRu9GF00D4edMrcl",
); // Your secret key here

// Firebase Cloud Function to create a Payment Intent in USD
exports.createPaymentIntent = functions.https.onCall(async (data, context) => {
  const {amount} = data; // Extract the amount from the data sent by the frontend

  try {
    // Create a PaymentIntent with the specified amount in USD
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Amount in cents (e.g., 5000 for $50.00)
      currency: "usd", // Set currency to USD
    });

    // Log the clientSecret for debugging purposes
    console.log("Created PaymentIntent clientSecret:", paymentIntent.client_secret);

    // Return the clientSecret to the frontend
    return {
      clientSecret: paymentIntent.client_secret,
    };
  } catch (error) {
    // Log any errors
    console.error("Error creating PaymentIntent:", error.message);
    throw new functions.https.HttpsError("unknown", error.message);
  }
});
