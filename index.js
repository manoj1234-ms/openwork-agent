#!/usr/bin/env node

const { Command } = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');

const ProjectGenerator = require('./src/generators/ProjectGenerator');
const TechDetector = require('./src/core/TechDetector');
const FileManager = require('./src/utils/FileManager');

const program = new Command();

program
  .name('openwork-agent')
  .description('AI-powered backend code generator for any technology stack')
  .version('1.0.0');

program
  .command('create <project-name>')
  .description('Create a new backend project')
  .option('-t, --tech <technology>', 'Specify technology (node, python, java, go, etc.)')
  .option('-d, --database <database>', 'Specify database (mongodb, postgresql, mysql, etc.)')
  .option('-f, --framework <framework>', 'Specify framework (express, fastapi, spring, etc.)')
  .option('--template <template>', 'Use specific template')
  .option('--interactive', 'Interactive mode (default)')
  .action(async (projectName, options) => {
    try {
      console.log(chalk.blue.bold('\n🚀 OpenWork Agent - Backend Code Generator'));
      console.log(chalk.gray('Creating your backend project...\n'));

      const generator = new ProjectGenerator();
      
      let config = {
        projectName,
        technology: options.tech,
        database: options.database,
        framework: options.framework,
        template: options.template,
        interactive: options.interactive !== false
      };

      if (config.interactive && !config.technology) {
        config = await generator.promptForConfiguration(config);
      }

      await generator.createProject(config);
      
      console.log(chalk.green.bold('\n✅ Project created successfully!'));
      console.log(chalk.cyan(`\nNext steps:`));
      console.log(chalk.white(`  cd ${projectName}`));
      console.log(chalk.white(`  npm install`));
      console.log(chalk.white(`  npm run dev`));
      
    } catch (error) {
      console.error(chalk.red.bold('\n❌ Error:'), error.message);
      process.exit(1);
    }
  });

program
  .command('analyze')
  .description('Analyze current directory and suggest technology stack')
  .action(async () => {
    try {
      const detector = new TechDetector();
      const analysis = await detector.analyzeCurrentDirectory();
      
      console.log(chalk.blue.bold('\n📊 Technology Analysis'));
      console.log(JSON.stringify(analysis, null, 2));
      
    } catch (error) {
      console.error(chalk.red.bold('\n❌ Error:'), error.message);
      process.exit(1);
    }
  });

program
  .command('templates')
  .description('List available templates')
  .action(() => {
    const templates = [
      { name: 'express-api', tech: 'node', description: 'Express.js REST API' },
      { name: 'fastapi-crud', tech: 'python', description: 'FastAPI CRUD operations' },
      { name: 'spring-boot', tech: 'java', description: 'Spring Boot microservice' },
      { name: 'go-gin', tech: 'go', description: 'Go Gin web service' },
      { name: 'django-api', tech: 'python', description: 'Django REST API' },
      { name: 'nestjs-api', tech: 'node', description: 'NestJS API with TypeScript' }
    ];

    console.log(chalk.blue.bold('\n📋 Available Templates'));
    templates.forEach((template, index) => {
      console.log(chalk.cyan(`${index + 1}. ${template.name}`));
      console.log(chalk.gray(`   Tech: ${template.tech} - ${template.description}`));
    });
  });

program.parse();