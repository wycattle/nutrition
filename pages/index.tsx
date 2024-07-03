// pages/index.tsx
import Link from 'next/link';
import Image from 'next/image';
import React from 'react';
import Head from 'next/head';

import { HomeProps } from '../lib/types/homeprops';
import styles from '../styles/homepage.module.scss';

export default function Home(props: HomeProps) {
  const { currentDate } = props;

  return (
    <div>
      <Head>
        <link rel="icon" href="/images/favicon.ico" />
      </Head>

      <div className={styles.outerbox}>
        <h1 className={styles.header}>Welcome to my Nutrition App</h1>

        <div className={styles.centerFeature}>
          <div className={styles.image1}>
            <Image
              src="/images/IMG_0748.JPG"
              alt="Splash Image"
              width={300}
              height={300}
              priority
            />
          </div>

          <div>
            <div className={styles.timeDisplay}>
              today is:&nbsp;&nbsp;
              {new Intl.DateTimeFormat('en-US', {
                dateStyle: 'medium',
                timeZone: 'Asia/Bangkok'
              }).format(new Date(currentDate))}
            </div>

            <div className={styles.button}>
              <Link href="/createMeal">
                <span className={styles.buttonLink}>Create a Meal</span>
              </Link>
            </div>

            <div className={styles.button}>
              <Link href="/TotalsByDateRange">
                <span className={styles.buttonLink}>Totals by date range</span>
              </Link>
            </div>

            <div className={styles.button}>
              <Link href="/RecipeViewModify">
                <span className={styles.buttonLink}>View/Modify Recipes</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps() {
  const currentDate = new Date().toString();
  return { props: { currentDate } };
}