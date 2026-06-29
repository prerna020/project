import { resend } from "@/src/lib/resend";
import VerificationEmail from "@/emails/verificationEmail";
import { ApiResponse } from "../types/ApiResponse";

export async function sendVerificationEmail(email: string, username: string, verifyCode: string): Promise<ApiResponse> {
    try {
        await resend.emails.send({
            from: "onboarding@resend.dev",
            to: email,
            subject: "open-feedback Message Verification Code",
            react: VerificationEmail({ username, otp: verifyCode })
        });

        return { success: true, message: "Verification email sent successfully" }

    } catch (emailError) {
        console.error("Error in sending verification email:", emailError)
        const errorMessage = emailError instanceof Error ? emailError.message : String(emailError)
        return { success: false, message: `Failed to send verification email: ${errorMessage}` }

    }

}