const fs = require('fs-extra');
const path = require('path');
const Handlebars = require('handlebars');

class FileManager {
  constructor() {
    this.registerHandlebarsHelpers();
  }

  registerHandlebarsHelpers() {
    Handlebars.registerHelper('camelCase', (str) => {
      return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      }).replace(/\s+/g, '');
    });

    Handlebars.registerHelper('pascalCase', (str) => {
      return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => {
        return word.toUpperCase();
      }).replace(/\s+/g, '');
    });

    Handlebars.registerHelper('kebabCase', (str) => {
      return str.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/\s+/g, '-').toLowerCase();
    });

    Handlebars.registerHelper('snakeCase', (str) => {
      return str.replace(/([a-z])([A-Z])/g, '$1_$2').replace(/\s+/g, '_').toLowerCase();
    });

    Handlebars.registerHelper('upperCase', (str) => {
      return str.toUpperCase();
    });

    Handlebars.registerHelper('lowerCase', (str) => {
      return str.toLowerCase();
    });

    // Common conditional helpers
    Handlebars.registerHelper('eq', (a, b) => {
      return a === b;
    });

    Handlebars.registerHelper('ne', (a, b) => {
      return a !== b;
    });

    Handlebars.registerHelper('gt', (a, b) => {
      return a > b;
    });

    Handlebars.registerHelper('lt', (a, b) => {
      return a < b;
    });

    Handlebars.registerHelper('and', (...args) => {
      return args.slice(0, -1).every(Boolean);
    });

    Handlebars.registerHelper('or', (...args) => {
      return args.slice(0, -1).some(Boolean);
    });

    Handlebars.registerHelper('not', (value) => {
      return !value;
    });
  }

  async copyDirectory(src, dest, config = {}) {
    const items = await fs.readdir(src);

    for (const item of items) {
      const srcPath = path.join(src, item);
      const destPath = path.join(dest, item);
      const stat = await fs.stat(srcPath);

      if (stat.isDirectory()) {
        await fs.ensureDir(destPath);
        await this.copyDirectory(srcPath, destPath, config);
      } else {
        if (this.shouldProcessFile(item)) {
          await this.processTemplate(srcPath, destPath, config);
        } else {
          await fs.copy(srcPath, destPath);
        }
      }
    }
  }

  shouldProcessFile(filename) {
    const processableExtensions = ['.hbs', '.handlebars', '.txt', '.js', '.ts', '.py', '.java', '.go', '.rs', '.php', '.html', '.md'];
    return processableExtensions.some(ext => filename.endsWith(ext));
  }

  async processTemplate(srcPath, destPath, config) {
    try {
      const content = await fs.readFile(srcPath, 'utf8');
      const template = Handlebars.compile(content);
      const processed = template(config);
      
      // Remove .hbs extension if present
      const finalDestPath = destPath.endsWith('.hbs') ? destPath.slice(0, -4) : destPath;
      
      await fs.writeFile(finalDestPath, processed);
    } catch (error) {
      // If template processing fails, copy the file as-is
      await fs.copy(srcPath, destPath);
    }
  }

  async writeFileWithTemplate(templatePath, destPath, config) {
    if (await fs.pathExists(templatePath)) {
      await this.processTemplate(templatePath, destPath, config);
    } else {
      throw new Error(`Template file not found: ${templatePath}`);
    }
  }

  async ensureDir(dirPath) {
    await fs.ensureDir(dirPath);
  }

  async copyFile(src, dest) {
    await fs.copy(src, dest);
  }

  async writeFile(filePath, content) {
    await fs.writeFile(filePath, content);
  }

  async readFile(filePath) {
    return await fs.readFile(filePath, 'utf8');
  }

  async pathExists(filePath) {
    return await fs.pathExists(filePath);
  }

  async readdir(dirPath) {
    return await fs.readdir(dirPath);
  }

  async stat(filePath) {
    return await fs.stat(filePath);
  }

  createDirectoryStructure(basePath, structure) {
    return Promise.all(
      Object.entries(structure).map(async ([path, content]) => {
        const fullPath = this.resolvePath(basePath, path);
        
        if (typeof content === 'object' && !Array.isArray(content)) {
          await fs.ensureDir(fullPath);
          return this.createDirectoryStructure(fullPath, content);
        } else if (Array.isArray(content)) {
          await fs.ensureDir(fullPath);
          return Promise.all(
            content.map(item => this.createDirectoryStructure(fullPath, item))
          );
        } else {
          await fs.ensureDir(path.dirname(fullPath));
          return fs.writeFile(fullPath, content || '');
        }
      })
    );
  }

  resolvePath(base, relativePath) {
    return path.resolve(base, relativePath);
  }

  getFileExtension(filename) {
    return path.extname(filename);
  }

  getFileName(filename) {
    return path.basename(filename, path.extname(filename));
  }

  formatTemplate(template, data) {
    const compiled = Handlebars.compile(template);
    return compiled(data);
  }
}

module.exports = FileManager;