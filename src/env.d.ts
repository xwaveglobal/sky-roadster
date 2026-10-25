declare module '*.css';
declare module '*.webp' {
  const url: string;
  export default url;
}
declare module '*.png' {
  const url: string;
  export default url;
}
declare module '*.jpg' {
  const url: string;
  export default url;
}
declare module '*.glb' {
  const url: string;
  export default url;
}

/** set by scripts/build-esbuild.mjs (--demo = the autoplay video build); undefined in other builds */
declare const __DEMO_BUILD__: boolean | undefined;
