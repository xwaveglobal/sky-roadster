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
/** set by scripts/build-tiktok.mjs (the native TikTok build); undefined in the web builds */
declare const __NATIVE__: boolean | undefined;
