import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class EmailService {
  private transporter;

  constructor(private configService: ConfigService) {
    // Gmail SMTP 설정
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: this.configService.get<string>("EMAIL_USER"), // .env에 설정 필요
        pass: this.configService.get<string>("EMAIL_PASS"), // .env에 설정 필요 (앱 비밀번호)
      },
    });
  }

  async sendVerificationCode(email: string, code: string) {
    const mailOptions = {
      from: `"Mark-it! Team" <${this.configService.get("EMAIL_USER")}>`,
      to: email,
      subject: `"Mark-it! 인증 코드는 ${code}입니다."`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>이메일 인증</h2>
          <p>이 메일은 Mark-it! 회원 가입을 위해 발송되었습니다.<br>귀하의 인증 코드는 아래와 같습니다.</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333;">${code}</span>
          </div>
          <p>이 코드는 5분간 유효합니다.</p>
          <p><b>Mark-it! Team</b></p>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
