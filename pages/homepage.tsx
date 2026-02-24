import Link from 'next/link';
import Image from 'next/image';
import React from 'react';
import Head from 'next/head';
import styles from '../styles/homepage.module.scss';
import { HomepageType } from '../types_interfaces/homepage-types';

// The page component. It renders JSX and receives its props.
//The homepage does not require an API because it only displays static content and the current 
// date, which can be provided directly from the server without any backend data fetching.  
export default function Home(props: HomepageType) {
  const { currentDate } = props;

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

          <div >
            <Link href="/meal/Meal" className='globalButton'>
                Create a Meal
            </Link>
          </div>

          <div className={styles.button}>
            <Link href="/totalsByDateRange">
              <span className={`globalButton ${styles.buttonLink}`}>Totals by date range</span>
            </Link>
          </div>

          <div className={styles.button}>
            <Link href="/recipe/Recipe">
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