import { Injectable } from '@nestjs/common';
import * as postmark from 'postmark';

@Injectable()
export class PostmarkService {
  private client = new postmark.ServerClient(process.env.POSTMARK_API_KEY || '');

  async sendEmail(message: any) {
    const response = await this.client.sendEmail({
      To: message.to,
      From: message.from,
      Subject: message.subject,
      TextBody: message.textBody,
      HtmlBody: message.htmlBody,
    });
    return response;
  }
}
