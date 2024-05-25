// pages/index.tsx
import Link from 'next/link';
import Image from 'next/image';
import React, { useState } from 'react';
// import CreateMealInRange from './CreateMealsInRange';
import Head from 'next/head';


export default function Home() {
  return (
  <div>
    <Head>
      <link rel="icon" href='\images\favicon.ico'/>
    </Head>
     

  <div className="outerbox">
        <style jsx>{`
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


      <h1 className="header">  Welcome to my Nutrition App  </h1>


      <div id="homepage" style={{ 
        width: 'auto', 
        height: '40vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-around',
        borderRadius: '50px' }} >

        <div id="image1" style={{borderRadius: '50px',margin: '5px'}} >
          <Image
              src="/images/IMG_0748.JPG" 
              alt="Splash Image"
              width={300}
              height={300}
              priority
              style={{
                display: 'block',
                marginLeft: 'auto',
                marginRight:'auto',
                borderRadius: '50px'
              }}
          />
        </div>  

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          borderRadius: '20px',
          margin: '5px'
          }}>

          <div className='button-container' style={{ margin: '10px', backgroundColor: '#3a3140', padding: '10px', borderRadius: '5px' }}>
            <Link href="/createMeal">
              <button className="button">
                 Create a Meal
              </button>
            </Link>
          </div>

          <div className='button-container' style={{ margin: '10px', backgroundColor: '#3a3140', padding: '10px', borderRadius: '5px' }}>
            <Link href="/CreateMealsInRange">
              <button className="button">
                 Meal Nutrition Totals
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