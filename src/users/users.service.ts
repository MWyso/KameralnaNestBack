import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { Users } from './entity/users.entity';
import { AuthService } from "../auth/auth.service";
import { ApiResponse, CreateResponse, UserRole } from "@Types";
import { MailService } from "../mail/mail.service";
import { UserRegistrationTemplate } from "../templates/email/user-registration";

@Injectable()
export class UsersService {

  constructor(
    @Inject(forwardRef(() => AuthService)) private authService: AuthService,
  private mailService: MailService,
  ) {}

  async getUserByEmail(email: string): Promise<Users> {
    return await Users.findOneBy({ email });
  }

  async getUserById(id: string): Promise<Users> {
    return await Users.findOneBy({ id });
  }

  async createUser(formData): Promise<ApiResponse<CreateResponse>> {
    if (await this.authService.checkEmail(formData.email))
      throw new HttpException(`Użytkownik o emailu ${formData.email} już istnieje`, HttpStatus.BAD_REQUEST);
    try {
      const user = new Users();
      user.email = formData.email;
      user.name = formData.name;
      await user.save();
      user.verificationToken = await this.authService.hashData(
        await this.authService.generateEmailToken(user.id, user.email),
      );
      await user.save();
      user.activationUrl = await this.mailService.generateUrl(user, 'new-user');
      await user.save();
      this.mailService
        .sendEmailsToUsers(this.mailService, [user], 'Potwierdzenie rejestracji', (activationUrl) =>
          UserRegistrationTemplate(activationUrl, UserRole.USER),
        )
        .catch((error) => {
          console.error('Failed to send email to HR:', error.message);
        });
      return {
        isSuccess: true,
        payload: { id: user.id },
      };
    } catch (e) {
      throw new HttpException('Dodanie użytkownika nie powiodło się. Spróbuj ponownie później', HttpStatus.BAD_REQUEST);
    }
  }
}
