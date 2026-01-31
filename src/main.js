#!/usr/bin/env node

// Fix the ProjectGenerator import issue
const ProjectGenerator = require('./generators/ProjectGenerator');
require('./generators/ProjectGeneratorExtensions');

// Re-export the main entry point
require('./index');