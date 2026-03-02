import { AUTH_OPTIONS } from '../pages/api/auth/[...nextauth]'
import { getServerSession } from "next-auth/next"

/**
 * Get Server Side Props to be reused across pages to gate session access to pages
 * 
 * Unfortunately, we need to import this in every page to use this as such:
 * {@code 
 *   import getServerSideProps from "../lib/serverProps";
 *   ...
 *   export { getServerSideProps };
 * }
 */
export async function getServerSideProps({ req, res, query }) {
  const session = await getServerSession(req, res, AUTH_OPTIONS)

  // Redirect to signIn with query params
  if (!session) {
    return {
      redirect: {
        destination: '/signIn',
        permanent: false,
      },
      props: {
        query
      }
    }
  }

  return {
    props: {
      session,
      query
    },
  }
}