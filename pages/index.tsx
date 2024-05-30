// pages/index.tsx
import Link from 'next/link';
import Image from 'next/image';
import React from 'react';
import Head from 'next/head';
import { HomeProps } from '../lib/types/homeprops';

export default function Home(props: HomeProps) {
  console.log(props);

  const { currentDate } = props;

  return (
    <div>
      <Head>
        <link rel="icon" href='\images\favicon.ico' />
      </Head>

      <div className="outerbox">
        <style>{`
          .outerbox {
            width: 80vw;
            height: 100vh;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            border: 3px solid green;
            border-radius: 50%;
            background: linear-gradient(to right, #010a09, #66bdb4);
          }

          .header {
            text-align: center;
            font-weight: 200;
            background-color: #28222c;
            border: 1px solid green;
            border-radius: 12px;
            padding: 20px;
            margin: 32px;
          }
        `}</style>

        <h1 className="header">Welcome to my Nutrition App</h1>

        <div id="homepage" 
        style={{
          width: 'auto',
          height: '40vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          borderRadius: '50px'
        }}>

          <div id="image1" 
          style={{
            borderRadius: '50px',
            margin: '5px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Image
              src="/images/IMG_0748.JPG"
              alt="Splash Image"
              width={300}
              height={300}
              priority
            />
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            borderRadius: '20px',
            margin: '5px'
          }}>

            <h2 id='timedisplay' style={{ paddingBottom: '30px', paddingLeft: '10px' }}>today is:&nbsp;&nbsp;
              {new Intl.DateTimeFormat('en-US', {
                dateStyle: 'medium',
                timeZone: 'Asia/Bangkok'
              }).format(new Date(currentDate))}
            </h2>

            <div className='button-container' style={{ margin: '10px', backgroundColor: '#3a3140', padding: '10px', borderRadius: '5px' }}>
              <Link href="/createMeal">
                <button className="button">
                  Create a Meal
                </button>
              </Link>
            </div>

            <div className='button-container' style={{ margin: '10px', backgroundColor: '#3a3140', padding: '10px', borderRadius: '5px' }}>
              <Link href="/TotalsByDateRange">
                <button className="button">
                  Totals by date range
                </button>
              </Link>
            </div>

            <div className='button-container' style={{ margin: '10px', backgroundColor: '#3a3140', padding: '10px', borderRadius: '5px' }}>
              <Link href="/TotalMeals">
                <button className="button">
                  Meal Aggregation
                </button>
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