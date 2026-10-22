import {build} from 'esbuild';import {copyFileSync,mkdirSync} from 'node:fs';
mkdirSync('dist',{recursive:true});await build({entryPoints:['src/app.jsx'],bundle:true,minify:true,sourcemap:false,outfile:'dist/app.js',define:{'process.env.NODE_ENV':'"production"'},loader:{'.css':'css'}});copyFileSync('index.html','dist/index.html');copyFileSync('SPEC.md','dist/SPEC.md');
