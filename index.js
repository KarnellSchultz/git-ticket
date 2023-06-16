import * as p from '@clack/prompts';
import { setTimeout } from 'node:timers/promises';
import color from 'picocolors';

import { exec } from 'child_process'

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

const runCommand = (command) => {
	return new Promise((resolve, reject) => {
		exec(command, (error, stdout, stderr) => {
			if (error) {
				reject(error);
			} else {
				resolve(stdout);
			}
		});
	});
};



async function main() {
	console.clear();

	p.intro(`${color.bgCyan(color.bgGreen(' xxl-git-ticket '))}`);


	const project = await p.group(
		{
			prefix: async () => {
				const outPut = await runCommand('git branch --show-current')
				const [ticketId, ticketNumber] = outPut.toString().toUpperCase().split("/")[1].split("-")
				return p.text({
					message: 'What ticket prefix do you want to use?',
					placeholder: `${ticketId}-${ticketNumber}`,
					initialValue: `${ticketId}-${ticketNumber}`,
					validate: (value) => {
						if (!value.startsWith("XD-")) return 'Please enter a valid ticket prefix. Start with XD-';
					},
				})
			},
			message: () =>
				p.text({
					message: 'What is your commit message?',
					validate: (value) => {
						if (!value) return 'Please enter a commit message.';
					},
				}),
			stage: async () => {
				// git command to see how many file are unstaged
				const outPut = await runCommand('git status --porcelain')
				const stagedFiles = outPut.toString().split("\n").length - 1

				return p.confirm({
					message: `Stage all files? ${stagedFiles} files will be staged.`,
					initialValue: false,
				})
			},
			install: ({ results }) =>
				p.confirm({
					message: `Commit with the following message? "${results.prefix} ${results.message}"`,
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

	if (!project.install) {
		p.cancel('Operation cancelled.');
		process.exit(0);
	}

	if (project.stage) {
		const s = p.spinner();
		s.start('staging files');
		runCommand(`git add .`)
		await setTimeout(1000);
		s.stop('files staged ✅');
	}


	if (project.install) {
		const s = p.spinner();
		s.start('commiting via xxl-git-ticket');
		runCommand(`git commit -m "${project.prefix} ${project.message}"`)
		await setTimeout(1000);
		s.stop('success ✅');
	}



	let nextSteps = `Happy coding`;

	p.note(nextSteps, 'Next steps.');

	p.outro(`Problems? ${color.underline(color.cyan('https://example.com/issues'))}`);
}



main();