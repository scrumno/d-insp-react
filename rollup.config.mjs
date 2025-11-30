import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import { createRequire } from 'node:module'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import postcss from 'rollup-plugin-postcss'

const require = createRequire(import.meta.url)
const pkg = require('./package.json')

export default {
	input: 'src/index.ts',
	output: [
		{
			dir: 'dist',
			format: 'cjs',
			sourcemap: true,
			entryFileNames: 'index.js',
			chunkFileNames: 'chunks/[name]-[hash].cjs',
			interop: 'auto',
		},
		{
			dir: 'dist',
			format: 'esm',
			sourcemap: true,
			entryFileNames: 'index.esm.js',
			chunkFileNames: 'chunks/[name]-[hash].js',
		},
	],
	external: [
		...Object.keys(pkg.dependencies || {}),
		...Object.keys(pkg.peerDependencies || {}),
		'react/jsx-runtime',
	],
	plugins: [
		peerDepsExternal(),

		postcss({
			extensions: ['.css'],
			minimize: true,
			extract: false,
			inject: true,
		}),

		resolve(),

		commonjs(),

		typescript({
			tsconfig: './tsconfig.json',
			declaration: true,
			declarationDir: 'dist',
			outDir: 'dist',
			exclude: ['**/*.test.ts', '**/*.test.tsx', 'src/setupTests.ts'],
		}),
	],
}
