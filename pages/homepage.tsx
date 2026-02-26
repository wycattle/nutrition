
import { HomepageType } from '../types_interfaces/homepage-types';
import { useSession, signIn, signOut } from 'next-auth/react';
import styles from '../styles/homepage.module.scss';
import Image from 'next/image';
import Link from 'next/link';
// The page component. It renders JSX and receives its props.
// The homepage does not require an API because it only displays static content and the current
// date, which can be provided directly from the server without any backend data fetching.

export default function Home(props: HomepageType) {
  const { currentDate } = props;
  const { data: session } = useSession();

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

        <div className={"globalButton"}>
          today is:&nbsp;&nbsp;
          {new Intl.DateTimeFormat('en-US', {
            dateStyle: 'medium',
            timeZone: 'Asia/Bangkok'
          }).format(new Date(currentDate))}
        </div>

        {/* Sign in/out button */}
        <div style={{ margin: '16px 0' }}>
          {!session ? (
            <button className="globalButton" onClick={() => signIn()}>Sign in</button>
          ) : (
            <>
              <span className="globalButton" style={{ marginRight: 8 }}>
                Signed in as {session.user?.email || session.user?.name}
              </span>
              <button className="globalButton" onClick={() => signOut()}>Sign out</button>
            </>
          )}
        </div>

        <div>
          <Link href="/meal" className='globalButton'>
            Create a Meal
          </Link>
        </div>

        <div className={styles.button}>
          <Link href="/totalsByDateRange">
            <span className={`globalButton ${styles.buttonLink}`}>Totals by date range</span>
          </Link>
        </div>

        <div className={styles.button}>
          <Link href="/recipe">
            <span className={`globalButton ${styles.buttonLink}`}>View/Modify Recipes</span>
          </Link>
        </div>
        <div className={styles.button}>
          <Link href="/database">
            <span className={`globalButton ${styles.buttonLink}`}>View/Modify Database</span>
          </Link>
        </div>
      </div>
    </div>
  );
}


// Special named exports that Next.js calls on the server to fetch data.
export async function getServerSideProps() {
  const currentDate = new Date().toString();
  return { props: { currentDate } };
}