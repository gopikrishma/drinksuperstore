import { Component, inject } from '@angular/core';
import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';
import { Functions, httpsCallable } from '@angular/fire/functions';  // Import Firebase Functions
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports:[FormsModule,CommonModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
})
export class CheckoutComponent {

  stripe: Stripe | null = null;
  elements: StripeElements | null = null;
  card: StripeCardElement | any = null;
  cardExpiry: any;
  cardCvc: any;
  email: string ='';
  nameOnCard: string='';
  country: string='';
  postalCode: string='';

  // Inject Firebase Functions using Angular's inject function
  private functions = inject(Functions);

  async ngOnInit() {
    // Initialize Stripe.js with your public key
    this.stripe = await loadStripe('pk_test_51Q6zRJ08j24kfnWI5bVXBm9tGA5MvrHLNIycmTApAk0Erf2Odbr0DSJMdbhGgBdKoi3JsQTyODxnqSuOkPC0lwex00fD8Y20PO');
    if (this.stripe) {
      this.elements = this.stripe.elements();
      
      this.elements = this.stripe.elements();
      
      // Create Card Number Element
      this.card = this.elements.create('cardNumber', { style: this.style });
      this.card.mount('#card-number-element'); 

      // Create Card Expiry Element
      this.cardExpiry = this.elements.create('cardExpiry', { style: this.style });
      this.cardExpiry.mount('#card-expiry-element'); 

      // Create Card CVC Element
      this.cardCvc = this.elements.create('cardCvc', { style: this.style });
      this.cardCvc.mount('#card-cvc-element'); 
    }
  }

  style = {
    base: {
      fontSize: '16px',
      color: '#32325d',
      '::placeholder': {
        color: '#aab7c4'
      }
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a'
    }
  };

  // Create Payment Intent via Firebase Callable Function
  async createPaymentIntent(amount: number) {
    const callable = httpsCallable(this.functions, 'createPaymentIntent');

    try {
      // Call Firebase function and await the response (which should contain client_secret)
      const response : any = await callable({ amount });
  
      // Log the response to see what you're getting from Firebase
      console.log('Firebase callable response:', response);
  
      if (this.stripe && this.card && response.data) {
        const clientSecret = response.data.clientSecret;
  
        // Log the Stripe instance, card element, and client secret for debugging
        console.log('Stripe instance:', this.stripe);
        console.log('Card element:', this.card);
        console.log('Client secret:', clientSecret);
  
        // Confirm the payment with Stripe
        const result = await this.stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: this.card,  // Pass the card element
          },
        });
  
        // Log the result of the payment confirmation
        console.log('Stripe payment result:', result);
  
        if (result.error) {
          console.error('Payment failed:', result.error.message);
        } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
          console.log('Payment successful!');
        }
      } else {
        console.error('Error: Stripe, card, or response.data is missing.');
      }
    } catch (error) {
      console.error('Error creating payment intent:', error);
    }
  }
  
  // Trigger the payment when the user submits the form
  onSubmit(event:any) {
    this.createPaymentIntent(5000);  // Example: Charge £50 (5000 pence)
  }
} 
