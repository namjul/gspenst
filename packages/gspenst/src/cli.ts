import cli from '@tinacms/cli'

const [, , ...args] = process.argv
cli.runExit(args)
