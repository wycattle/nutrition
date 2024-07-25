// types/stylesx.d.ts

declare module '*.scss' {
    const content: { [className: string]: string };
    export = content;  //suitable for non-ES6 module systems
  }

  declare module '*.module.scss' {
    const classes: { [key: string]: string };
    export default classes;  // uses ES6 default export syntax
  }