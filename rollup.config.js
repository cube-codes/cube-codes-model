import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import minify from 'rollup-plugin-babel-minify';
import pkg from './package.json';

export default [{
	input: 'dist/package/index.js',
	output: {
	name: 'CC',
		file: pkg.browser,
		format: 'iife',
		sourcemap: 'inline',
	},
	plugins: [
		resolve(),
		commonjs(),
		minify({ comments: false }),
	],
}];