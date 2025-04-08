import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OnEvent } from "@nestjs/event-emitter";
import { KafkaSchemas } from "@pezzo/kafka";
import sgMail, { MailDataRequired } from "@sendgrid/mail";
import { PinoLogger } from "../logger/pino-logger";

export const emailTemplates: Record<keyof KafkaSchemas, string> = {
  "org-invitation-created": "d-93573dce290d40deb57c4a49ed0d4c49",
};

@Injectable()
export class NotificationsService {
  constructor(private config: ConfigService, private logger: PinoLogger) {
    sgMail.setApiKey(this.config.get("SENDGRID_API_KEY"));
  }

  @OnEvent("org-invitation-created")
  async sendOrgInvitationEmail(data: KafkaSchemas["org-invitation-created"]) {
    this.logger.info("Received org-invitation-created event ANOOP");
    this.logger.assign({ data }).info("Received org-invitation-created event");
    // const templateId = emailTemplates["org-invitation-created"];
    const templateId = this.config.get("SENDGRID_TEMPLATE_ID");

    this.logger.info({ templateId, data }, "Sending org invitation email");

    const safeOrgName = data.organizationName.replace(/[&<>"']/g, (char) => {
      switch (char) {
        case '&': return '&amp;';
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '"': return '&quot;';
        case "'": return '&#39;';
        default: return char;
      }
    });

    const mailData: MailDataRequired = {
      to: data.email,
      from: this.config.get("SENDGRID_FROM_EMAIL"),
      templateId,
      dynamicTemplateData: {
        ...data,
        organizationName: safeOrgName,
        invitationUrl: `${data.invitationUrl}`,
      },
    };

    try {
      this.logger.info("About to send email");
      await sgMail.send(mailData);
      this.logger.info("Email sent successfully");
    } catch (error) {
      this.logger.error({ error }, "Failed to send email");
    }
  }
}
