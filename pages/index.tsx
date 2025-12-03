// pages/index.tsx
import Link from 'next/link';
import Image from 'next/image';
import React from 'react';
import Head from 'next/head';
<<<<<<< HEAD

=======
>>>>>>> 0ee1dbe591b138557ade905ef0a46e276719f596
import styles from '../styles/homepage.module.scss';
import { HomeProps } from '../lib/types/homeprops'; //imports the TypeScript props type used by the component for type-checking, defined in HomeProps.

//The page component. It renders JSX and receives its props.
export default function Home(props: HomeProps) {     //Defines and default-exports the Next.js page component: export default function Home(props: HomeProps). The props parameter is type-checked against HomeProps.
  const { currentDate } = props; //Destructures currentDate from props so it can be used directly inside the component.

  return (    // JSX/TSX (React markup),
    <div>
      <Head>
        <link rel="icon" href="/images/favicon.ico" />
      </Head>

<<<<<<< HEAD
      <div className={styles.outerbox}>
        <h1 className={styles.header}>Welcome to my Nutrition App</h1>
        <div className={styles.centerFeature}>
          <div className={styles.image1}>
=======
      <div className={styles['outerbox']}>
        <h1 className={styles['header']}>Welcome to my Nutrition App</h1>

        <div className={styles['centerFeature']}>
          <div className={styles['image1']}>
>>>>>>> 0ee1dbe591b138557ade905ef0a46e276719f596
            <Image
              src="/images/IMG_0748.JPG"
              alt="Splash Image"
              width={300}
              height={300}
              priority
            />
          </div>

<<<<<<< HEAD
            <div className={styles.timeDisplay}>
=======
          <div>
            <div className={styles['timeDisplay']}>
>>>>>>> 0ee1dbe591b138557ade905ef0a46e276719f596
              today is:&nbsp;&nbsp;
              {new Intl.DateTimeFormat('en-US', {
                dateStyle: 'medium',
                timeZone: 'Asia/Bangkok'
              }).format(new Date(currentDate))}
            </div>

<<<<<<< HEAD
            <div className={styles.button}>
              <Link href="/createMeal">
                <span className={styles.buttonLink}>Create a Meal</span>
              </Link>
            </div>

            <div className={styles.button}>
              <Link href="/totalsByDate">
                <span className={styles.buttonLink}>Totals by date range</span>
              </Link>
            </div>

            <div className={styles.button}>
              <Link href="/RecipeViewModify">
                <span className={styles.buttonLink}>View/Modify Recipes</span>
=======
            <div className={styles['button']}>
              <Link href="/CreateMeal">
                <span className="global-button">Create a Meal</span>
              </Link>
            </div>

            <div className={styles['button']}>
              <Link href="/TotalsByDate">
                <span className="global-button">Totals by date range</span>
              </Link>
            </div>

            <div className={styles['button']}>
              <Link href="/RecipeViewModify">
                <span className="global-button">View/Modify Recipes</span>
>>>>>>> 0ee1dbe591b138557ade905ef0a46e276719f596
              </Link>
            </div>

        </div>
      </div>
    </div>
  );
}

//Special named exports that Next.js calls on the server to fetch data. They return { props } 
// which are passed into the page component. Order in the file doesn’t matter.
export async function getServerSideProps() {   //Pages must default-export a React component (the page)
  const currentDate = new Date().toString();
  return { props: { currentDate } };
}