// pages/_app.tsx
import '../styles/styles.css'
function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}
export default MyApp;


// class MyApp extends App is a way of creating a custom App 
// component by extending the default App component provided 
// by Next.js.

// The reason it's not "under the hood" is because it's optional
//  and customizable. Not every Next.js app needs a custom App 
//  component, so by default, Next.js doesn't include one. 
//  If you don't create a _app.js file, Next.js will use a 
//  default App component that simply renders the page's component.

// However, if you need to customize the behavior of your app 
// at a global level (for example, to add global CSS, persist 
// layout between pages, or keep state when navigating), you 
// can create a _app.js file and define your custom App component 
// there. This gives you a lot of flexibility to customize 
// your app's behavior.

// In the functional component version:

// MyApp is a functional component that receives the current 
// page's component (Component) and its props (pageProps) as 
// props, and renders the page's component with its props. 
// This is the simplest possible custom App component, which 
// doesn't add any additional behavior.