import {Html, Head, Row, Section, Tailwind, Heading, Text, Preview} from "@react-email/components"

interface VerificationEmailProps{
    username: string,
    otp: string,
    email: string
}

export default function VerificationEmail({username, otp, email}: VerificationEmailProps) {
    return (
        <Html lang="en" dir="ltr">
            <Head>
                <title>
                    Verification Code
                </title>
            </Head>
            <Preview>
                Here is your verification code: {otp}
            </Preview>
            <Tailwind>
                <Section>
                    <Row>
                        <Heading as="h1">
                            Verification Code
                        </Heading>
                    </Row>
                    <Row>
                        <Text>
                            Hello {username},
                        </Text>
                    </Row>
                    <Row>
                        <Text>
                            Sign-up request received from: <strong>{email}</strong>
                        </Text>
                    </Row>
                    <Row>
                        <Text>
                            Thank you for registering. Here is your verification code: <strong>{otp}</strong>
                        </Text>
                    </Row>
                    <Row>
                        <Text>
                            This code will expire in 1 hour.
                        </Text>
                    </Row>
                </Section>
            </Tailwind>
        </Html>
    )
}