import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { ConfigService } from '@nestjs/config';
import { UsersService } from "../users/users.service";
import { MailerService } from '@nestjs-modules/mailer';
import { configUrl } from "../config/config";
import { SendMailInfo } from "../types/mail";

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    @Inject(forwardRef(() => UsersService)) private usersService: UsersService,
    private configService: ConfigService,
  ) {
  }

  async generateUrl(data, actionType): Promise<string> {
    const { id, role, verificationToken } = data;
    const appUrl = configUrl.appUrl;
    return `${appUrl}auth/${actionType}/${role}/confirm/${id}/${verificationToken}`;
  }

  async sendMail(to: string, subject: string, html: string): Promise<SendMailInfo> {
    return this.mailerService.sendMail({
      to,
      subject,
      html,
    });
  }
}