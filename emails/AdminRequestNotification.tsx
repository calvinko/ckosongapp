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

interface RequestNotificationEmailProps {
    requestingUserFullName: string;
    requestingUserEmail: string;
    createdAt: number
}

const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'https://songapp.vercel.app';


export const AdminRequestNotification = ({
    requestingUserFullName,
    requestingUserEmail,
    createdAt
}: RequestNotificationEmailProps) => {
    let date = new Date(createdAt);

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
                    <Preview>{requestingUserFullName} is requesting access.</Preview>
                    <Container className="px-3 mx-auto my-10">
                        <Img
                            src={`${baseUrl}/logo.png`}
                            width="32"
                            height="32"
                            alt="Notion's Logo"
                        />
                    </Container>
                    <Container className="px-3 mx-auto my-10">
                        <Text className="text-[#333] text-[14px] my-6 mb-3.5">
                            <span className="text-[#075985]">{requestingUserFullName}</span> is requesting access.
                        </Text>
                        <Container>
                            <ul className='list-outside'>
                                <li className="text-[#333] text-[14px] mt-3.5">
                                    Name: {requestingUserFullName}
                                </li>
                                <li className="text-[#333] text-[14px] mt-2">
                                    Email: {requestingUserEmail}
                                </li>
                                <li className="text-[#333] text-[14px] mt-2 mb-4">
                                    Requested At: {`${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`}
                                </li>
                            </ul>
                        </Container>
                        <Link
                            href={`https://songapp.vercel.app/van-team/manage-users?userEmail=${requestingUserEmail}`}
                            className="text-[#2754C5] text-[14px] underline mb-4 block mt-4"
                        >
                            Click here to respond
                        </Link>
                        {/* <Text className="text-[#ababab] text-[14px] mt-3.5 mb-9.5">
                            Hint: You can set a permanent password in Settings & members → My
                            account.
                        </Text> */}
                        <Container className='mt-[200px]'>
                            <Hr />
                            <Text className="text-[#6a737d] text-xs leading-[24px] text-center mb-4">
                                Song App ・ {" "}
                                <Link
                                    href="https://songapp.vercel.app"
                                    className="text-[#898989] text-[12px] underline"
                                >
                                    songapp.vercel.app
                                </Link>
                            </Text>
                        </Container>
                    </Container>
                </Body>
            </Tailwind>
        </Html >
    );
}

AdminRequestNotification.PreviewProps = {
    requestingUserFullName: 'Timothy Ko',
    requestingUserEmail: 'email@gmail.com',
    createdAt: 1771279409186
} as RequestNotificationEmailProps;

export default AdminRequestNotification;
