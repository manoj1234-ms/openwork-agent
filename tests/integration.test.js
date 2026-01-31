const TechDetector = require('../src/core/TechDetector');

describe('TechDetector Integration', () => {
  let detector;

  beforeEach(() => {
    detector = new TechDetector();
  });

  test('should have all required technology signatures', () => {
    const technologies = detector.getAvailableTechnologies();
    
    expect(technologies).toContain('node');
    expect(technologies).toContain('python');
    expect(technologies).toContain('java');
    expect(technologies).toContain('go');
    expect(technologies).toContain('rust');
    expect(technologies).toContain('php');
  });

  test('should have complete technology configurations', () => {
    const technologies = detector.getAvailableTechnologies();
    
    technologies.forEach(tech => {
      const config = detector.techSignatures[tech];
      expect(config).toHaveProperty('files');
      expect(config).toHaveProperty('extensions');
      expect(config).toHaveProperty('patterns');
      expect(config).toHaveProperty('frameworks');
      expect(Array.isArray(config.files)).toBe(true);
      expect(Array.isArray(config.extensions)).toBe(true);
      expect(Array.isArray(config.patterns)).toBe(true);
    });
  });

  test('should have framework configurations for each technology', () => {
    const technologies = detector.getAvailableTechnologies();
    
    technologies.forEach(tech => {
      const frameworks = detector.getFrameworksForTechnology(tech);
      if (frameworks.length > 0) {
        const config = detector.techSignatures[tech];
        expect(Object.keys(config.frameworks)).toEqual(frameworks);
        
        frameworks.forEach(framework => {
          expect(config.frameworks[framework]).toBeDefined();
          expect(Array.isArray(config.frameworks[framework])).toBe(true);
        });
      }
    });
  });

  test('should have database signatures', () => {
    const databases = detector.getAvailableDatabases();
    
    expect(databases).toContain('mongodb');
    expect(databases).toContain('postgresql');
    expect(databases).toContain('mysql');
    expect(databases).toContain('sqlite');
    expect(databases).toContain('redis');
    
    const dbConfig = detector.databaseSignatures;
    databases.forEach(db => {
      expect(dbConfig[db]).toBeDefined();
      expect(Array.isArray(dbConfig[db])).toBe(true);
    });
  });

  test('should provide recommended tech stacks', () => {
    const recommendations = detector.getRecommendedTechStack();
    
    expect(recommendations).toHaveProperty('node');
    expect(recommendations).toHaveProperty('python');
    expect(recommendations).toHaveProperty('java');
    expect(recommendations).toHaveProperty('go');
    expect(recommendations).toHaveProperty('rust');
    
    Object.values(recommendations).forEach(stack => {
      expect(stack).toHaveProperty('frameworks');
      expect(stack).toHaveProperty('databases');
      expect(stack).toHaveProperty('reason');
      expect(Array.isArray(stack.frameworks)).toBe(true);
      expect(Array.isArray(stack.databases)).toBe(true);
      expect(typeof stack.reason).toBe('string');
    });
  });
});

describe('File Operations Integration', () => {
  test('should handle directory operations correctly', async () => {
    const fs = require('fs-extra');
    const path = require('path');
    const os = require('os');
    
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'openwork-integration-'));
    
    try {
      // Test directory creation
      const testDir = path.join(tempDir, 'test-project');
      await fs.ensureDir(testDir);
      
      // Test file creation
      const testFile = path.join(testDir, 'package.json');
      await fs.writeFile(testFile, JSON.stringify({ name: 'test' }));
      
      // Verify operations
      expect(await fs.pathExists(testFile)).toBe(true);
      expect(await fs.stat(testFile)).toBeDefined();
      
      const content = await fs.readFile(testFile, 'utf8');
      const parsed = JSON.parse(content);
      expect(parsed.name).toBe('test');
      
    } finally {
      await fs.remove(tempDir);
    }
  });
});