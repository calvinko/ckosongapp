import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Img,
    Link,
    Preview,
    Tailwind,
    Text,
    Font,
    Row,
    Column,
    Section,
    Hr
} from '@react-email/components';
import tailwindConfig from '../tailwind.config.js';
import Markdown from 'react-markdown';

interface ApprovalNotificationEmailProps {
    fullName: string;
    email: string;
}

const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'https://songapp.vercel.app';


export const ApprovalNotification = ({
    fullName,
    email
}: ApprovalNotificationEmailProps) => {

    return (
        <Html>
            <Head>
                <Font
                    fontFamily="HKGrotesk"
                    fallbackFontFamily="Verdana"
                    webFont={{
                        url: "https://songapp.vercel.app/HKGrotesk-Regular.otf",
                        format: "woff2",
                    }}
                    fontWeight={400}
                    fontStyle="normal"
                />
            </Head>
            <Tailwind config={tailwindConfig}>
                <Body className="bg-white">
                    <Preview>Hi {fullName}, your request has been approved! Please click to continue registration process.</Preview>
                    <Container className="px-3 mx-auto my-10">
                        <Img
                            src={`${baseUrl}/logo.png`}
                            width="32"
                            height="32"
                            alt="Notion's Logo"
                        />
                    </Container>
                    <Container className="px-3 mx-auto my-10">
                        <Section className=" text-[#333] text-[14px]">
                            <Text>
                                Hi {fullName},
                            </Text>
                            <Text>
                                Your request for access to Song App has been approved!
                            </Text>
                            <Text>
                                Please click the link below to continue the registration process to donate. After donation, refresh the page and you should have access to the app.
                            </Text>
                            <Link
                                href={`https://songapp.vercel.app/register`}
                                className="text-[#2754C5] text-[14px] underline mb-4 block mt-5"
                            >
                                Continue Registration
                            </Link>
                        </Section>
                        <Hr className="mt-10" />
                        <Text className="text-[#6a737d] text-xs leading-[24px] text-center mt-5 mb-4">
                            Make sure you log in and donate with this email: <span className="text-[#075985] font-normal">{email}</span>
                        </Text>
                    </Container>
                    <Container className='mt-14'>
                        <Text className="text-[#6a737d] text-xs leading-[24px] text-center mt-[60px] mb-4">
                            Song App ・ {" "}
                            <Link
                                href="https://songapp.vercel.app"
                                className="text-[#898989] text-[12px] underline"
                            >
                                songapp.vercel.app
                            </Link>
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html >
    );
}

ApprovalNotification.PreviewProps = {
    fullName: 'Timothy Ko',
    email: 'email@gmail.com'
} as ApprovalNotificationEmailProps;

export default ApprovalNotification;
