import * as p from "@clack/prompts"
import { setTimeout } from "node:timers/promises"
import color from "picocolors"
import { exec } from "child_process"

async function main() {
    console.clear()

    p.intro(`${color.bgCyan(color.bgGreen(" xxl-git-ticket "))}`)

    const project = await p.group(
        {
            prefix: async () => {
                const outPut = (await runCommand("git branch --show-current")) as string

                if (!isXDBranch(outPut)) {
                    p.cancel(
                        `${color.bgRed(
                            "You are not on a XD- branch. Update your branch name to XD-<ticket-number> and try again."
                        )}`
                    )
                }

                const ticketNumber = getTicketNumber(outPut)

                return p.text({
                    message: "What ticket prefix do you want to use?",
                    placeholder: `${ticketNumber}`,
                    initialValue: `${ticketNumber}`,
                    validate: (value) => {
                        console.log(value)
                        if (!value.startsWith("XD-"))
                            return "Please enter a valid ticket prefix. Start with XD-"
                    },
                })
            },
            message: () =>
                p.text({
                    message: "What is your commit message?",
                    validate: (value) => {
                        if (!value) return "Please enter a commit message."
                    },
                }),
            stage: async () => {
                const outPut = (await runCommand("git status --porcelain")) as string
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
                p.cancel("Operation cancelled.")
                process.exit(0)
            },
        }
    )

    if (!project.install) {
        p.cancel("Operation cancelled.")
        process.exit(0)
    }

    if (project.stage) {
        const s = p.spinner()
        s.start("staging files")
        runCommand(`git add .`)
        await setTimeout(500)
        s.stop("files staged ✅")
    }

    if (project.install) {
        const s = p.spinner()
        s.start("commiting via xxl-git-ticket")
        runCommand(`git commit -m "${project.prefix} ${project.message}"`)
        await setTimeout(500)
        s.stop("commited ✅")
    }

    p.outro(`Problems? ${color.underline(color.cyan("https://example.com/issues"))}`)
}

main().catch((err) => console.error(err))

// helpers

function runCommand(command: string) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout) => {
            if (error) {
                reject(error)
            } else {
                resolve(stdout)
            }
        })
    })
}

function getTicketNumber(branchName: string) {
    const ticketNumberLength = 4
    const projectKey = "XD-"
    const upperCaseBranchName = branchName.toUpperCase()

    if (!upperCaseBranchName.includes(projectKey)) return projectKey

    const ProjectKeyIndex = upperCaseBranchName.indexOf(projectKey)
    const endOfTicketNumber = ProjectKeyIndex + projectKey.length + ticketNumberLength
    const ticketNumber = upperCaseBranchName.slice(ProjectKeyIndex, endOfTicketNumber)

    return ticketNumber.trim()
}

function isXDBranch(branchName: string) {
    const projectKey = "XD-"
    if (branchName.includes(projectKey.toLocaleLowerCase()) || branchName.includes(projectKey)) {
        return true
    }

    return false
}
