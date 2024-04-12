// pages/index.js
import Link from 'next/link';
import Image from 'next/image';
import '../styles/styles.css'

export default function Home() {
  return (
    <div className='outer_box'>
        <h1 className="header">Welcome to my Nutrition App</h1>

        <div>
          <div className="image1-container">
            <div className="image1">
                  
              <Image
                  src="/images/IMG_0748.JPG" 
                  alt="Splash Image"
                  width={500}
                  height={500}
                  priority
              />
              
            </div>
          </div>
        </div>

        <div className='textbox1-container'>
          <p className="textbox1">
            Click the button below to view the nutrition table.
          </p>
        </div>

        <div className='button-container'>
          <Link href="/nutrition_app">
              <button className="button">Go to Nutrition Table</button>
          </Link>
        </div>
    </div>
  );
}