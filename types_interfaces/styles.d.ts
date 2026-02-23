// types/stylesx.d.ts

//Declaration files are meant to be globally available for type checking

// import regular .scss files in your TypeScript code, treating them as objects with string keys and values.
declare module '*.scss' {
    const content: { [className: string]: string };
    export = content;  //suitable for non-ES6 module systems
  }


  // import CSS Modules (.module.scss), which are commonly used in Next.js and React projects for locally scoped styles. It tells TypeScript that importing a .module.scss file 
  // will give you an object where the keys are class names and the values are the generated CSS class names.
  declare module '*.module.scss' {
    const classes: { [key: string]: string };
    export default classes;  // uses ES6 default export syntax
  }