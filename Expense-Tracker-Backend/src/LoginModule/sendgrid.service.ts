import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailDataRequired } from '@sendgrid/helpers/classes/mail';
import * as SendGrid from '@sendgrid/mail';

@Injectable()
export class SendGridService {
  constructor(private readonly configService: ConfigService) {
    // Set the SendGrid API key from an environment variable
    // SendGrid.setApiKey(this.configService.get<string>('Bearer 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'));
    SendGrid.setApiKey(process.env.SENDGRID_API_KEY)
}

  async send(mail: SendGrid.MailDataRequired) {
    console.log(`mail.to`, mail.to);
    console.log(`mail.from`, mail.from);
    const transport = await SendGrid.send(mail);
    console.log(`E-Mail sent to ${mail.to}`);
    return transport;
  }
}
