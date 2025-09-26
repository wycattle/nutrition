// pages/index.tsx
import Link from 'next/link';
import Image from 'next/image';
import React from 'react';
import Head from 'next/head';

import { HomeProps } from '../lib/types/homeprops'; //imports the TypeScript props type used by the component for type-checking, defined in HomeProps.

//The page component. It renders JSX and receives its props.
export default function Home(props: HomeProps) {     //Defines and default-exports the Next.js page component: export default function Home(props: HomeProps). The props parameter is type-checked against HomeProps.
  const { currentDate } = props; //Destructures currentDate from props so it can be used directly inside the component.

  return (    // JSX/TSX (React markup),
    <div>
      <Head>
        <link rel="icon" href="/images/favicon.ico" />
      </Head>

      <div className={'outerbox'}>
        <h1 className={'header'}>Welcome to my Nutrition App</h1>

        <div className={'centerFeature'}>
          <div className={'image1'}>
            <Image
              src="/images/IMG_0748.JPG"
              alt="Splash Image"
              width={300}
              height={300}
              priority
            />
          </div>

          <div>
            <div className={'timeDisplay'}>
              today is:&nbsp;&nbsp;
              {new Intl.DateTimeFormat('en-US', {
                dateStyle: 'medium',
                timeZone: 'Asia/Bangkok'
              }).format(new Date(currentDate))}
            </div>

            <div className={'button'}>
              <Link href="/createMeal">
                <span className={'buttonLink'}>Create a Meal</span>
              </Link>
            </div>

            <div className={'button'}>
              <Link href="/totalsByDate">
                <span className={'buttonLink'}>Totals by date range</span>
              </Link>
            </div>

            <div className={'button'}>
              <Link href="/RecipeViewModify">
                <span className={'buttonLink'}>View/Modify Recipes</span>
              </Link>
            </div>
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