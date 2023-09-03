import cli from '@tinacms/cli'

const [, , ...args] = process.argv
void cli.runExit(args)
