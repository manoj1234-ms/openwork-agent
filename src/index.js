#!/usr/bin/env node

const { Command } = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');

const ProjectGenerator = require('./generators');
const TechDetector = require('./core/TechDetector');
const FileManager = require('./utils/FileManager');

const program = new Command();

program
  .name('openwork-agent')
  .description('AI-powered backend code generator for any technology stack')
  .version('1.0.0');

program
  .command('create <project-name>')
  .description('Create a new backend project')
  .option('-t, --tech <technology>', 'Specify technology (node, python, java, go, rust, php, etc.)')
  .option('-d, --database <database>', 'Specify database (mongodb, postgresql, mysql, sqlite, etc.)')
  .option('-f, --framework <framework>', 'Specify framework (express, fastapi, spring, gin, etc.)')
  .option('--template <template>', 'Use specific template')
  .option('--no-interactive', 'Skip interactive prompts')
  .option('--docker', 'Include Docker configuration')
  .option('--tests', 'Include test setup')
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
        interactive: options.interactive,
        includeDocker: options.docker,
        includeTests: options.tests
      };

      if (config.interactive && !config.technology) {
        config = await generator.promptForConfiguration(config);
      }

      await generator.createProject(config);
      
      console.log(chalk.green.bold('\n✅ Project created successfully!'));
      console.log(chalk.cyan(`\nNext steps:`));
      console.log(chalk.white(`  cd ${projectName}`));
      
      // Show setup commands based on technology
      const setupCommands = generator.getSetupCommands(config.technology);
      setupCommands.forEach(cmd => {
        console.log(chalk.white(`  ${cmd}`));
      });
      
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
      
      if (analysis.technologies.length > 0) {
        console.log(chalk.yellow('\nDetected Technologies:'));
        analysis.technologies.forEach(tech => {
          const confidence = Math.round(analysis.confidence[tech] * 100);
          console.log(chalk.white(`  ${tech}: ${confidence}% confidence`));
        });
      }
      
      if (analysis.frameworks.length > 0) {
        console.log(chalk.yellow('\nDetected Frameworks:'));
        analysis.frameworks.forEach(fw => {
          console.log(chalk.white(`  ${fw.technology}: ${fw.framework}`));
        });
      }
      
      if (analysis.databases.length > 0) {
        console.log(chalk.yellow('\nDetected Databases:'));
        analysis.databases.forEach(db => {
          console.log(chalk.white(`  ${db}`));
        });
      }
      
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
      { name: 'express-api', tech: 'node', description: 'Express.js REST API with TypeScript' },
      { name: 'fastapi-crud', tech: 'python', description: 'FastAPI CRUD operations with SQLAlchemy' },
      { name: 'spring-boot', tech: 'java', description: 'Spring Boot microservice with JPA' },
      { name: 'go-gin', tech: 'go', description: 'Go Gin web service with GORM' },
      { name: 'rust-actix', tech: 'rust', description: 'Actix-web API with Diesel ORM' },
      { name: 'django-api', tech: 'python', description: 'Django REST API' },
      { name: 'nestjs-api', tech: 'node', description: 'NestJS API with PostgreSQL' },
      { name: 'laravel-api', tech: 'php', description: 'Laravel REST API' }
    ];

    console.log(chalk.blue.bold('\n📋 Available Templates'));
    templates.forEach((template, index) => {
      console.log(chalk.cyan(`${index + 1}. ${template.name}`));
      console.log(chalk.gray(`   Tech: ${template.tech} - ${template.description}`));
    });
  });

program
  .command('list')
  .description('List supported technologies and frameworks')
  .action(() => {
    const detector = new TechDetector();
    const technologies = detector.getAvailableTechnologies();
    
    console.log(chalk.blue.bold('\n🔧 Supported Technologies:'));
    technologies.forEach(tech => {
      const frameworks = detector.getFrameworksForTechnology(tech);
      console.log(chalk.cyan(`\n${tech}:`));
      frameworks.forEach(fw => {
        console.log(chalk.white(`  - ${fw}`));
      });
    });
    
    console.log(chalk.green.bold('\n💾 Supported Databases:'));
    detector.getAvailableDatabases().forEach(db => {
      console.log(chalk.white(`  - ${db}`));
    });
  });

program.parse();