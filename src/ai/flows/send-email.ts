'use server';
/**
 * @fileOverview A Genkit flow for sending print distribution emails.
 *
 * This file defines a Genkit flow that composes and sends an email
 * to a student when they receive a print distribution.
 */

import { sendEmail } from '@/lib/email';
import { SendEmailInputSchema, SendEmailOutputSchema, type SendEmailInput, type SendEmailOutput } from '@/lib/types';


/**
 * Server action to trigger the print distribution email flow.
 * @param input The data required to send the email.
 * @returns The result of the flow execution.
 */
export async function sendPrintDistributionEmail(input: SendEmailInput): Promise<SendEmailOutput> {
  return await sendPrintDistributionEmailFlow(input);
}


async function sendPrintDistributionEmailFlow(input: SendEmailInput): Promise<SendEmailOutput> {

    const emailBody = `
      Hi ${input.studentName},<br><br>
      This is to notify you that the print material for the event "${input.eventName}" has been distributed.<br><br>
      Please collect it from your class representative if you haven't already.<br><br>
      Sincerely,<br>
      The FundEd Team
    `;

    const subject = `Your print for "${input.eventName}" has been distributed!`;
    
    const result = await sendEmail({
        to: input.studentEmail,
        subject: subject,
        html: emailBody,
    });

    if (result.success) {
        return {
            success: true,
            message: `Email successfully sent to ${input.studentEmail}.`,
        };
    } else {
        return {
            success: false,
            message: result.message || 'Failed to send email via the email service.',
        };
    }
}
