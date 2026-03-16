
/**
 * pages/homepage.tsx
 * Main homepage component for my_nutrition_app
 */
import { useSession, signIn, signOut } from 'next-auth/react';
import styles from '../styles/homepage.module.scss';
import Image from 'next/image';
import Link from 'next/link';

// The page component. It renders JSX and receives its props.
// The homepage does not require an API because it only displays static content.

export default function Home() {
  const { data: session, status } = useSession();
  console.log('[DEBUG] useSession status:', status, 'session:', session);

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.outerbox}>

        <h1 className={`globalButton ${styles.header}`}>Welcome to my Nutrition App</h1>


        <div className={styles.image1}>
          <Image
            src="/images/IMG_0748.JPG"
            alt="Splash Image"
            width={300}
            height={300}
            priority
          />
        </div>

        {/* Sign in/out button - now below the image */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '24px 0 0 0' }}>
          {!session ? (
            <>
   
              <button
                className="globalButton"
                style={{ margin: '0 0 8px 0', background: '#DB4437' }}
                onClick={() => signIn('google')}
              >
                Sign in with Google
              </button>
              
              {/* <button
                className="globalButton"
                style={{ margin: '0 0 8px 0', background: '#2F2F6F' }}
                onClick={() => signIn('microsoft')}
              >
                Sign in with Microsoft
              </button> */}
            </>
          ) : (
            <button className="globalButton" style={{ margin: '0 0 8px 0' }} onClick={() => signOut()}>Sign out</button>
          )}
        </div>

        {/* Only show these buttons if signed in */}
        {session && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 32 }}>
            <Link href="/meal" className='globalButton'>
              Create a Meal
            </Link>
            <Link href="/combinedTotalsByDateRange" className='globalButton'>
              Meal Totals
            </Link>
            <Link href="/recipe" className='globalButton'>
              View/Modify Recipes
            </Link>
            <Link href="/database" className='globalButton'>
              View/Modify Database
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}

export async function getServerSideProps() {
  return { props: {} };
}