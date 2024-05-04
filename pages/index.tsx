// pages/index.tsx
import Link from 'next/link';
import Image from 'next/image';
// import '../styles/styles.css'

export default function Home() {
  return (
    <div className='outerbox'>
        <h1 className="header" >
          Welcome to my Nutrition App</h1>
     
        <div className="homepage"
          style={{
            width:'25%'
          }}>
          <div className="image1" >
            <Image
                src="/images/IMG_0748.JPG" 
                alt="Splash Image"
                width={300}
                height={300}
                priority
                style={{
                  margin: 'auto'
                }}
            />

          </div>

          <div className='button-container'>
            <Link href="/nutrition_app">
              <button className="button">
                Create a Recipe or Meal
              </button>
            </Link>
          </div>

          <div className='button-container'>
            <Link href="/view_recipe_json">
              <button className="button">
                View / Modify a Recipe
              </button>
            </Link>
          </div>

          <div className='button-container'>
            <Link href="/view_meal_json">
              <button className="button">
                View / Modify a Meal
              </button>
            </Link>
          </div> 


        </div>
      </div>
  );
}