module.exports = {
	entry: {
		flexlayout: "./src/index.ts"
	},
	mode: 'development',
	devtool: 'source-map',
	output: {
		path: __dirname,
		library: "FlexLayout",
		libraryTarget:"umd",
		filename: "./dist/[name].js"
	},
	externals: {
		react: {
			root: 'React',
			commonjs: 'react',
			commonjs2: 'react',
			amd: 'react'
		},
		"react-dom":{
			root: 'ReactDOM',
			commonjs: 'react-dom',
			commonjs2: 'react-dom',
			amd: 'react-dom'
		}
	},
	resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".ts", ".tsx", ".js", ".json"]
    },
    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
            { test: /\.tsx?$/, loader: "awesome-typescript-loader"},

            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
        ]
    }

};
