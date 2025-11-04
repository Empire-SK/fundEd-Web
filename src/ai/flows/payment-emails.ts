'use server';
/**
 * @fileOverview Genkit flows for sending payment-related emails.
 */

import { sendEmail } from '@/lib/email';
import { 
    PaymentConfirmationEmailInputSchema, 
    PaymentApprovedEmailInputSchema, 
    SendEmailOutputSchema,
    type PaymentConfirmationEmailInput, 
    type PaymentApprovedEmailInput,
    type SendEmailOutput
} from '@/lib/types';


// Wrapper action for the payment confirmation flow
export async function sendPaymentConfirmationEmail(input: PaymentConfirmationEmailInput): Promise<SendEmailOutput> {
  return await sendPaymentConfirmationEmailFlow(input);
}

// Wrapper action for the payment approved flow
export async function sendPaymentApprovedEmail(input: PaymentApprovedEmailInput): Promise<SendEmailOutput> {
  return await sendPaymentApprovedEmailFlow(input);
}


// Flow for sending payment confirmation email
async function sendPaymentConfirmationEmailFlow(input: PaymentConfirmationEmailInput): Promise<SendEmailOutput> {
    const emailBody = `
      Hi ${input.studentName},<br><br>
      This email confirms that your payment of ₹${input.amount} for the event "${input.eventName}" via ${input.paymentMethod} has been submitted successfully.<br><br>
      It is now pending verification by your class representative. You will receive another email once it's approved.<br><br>
      Sincerely,<br>
      The FundEd Team
    `;

    const subject = `Your payment for "${input.eventName}" has been submitted`;
    
    const result = await sendEmail({
        to: input.studentEmail,
        subject: subject,
        html: emailBody,
    });

    return result.success 
        ? { success: true, message: `Email successfully sent to ${input.studentEmail}.` }
        : { success: false, message: result.message || 'Failed to send email.' };
}


// Flow for sending payment approved email
async function sendPaymentApprovedEmailFlow(input: PaymentApprovedEmailInput): Promise<SendEmailOutput> {
    const emailBody = `
      Hi ${input.studentName},<br><br>
      Great news! Your payment of ₹${input.amount} for the event "${input.eventName}" has been approved by your class representative.<br><br>
      You're all set for this event.<br><br>
      Sincerely,<br>
      The FundEd Team
    `;

    const subject = `Your payment for "${input.eventName}" has been approved!`;
    
    const result = await sendEmail({
        to: input.studentEmail,
        subject: subject,
        html: emailBody,
    });

    return result.success 
        ? { success: true, message: `Email successfully sent to ${input.studentEmail}.` }
        : { success: false, message: result.message || 'Failed to send email.' };
}
