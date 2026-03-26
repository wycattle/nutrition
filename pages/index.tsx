/**
 * pages/index.tsx
 * Homepage for my_nutrition_app
 */

import { useSession, signIn } from 'next-auth/react';
import styles from '../styles/homepage.module.scss';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const { status } = useSession();    //useSession runs the client-side

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.outerbox}>

        <Link href="/about" className={styles.aboutLink}>About</Link>

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

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '24px 0 0 0' }}>
          {status === 'unauthenticated' && (
            <button
              className="globalButton"
              style={{ margin: '0 0 8px 0', background: '#DB4437' }}
              onClick={() => signIn('google')}
            >
              Sign in with Google
            </button>
          )}
        </div>

        {status === 'authenticated' && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 32 }}>
            <Link href="/meal" className='globalButton'>
              Create Meal or Recipe
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


