import { resend } from "@/src/lib/resend";
import VerificationEmail from "@/emails/verificationEmail";
import { ApiResponse } from "../types/ApiResponse";
import { render } from "@react-email/render";

export async function sendVerificationEmail(email: string, username: string, verifyCode: string): Promise<ApiResponse> {
    try {
        const html = await render(VerificationEmail({ username, otp: verifyCode, email }));

        await resend.emails.send({
            from: "onboarding@resend.dev",
            to: "xxyzzz20.20@gmail.com",
            subject: "open-feedback Message Verification Code",
            html: html
        });

        return { success: true, message: "Verification email sent successfully" }

    } catch (emailError) {
        console.error("Error in sending verification email:", emailError)
        const errorMessage = emailError instanceof Error ? emailError.message : String(emailError)
        return { success: false, message: `Failed to send verification email: ${errorMessage}` }
    }
}