import { build, emptyDir } from "https://deno.land/x/dnt@0.40.0/mod.ts";

await emptyDir("./npm");  // Clean output dir

await build({
  entryPoints: ["./app.js"],
  outDir: "./npm",
  package: {
    name: "ccxt-py",
    version: "0.1.0",
    description: "CCXT Python library for Deno",
    license: "MIT",
    main: "index.cjs",
    types: "index.d.ts",
    module: "index.js",
    exports: {
      ".": {
        import: "./index.js",
        require: "./index.cjs"
      }
    }
  },
  shims: {
    deno: {
      test: "dev",
    }
  }
});

console.log("Build complete! Check ./npm for the package.");
