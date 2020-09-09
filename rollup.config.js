import noderesolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
//import pkg from './package.json';

export default [{
	input: 'dist/package/index.js',
	output: {
		name: 'CCM',
		file: 'dist/browser/cube-codes-model.js',
		format: 'iife',
		sourcemap: 'inline'
	},
	onwarn: function(warning) {
		if(warning.code === 'THIS_IS_UNDEFINED') return;
	},
	plugins: [
		noderesolve({
			browser: true
		}),
		commonjs()
	],
}];