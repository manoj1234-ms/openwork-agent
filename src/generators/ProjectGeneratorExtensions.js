// Import template methods into ProjectGenerator
const templateMethods = require('./TemplateMethods');
const ProjectGenerator = require('./ProjectGenerator');

// Add template methods to ProjectGenerator prototype
Object.assign(ProjectGenerator.prototype, templateMethods);

// Import Docker templates
const dockerTemplates = require('../templates/docker');

// Add Docker generation methods to ProjectGenerator
Object.assign(ProjectGenerator.prototype, dockerTemplates);

module.exports = ProjectGenerator;