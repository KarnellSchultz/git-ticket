import * as p from '@clack/prompts';
import { setTimeout } from 'node:timers/promises';
import color from 'picocolors';

// const { exec } = require('child_process');
// const arg1 = process.argv[2];


// exec('git branch --show-current', (err, stdout, stderr) => {
// 	if (err) {
// 		console.error(`exec error: ${err}`);
// 		return;
// 	}

// 	const ticketId = stdout.toString().split("/")[1].split("-")
// 	console.log(`stdout: ${ticketId[0]}-${ticketId[1]} ${arg1}`);
// 	exec(`git commit -m "${ticketId[0]}-${ticketId[1]} ${arg1} "`, (err, stdout, stderr) => {
// 		if (err) {
// 			console.error(`exec error: ${err}`);
// 			return;
// 		}
// 		console.log(stdout);



// 	});
// });

import { spawn } from 'child_process'





async function main() {
	console.clear();

	await setTimeout(1000);

	p.intro(`${color.bgCyan(color.bgGreen(' xxl-git-ticket '))}`);


	const command = spawn('git', ['branch', '--show-current']);

	let outPut = '';
	command.stdout.on('data', (data) => {
		outPut += data.toString().split("/")[1].split("-")[0] + "-" + data.toString().split("/")[1].split("-")[1] + " ";
	});

	const project = await p.group(
		{
			path: () =>
				p.text({
					message: 'What ticket prefix do you want to use?',
					placeholder: outPut,
					validate: (value) => {
						if (!value) return 'Please enter a path.';
						if (value[0] !== '.') return 'Please enter a relative path.';
					},
				}),
			password: () =>
				p.password({
					message: 'Provide a password',
					validate: (value) => {
						if (!value) return 'Please enter a password.';
						if (value.length < 5) return 'Password should have at least 5 characters.';
					},
				}),
			type: ({ results }) =>
				p.select({
					message: `Pick a project type within "${results.path}"`,
					initialValue: 'ts',
					options: [
						{ value: 'ts', label: 'TypeScript' },
						{ value: 'js', label: 'JavaScript' },
						{ value: 'coffee', label: 'CoffeeScript', hint: 'oh no' },
					],
				}),
			tools: () =>
				p.multiselect({
					message: 'Select additional tools.',
					initialValues: ['prettier', 'eslint'],
					options: [
						{ value: 'prettier', label: 'Prettier', hint: 'recommended' },
						{ value: 'eslint', label: 'ESLint', hint: 'recommended' },
						{ value: 'stylelint', label: 'Stylelint' },
						{ value: 'gh-action', label: 'GitHub Action' },
					],
				}),
			install: () =>
				p.confirm({
					message: 'Install dependencies?',
					initialValue: false,
				}),
		},
		{
			onCancel: () => {
				p.cancel('Operation cancelled.');
				process.exit(0);
			},
		}
	);

	if (project.install) {
		const s = p.spinner();
		s.start('Installing via pnpm');
		await setTimeout(5000);
		s.stop('Installed via pnpm');
	}

	let nextSteps = `cd ${project.path}        \n${project.install ? '' : 'pnpm install\n'}pnpm dev`;

	p.note(nextSteps, 'Next steps.');

	p.outro(`Problems? ${color.underline(color.cyan('https://example.com/issues'))}`);
}

main().catch(console.error);