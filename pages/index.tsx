// pages/index.js
import Link from 'next/link';
import Image from 'next/image';
import '../styles/styles.css'

export default function Home() {
  return (
    <div className='outer_box'>
        <h1 className="header">Welcome to my Nutrition App</h1>
     
        <div className="homepage">
          <div className="homepage">
            <Image
                src="/images/IMG_0748.JPG" 
                alt="Splash Image"
                width={500}
                height={500}
                priority
            />

          </div>

          <div className='button-container'>
            <Link href="/nutrition_app">
              <button className="button">Create a Recipe or Meal</button>
            </Link>
          </div>

          <div className='button-container'>
            <Link href="/view_recipe_json">
              <button className="button">View a Recipe</button>
            </Link>
          </div>

          <div className='button-container'>
            <Link href="/view_meal_json">
              <button className="button">View a Meal</button>
            </Link>
          </div>

          <div className='button-container'>
            <Link href="/nutrition_app">
              <button className="button">Add a New Meal</button>
            </Link>
          </div>

          <div className='button-container'>
            <Link href="/view_meal_json">
              <button className="button">Modify an Existing Meal</button>
            </Link>
          </div>

        </div>
    </div>
  );
}