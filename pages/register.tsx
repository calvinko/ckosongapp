import React, { useEffect, useState } from "react"
import Head from "next/head"
import { Toaster, toast } from "react-hot-toast"
import { signIn, signOut, useSession } from "next-auth/react"
import { Transition, Dialog } from "@headlessui/react"
import { Fragment } from "react"
import { Button, Heading, Link, Text, Box, Flex, TextField } from "../components/base"
import Creatable from 'react-select/creatable';
import NavBar from "../components/NavBar"
import Row from "../components/row"
import { useUser, useUserOrNoAccess } from "../lib/uiUtils"
import Placeholder from "../components/Placeholder"
import { isInKilledPlace, isInRegistrationWhitelist, isWhitelisted, userHasRole, userHasRoleOrAdmin, UserRole, UserStatus } from "../lib/constants"

import { Payment } from "../ts/types/payment.interface";
import { OrderResponseBody } from "@paypal/paypal-js/types/apis/orders";
import Feedback from "../components/Feedback";
import { useDispatch } from "react-redux"
import { useRouter } from "next/router"
import { mutate } from "swr"
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js"
import SearchBar from "../components/SearchBar"
import { loadUserInfo, removeUser } from "../lib/redux/actions"
import { isValidEmail } from "../lib/favorites"
import { AlertTriangle, ChevronLeft } from "react-feather"
import { tree } from "next/dist/build/templates/app-page"
import UserInfo from "../ts/types/userInfo.interface"

const EMAIL_RE = /^[\w.+\-]+@gmail\.com$/;


const LOCATION_OPTIONS = [
  { value: "SV", label: "SV" },
  { value: "Vancouver", label: "Vancouver" },
  { value: "Singapore", label: "Singapore" },
  { value: "Hong Kong", label: "Hong Kong" },
  { value: "Curitiba", label: "Curitiba" },
  { value: "Malaysia", label: "Malaysia" },
  { value: "South Africa", label: "South Africa" },
]

export const getServerSideProps = async ({ req, res, query }) => {
  return {
    props: {
      query,
    }
  }
}

const isZeroOrEmpty = (value: string) => {
  return !value || /^0(?:\.0+)?$/.test(value)
}

const isValidAmount = (value: string) => {
  return !isZeroOrEmpty(value) && /^\d+$/.test(value);
}

/**
 * Registration Page
 */
const RegisterPage = ({ query: { country, city } }) => {
  const router = useRouter();
  const { query } = router
  const { data: session, status } = useSession();
  const { user, noAccess, loading } = useUserOrNoAccess(session, status);
  const { s1, s2 } = query;
  const [isZeffyModalOpen, setIsZeffyModalOpen] = useState(false);
  const [isError, setIsError] = useState(false);
  const dispatch = useDispatch();

  const email = user?.email;

  // reload the user info if the email is valid
  // or it changes (from null -> existing email -> sign out (null))
  useEffect(() => {
    if (isValidEmail(session?.user?.email)) {
      dispatch(loadUserInfo(email as string, false))
    }
  }, [session?.user?.email])

  const handleLogOutAction = () => {
    signOut();
    dispatch(removeUser());
  };

  /**
     * Clear the Redux cache store from redux persist
     */
  const clearCacheAndReload = () => {
    // just remove the item in local storage since we store in local storage
    localStorage?.removeItem("persist:root");
    toast.success("Cleared Cache!");
    window.location.reload();
  };

  const goToTopOfPage = () => {
    window.scrollTo(0, 0);
  }

  // if loading and user doesn't exist yet
  // if not loading (even if user exists or not), we should continue
  if (loading) {
    return (
      <Box className="max-w-[95%] md:max-w-lg my-16 mx-4 md:mx-auto">
        <Head>
          <title>Register</title>
        </Head>
        <Placeholder fluid>
          <Placeholder.Header>
            <Placeholder.Line />
            <Placeholder.Line />
          </Placeholder.Header>
          {[...Array(5)].map((e, index) => (
            <Placeholder.Paragraph key={`placeholder-${index}`}>
              <Placeholder.Line />
              <Placeholder.Line />
              <Placeholder.Line />
            </Placeholder.Paragraph>
          ))}
        </Placeholder>
      </Box>
    );
  }

  // if country/city not whitelisted, redirect to access page
  if (!isWhitelisted(country, city)) {
    router.push("/access");
    return (<></>);
  }

  const handleSignUpClick = async () => {
    signIn("google");
  }

  const handleRequestApproval = async (e: { preventDefault: () => void }, location: string) => {
    e.preventDefault();
    const res = await fetch(`/api/users?email=${email}`, {
      method: "PUT",
      body: JSON.stringify({
        location: location,
        status: UserStatus.pendingApproval
      })
    })

    if (res?.status >= 400) {
      toast.error("Something went wrong. Please leave feedback with your email.", { duration: 4000 })
      setIsError(true);
      return;
    }
    const jsonRes = await res.json();
    mutate(`/api/users?email=${email}`, jsonRes?.data, false);

    const emailRes = await fetch(`/api/admin/email`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json' // Set the Content-Type header
      },
      body: JSON.stringify({
        template: "AdminRequestNotification",
        requestingUserFullName: session?.user?.name,
        requestingUserEmail: email,
      })
    })

    if (emailRes?.status >= 400) {
      toast.error("Something went wrong sending email to you. Please leave feedback.", { duration: 4000 })
      setIsError(true);
      return;
    }
    console.log(emailRes.json())

    toast.success("Your request has been submitted.", { duration: 4000 })
    dispatch(loadUserInfo(email as string, false))
  }

  // restrict if not in proper city
  if (!isInRegistrationWhitelist(country, city) && !(userHasRoleOrAdmin(user, UserRole.useApp) || userHasRoleOrAdmin(user, UserRole.paid))) {
    router.push("/signIn");
    return (<></>);
  }

  // restrict if in killed place
  if (isInKilledPlace(country, city) && !(userHasRoleOrAdmin(user, UserRole.useApp) || userHasRoleOrAdmin(user, UserRole.paid))) {
    router.push("/signIn");
    return (<></>);
  }

  if (userHasRole(user, UserRole.block)) {
    router.push("/signIn");
    return (<></>);
  }

  const stage1 = s1 || (
    !userHasRole(user, UserRole.paid) &&
    !userHasRole(user, UserRole.useApp) &&
    (user?.status == null || user.status != UserStatus.approved)
  );
  const stage2 = s2 || (
    (!userHasRoleOrAdmin(user, UserRole.paid) && user?.status == UserStatus.approved) ||
    (userHasRole(user, UserRole.useApp) && !userHasRole(user, UserRole.paid))
  );

  return (
    <Flex
      className="min-h-screen	items-center box-border flex-1 w-screen sm:max-w-xl sm:min-w-[576px] my-8 sm:mx-auto px-3 sm:px-0 w-full"
      flexDirection="column"
    >
      <Head>
        <title>Register</title>
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:title" content={`Register`} key="title" />
      </Head>
      <Toaster />
      <Box
        className="flex-1 md:max-w-lg mx-1 md:mx-auto sm:min-w-[576px]"
      >
        {
          userHasRoleOrAdmin(user, UserRole.paid) ?
            <>
              <NavBar />
              <SearchBar />
            </> :
            user ?
              <div className="flex flex-row-reverse">
                <Feedback buttonText="I need help" placeholder="Let us know what you need help with and we will get back to you shortly" />
              </div> : <></>
        }
        <Flex className="mt-4" flexDirection="column">
          {userHasRoleOrAdmin(user, UserRole.paid) &&
            <Link className="cursor-pointer mb-2 mt-4" lineHeight="0" onClick={() => router.back()}>
              <>
                <ChevronLeft className="inline arrow-icon" />
                Back
              </>
            </Link>
          }
          <Flex>
            <Heading as="h4" type="h4" className="">
              Register
            </Heading>
            <Flex
              className="flex-1 items-end pr-2 sm:p-0"
              flexDirection="column"
            >

            </Flex>

          </Flex>
          {
            !user &&
            <div className="card-notice mb-7 mt-5">
              <Box className="p-4">
                <Text as="p" fontSize="14px" color="#8B9199">
                  This app is for English Hymnals. Registration is required. <Text fontWeight="600" color="#6b7280">You must use your gmail/google account.</Text>
                </Text>
                {/* <Text className="underline pt-4" color="rgb(2 132 199)" fontWeight="600" fontSize="16px">
                Upon successful registration, please contact Alison Chan (+1 778-227-4747) on Whatsapp with your name, email, and city.
              </Text> */}
              </Box>
            </div>
          }
          {
            !user ?
              <>
                <Row className="mt-1">
                  <Button
                    className="bg-blue-500"
                    onClick={handleSignUpClick}
                  >
                    Sign up with Google
                  </Button>
                </Row>
                {/* <Text color="#8B9199" lineHeight="1.25" fontSize="12px" className="mt-1">
                  A Google account is required for access.
                </Text> */}
              </> :
              <>
                <div className="mt-5">
                  {
                    stage1 &&
                    <RequestForApproval
                      user={user}
                      session={session}
                      handleRequestApproval={handleRequestApproval}
                      handleLogOutAction={handleLogOutAction}
                    />
                  }
                  {
                    stage2 &&
                    <div className="mb-6 pb-4">
                      <Text className="pb-3" as="p">Hi <Text as="span" color="#075985" fontWeight={500}>{session?.user?.name}</Text>,</Text>
                      <Text>To maintain access, please follow instructions to donate $5 CAD below. New features will be included (e.g. Audio Player, Chinese Hymnal Collections, etc)</Text>
                      <Box className="pb-6 mt-6">
                        <Heading as="h4" type="h4" fontSize="20px" fontWeight={600} className="underline">Instructions</Heading>
                        <Text className="italic mt-1" color="#8B9199">Read all the instructions first</Text>
                        <div className="card-notice p-3 px-4 mt-3">
                          <Heading as="h4" type="h4" fontSize="18px" fontWeight={600} className="underline">Step 1</Heading>
                          <Text className="pb-1">
                            • Start donation in the yellow form below. The donation will say for "Pause Cafe"
                          </Text>
                          <Text>
                            • Click <Text as="span" color="#8B9199">"Add+"</Text> and then Click <Text as="span" color="#8B9199">"Continue"</Text>
                          </Text>
                          <div className="rounded border-[#FFDE21] mt-2">
                            <Flex
                              flexDirection="row"
                            >
                              <AlertTriangle color="#FFDE21" size="22px" />
                              <Text className="pl-1" fontWeight={600}>You must use this email in the payment page: <Text as="span" color="#075985" fontWeight={500}>{email}</Text></Text>
                            </Flex>
                          </div>
                        </div>
                        <div className="card-notice p-3 px-4 mt-3">
                          <Heading as="h4" type="h4" fontSize="18px" fontWeight={600} className="underline">Step 2</Heading>
                          <Text className="pb-1">
                            • Avoid paying Zeffy Fee.
                          </Text>
                          <Text className="pb-1">
                            • Remove the Optional Contribution <Text as="span" color="#8B9199" fontWeight={500}>Help keep Zeffy free for Pause Cafe 💜</Text> by clicking the Dropdown <Text as="span" color="#8B9199">"15% ($0.75)"</Text>, selecting <Text as="span" color="#8B9199">"Other"</Text>, and putting <Text as="span" color="#8B9199">0</Text>
                          </Text>
                        </div>
                        <div className="card-notice p-3 px-4 mt-3">
                          <Heading as="h4" type="h4" fontSize="18px" fontWeight={600} className="underline">Step 3</Heading>
                          <Text className="pb-1">
                            • Once submitted, reload this page and you should get access.
                          </Text>
                          <Button onClick={clearCacheAndReload}>Reload Page</Button>
                        </div>
                      </Box>
                      <Heading as="h4" type="h4" fontSize="18px" fontWeight={600} className="underline mb-3">
                        Alternative
                      </Heading>
                      <Button
                        outline={true}
                        shadow={false}
                        onClick={(e) => setIsZeffyModalOpen(true)}
                        className="mr-4"
                      >
                        Use Apple Pay
                      </Button>
                      <Button
                        outline={true}
                        shadow={false}
                        onClick={(e) => setIsZeffyModalOpen(true)}
                      >
                        I don't see the Form
                      </Button>
                      {isError &&
                        <div className="red-card-notice p-2 my-2 mt-4">
                          <Text color="rgb(127 29 29)" className="pb-4">Something failed. Please contact us. We'll contact you to resolve it shortly.</Text>
                          <Feedback buttonText="Contact Us" placeholder="Please let us know your email and the issue you are facing. We'll get back to you shortly." popupOffset={0} />
                        </div>
                      }
                      <Text color="#8B9199" lineHeight="1.25" fontSize="12px" className="mt-6 border-t pt-2 pb-8 italic text-center">
                        All proceeds go to Church of God in Vancouver.
                      </Text>
                      <div className="h-[620px]">
                        <iframe
                          title='Zeffy Donation form for App Access'
                          className="w-full h-full"
                          src='https://www.zeffy.com/embed/ticketing/coworker-hymn-app-access'
                          allow="payment"
                        >
                        </iframe>
                      </div>
                      <div className="mt-3">
                        <Button
                          onClick={handleLogOutAction}
                          className="cursor-pointer bg-rose-500"
                        >
                          Log out
                        </Button>
                        <Button className="mx-4" outline={true} shadow={false} onClick={goToTopOfPage}>Go to Top of Page</Button>
                        <Button onClick={clearCacheAndReload}>Reload Page</Button>
                      </div>
                    </div>
                  }
                  {
                    userHasRoleOrAdmin(user, UserRole.paid) &&
                    (
                      <div>
                        <Text className="mb-1">You are signed in and have paid for the app.</Text>
                        <div className="pt-1 pb-3">
                          <Link className="cursor-pointer" href="/" underline>
                            Click here to go to main page
                          </Link>
                        </div>
                        <div className="mt-12">
                          <Button
                            onClick={handleLogOutAction}
                            className="cursor-pointer bg-rose-500	"
                          >
                            Log out
                          </Button>
                        </div>
                      </div>
                    )
                  }
                </div>
              </>
          }
        </Flex>
      </Box >
      <style jsx>{`
        .card-notice {
          border: 1px solid #ebeef2;
          border-radius: 6px;
        }

        .currency-pill {
          border-radius: 6px;
          background-color: #64748b;
          padding: 0px 4px;
          display: inline-flex;
          vertical-align: middle;
          align-items: center;
          height: 20px;
          white-space: nowrap;
        }
        .red-card-notice {
          border: 1px solid rgb(252 165 165);
          background-color: rgb(254 226 226);
          border-radius: 6px;
        }
      `}</style>
      <Transition appear show={isZeffyModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-[1000]" onClose={() => setIsZeffyModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black opacity-30" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Box className="p-1">
                    <Heading as="h4" type="h4" fontSize="18px" fontWeight={600}>Donate @ Zeffy's Site</Heading>
                    <Text>
                      Alternatively, you can donate at Zeffy's site and may support Google Pay and/or Apple Pay. This will open a new tab.
                    </Text>
                    <Text className="">
                      Make sure to put this email: <Text as="span" color="#075985" fontWeight={500}>{email}</Text>
                    </Text>
                    <div className="card-notice p-2">
                      Be aware for
                    </div>
                    <Text className="mt-3">
                      Once done, come back here. And you should get access.
                    </Text>
                    <Flex
                      flexDirection="row"
                      className="gap-x-2 mt-5"
                    >
                      <Button
                        outline={true}
                        shadow={false}
                        onClick={(e) => {
                          e.preventDefault()
                          window.open("https://www.zeffy.com/en-CA/ticketing/coworker-hymn-app-access", '_blank', 'noopener, noreferrer');
                        }}>
                        Donate @ Zeffy
                      </Button>
                      <Button outline={true} shadow={false} onClick={() => setIsZeffyModalOpen(false)}>
                        Close
                      </Button>
                    </Flex>
                  </Box>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </Flex >
  )
}

const RequestForApproval = ({
  session,
  user,
  isError = false,
  handleRequestApproval,
  handleLogOutAction
}: {
  session: any,
  user: UserInfo,
  isError?: boolean,
  handleRequestApproval: (e: any, location?: string) => void,
  handleLogOutAction: () => void
}) => {
  let [location, setLocation] = useState("")

  const handleLocationChange = (e: any) => {
    setLocation(e?.value);
  }

  const isPendingApproval = user?.status == UserStatus.pendingApproval;
  const userEmail = session?.user?.email;

  return (
    <Flex flexDirection="column">
      <Text className="pb-3" as="p">Hi <Text as="span" color="#075985" fontWeight={500}>{session?.user?.name}</Text>,</Text>

      {
        isPendingApproval &&
        <Box>
          <Text>
            Your registration is pending approval. We will review your registration and send you an email to <Text as="span" color="#075985" fontWeight={500}>{session?.user?.email}</Text> once it's approved.
          </Text>
        </Box>
      }
      {
        !isPendingApproval &&
        <Box>
          <Text>
            You are registering with <Text as="span" color="#075985" fontWeight={500}>{userEmail}</Text>. We will review your registration and send you an email once it's approved.
          </Text>
          {isError &&
            <div className="red-card-notice p-2 my-2 mt-4">
              <Text color="rgb(127 29 29)" className="pb-4">Something failed. Please contact us. We'll contact you to resolve it shortly.</Text>
              <Feedback buttonText="Contact Us" placeholder="Please let us know your email and the issue you are facing. We'll get back to you shortly." popupOffset={0} />
            </div>
          }
          <Flex flexDirection="column" className="mt-4 gap-y-2">
            <Text>What is your location?</Text>
            <Creatable
              isClearable
              options={LOCATION_OPTIONS}
              onChange={handleLocationChange}
              placeholder="Select or type in your location"
            />
            <Box>
              <Button onClick={(e) => handleRequestApproval(e, location)}>
                Submit
              </Button>
            </Box>
          </Flex>
        </Box>
      }
      <Box className="mt-10">
        <Link
          underline
          onClick={handleLogOutAction}
          className="cursor-pointer"
        >
          Log out
        </Link>
      </Box>

    </Flex>
  )
}

export default RegisterPage;