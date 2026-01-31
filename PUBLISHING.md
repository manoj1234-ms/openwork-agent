# Publishing Guide for OpenWork Agent

This guide explains how to publish the OpenWork Agent as an NPM module.

## 🚀 Prerequisites

- Node.js >= 14.0.0
- NPM account
- Git repository

## 📦 Package Structure

The package is structured as follows:

```
openwork-agent/
├── bin/                     # CLI entry point
│   └── openwork-agent.js     # Global CLI script
├── src/                     # Source code
│   ├── index.js             # Main CLI interface
│   ├── core/               # Core functionality
│   ├── generators/          # Project generators
│   ├── templates/           # Code templates
│   └── utils/              # Utilities
├── templates/               # Handlebars templates
├── tests/                  # Test files
├── README.md               # Package documentation
├── LICENSE                 # MIT License
├── .npmignore              # NPM ignore file
└── package.json            # Package configuration
```

## 📋 Publishing Steps

### 1. Update Version

```bash
npm version patch    # 1.0.1
npm version minor    # 1.1.0
npm version major    # 2.0.0
```

### 2. Run Tests

```bash
npm test
```

### 3. Check Package

```bash
npm pack --dry-run
```

### 4. Publish to NPM

```bash
npm publish
```

### 5. Tag Release

```bash
git tag v1.0.0
git push origin v1.0.0
```

## 🌍 Installation Methods

### Global Installation (Recommended)

```bash
npm install -g openwork-agent
```

### Local Installation

```bash
npm install openwork-agent
```

### Using Yarn

```bash
yarn global add openwork-agent
```

### Using pnpm

```bash
pnpm add -g openwork-agent
```

## 🧪 Testing After Installation

### Test Global CLI

```bash
# After global installation
openwork-agent --help
openwork-agent create my-test-app --tech node --framework express
```

### Test Programmatic Usage

```javascript
const { ProjectGenerator } = require('openwork-agent');

const generator = new ProjectGenerator();
await generator.createProject({
  projectName: 'my-api',
  technology: 'node',
  framework: 'express',
  database: 'mongodb'
});
```

## 📊 Package Analytics

To track package performance:

```bash
npm view openwork-agent
npm downloads openwork-agent
```

## 🔄 Continuous Integration

Add to your CI/CD pipeline:

```yaml
# .github/workflows/npm-publish.yml
name: Publish NPM Package

on:
  release:
    types: [published]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## 🏷️ Versioning

Follow semantic versioning:
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

## 📝 Release Checklist

- [ ] Update version in package.json
- [ ] Update CHANGELOG.md
- [ ] Run all tests
- [ ] Test global installation
- [ ] Verify CLI commands work
- [ ] Check package size
- [ ] Update documentation
- [ ] Create Git tag
- [ ] Publish to NPM
- [ ] Verify installation

## 🔐 Security Considerations

- No sensitive data in package
- Dependencies are audited
- Code is reviewed
- License is properly declared

## 📈 Promotion

After publishing:

1. **Tweet about it**: Share with hashtags #nodejs #opensource #cli
2. **Reddit**: Post to r/node, r/javascript, r/opensource
3. **Dev.to**: Write a tutorial
4. **Hacker News**: Share if it's interesting
5. **Product Hunt**: Launch on Product Hunt
6. **GitHub**: Create a comprehensive README

## 📞 Support

Provide support channels:
- GitHub Issues: Bug reports and feature requests
- Discord: Community support
- Email: Direct contact
- Documentation: Comprehensive guides

---

## 🎯 Success Metrics

Track these metrics:
- **Downloads**: Weekly and monthly downloads
- **Stars**: GitHub repository stars
- **Contributors**: Community contributors
- **Issues**: Issue resolution time
- **Usage**: GitHub dependents