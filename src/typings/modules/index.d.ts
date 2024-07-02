// import original module declarations
import "solid-styled-components";

// and extend them!
declare module "solid-styled-components" {
  export interface DefaultTheme {
    colors: any;
  }
}

// vite-env.d.ts or any .d.ts file in your project
declare module "*?raw" {
  const content: string;
  export default content;
}

declare module "*.json" {
  const value: any;
  export default value;
}
