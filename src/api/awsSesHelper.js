import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const region = process.env.AWS_REGION || 'us-east-1';
const sesClient = new SESClient({ region });

export async function sendEmailViaSes({ to, subject, htmlBody, fromEmail = 'edwingligah124@gmail.com' }) {
  const params = {
    Source: `Apple Music PayTrack <${fromEmail}>`,
    Destination: {
      ToAddresses: Array.isArray(to) ? to : [to]
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: 'UTF-8'
      },
      Body: {
        Html: {
          Data: htmlBody,
          Charset: 'UTF-8'
        }
      }
    }
  };

  const command = new SendEmailCommand(params);
  const response = await sesClient.send(command);
  console.log('[Amazon SES Success] Dispatched email MessageId:', response.MessageId);
  return response;
}
