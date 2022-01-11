module.exports = {
	apps: [
		{
			name: 'solana-wallet',
			script: './dist/main.js',
			instances: -1,
			exec_mode: 'cluster',
		},
	],
};
