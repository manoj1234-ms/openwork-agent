const { Command } = require('commander');
const chalk = require('chalk');

const ProjectGenerator = require('./generators/ProjectGenerator');
const TechDetector = require('./core/TechDetector');

const program = new Command();

/**
 * CLI metadata
 */
program
  .name('openwork-agent')
  .description('AI-powered backend code generator for any technology stack')
  .version('1.0.0');

/**
 * CREATE COMMAND
 */
program
  .command('create <projectName>')
  .description('Create a new backend project')
  .option('-t, --tech <technology>', 'Technology (node, python, java, etc)')
  .option('-d, --database <database>', 'Database (postgresql, mongodb, mysql, etc)')
  .option('-f, --framework <framework>', 'Framework (express, fastapi, nestjs, etc)')
  .option('--template <template>', 'Project template')
  .option('--no-interactive', 'Disable interactive mode')
  .option('--docker', 'Include Docker setup')
  .option('--tests', 'Include tests')
  .option('--ci', 'Include CI/CD')
  .action(async (projectName, options) => {
    try {
      console.log(chalk.blue.bold('\n🚀 OpenWork Agent'));

      const generator = new ProjectGenerator();

      let config = {
        projectName,
        technology: options.tech,
        database: options.database,
        framework: options.framework,
        template: options.template,
        interactive: options.interactive !== false,
        includeDocker: !!options.docker,
        includeTests: !!options.tests,
        includeCI: !!options.ci
      };

      // Interactive prompt (only if enabled and missing values)
      if (config.interactive && !config.technology) {
        config = await generator.promptForConfiguration(config);
      }

      await generator.createProject(config);

      console.log(chalk.green.bold('\n✅ Project created successfully!'));
    } catch (err) {
      console.error(chalk.red('\n❌ Error:'), err.message);
      process.exit(1);
    }
  });

/**
 * ANALYZE COMMAND
 */
program
  .command('analyze')
  .description('Analyze current directory and detect technology')
  .action(async () => {
    const detector = new TechDetector();
    const result = await detector.analyzeCurrentDirectory();
    console.log(result);
  });

/**
 * LIST TECHNOLOGIES
 */
program
  .command('list')
  .description('List supported technologies')
  .action(() => {
    const detector = new TechDetector();
    console.log(detector.getAvailableTechnologies());
  });

/**
 * TEMPLATES
 */
program
  .command('templates')
  .description('List available templates')
  .action(() => {
    console.log([
      'api',
      'crud',
      'microservice',
      'graphql',
      'minimal'
    ]);
  });

/**
 * IMPORTANT:
 * parse() must be here and ONLY here
 */
program.parse(process.argv);

module.exports = program;
