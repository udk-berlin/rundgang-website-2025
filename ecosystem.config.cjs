module.exports = {
	apps: [
		{
			name: 'rundgang-2025',
			script: 'node',
			args: '--env-file=.env build/index.js',
			env: {
				NODE_ENV: 'production'
			}
		}
	]
};
