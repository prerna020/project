import {Html, Head, Row, Section, Tailwind, Heading, Text, Button, Preview} from "@react-email/components"

interface VerificationEmailProps{
    username: string,
    otp: string
}

export default function VerificationEmail({username, otp}: VerificationEmailProps) {
    return (
        <Html lang= "en" dir="ltr">
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
                            Thank you for registrating. Here is your verification code: {otp}
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