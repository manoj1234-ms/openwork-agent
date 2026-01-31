#!/usr/bin/env node

const path = require('path');

// Set the correct path for imports when running as a global CLI
const cliPath = path.join(__dirname, '..', 'src', 'index.js');
require(cliPath);