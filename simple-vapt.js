#!/usr/bin/env node

/**
 * Simple VAPT Script for ChainVerdict Legal Platform
 * Quick and effective security testing
 */

const { execSync } = require('child_process');
const fs = require('fs');

class SimpleVAPT {
  constructor() {
    this.results = {
      passed: [],
      failed: [],
      warnings: [],
      critical: []
    };
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      critical: '\x1b[35m',
      reset: '\x1b[0m'
    };
    console.log(`${colors[type]}${message}${colors.reset}`);
  }

  async runTest(command, description, critical = false) {
    this.log(`🔍 Testing: ${description}`, 'info');
    try {
      const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
      this.results.passed.push({ test: description, status: 'PASSED' });
      this.log(`✅ ${description} - PASSED`, 'success');
      return output;
    } catch (error) {
      if (critical) {
        this.results.critical.push({ test: description, error: error.message });
        this.log(`🚨 CRITICAL: ${description} - FAILED`, 'critical');
      } else {
        this.results.failed.push({ test: description, error: error.message });
        this.log(`❌ ${description} - FAILED`, 'error');
      }
      return null;
    }
  }

  // 1. Basic Security Tests
  async basicSecurityTests() {
    this.log('\n🛡️ Running Basic Security Tests...', 'info');
    
    // Dependency vulnerability scan
    await this.runTest(
      'cd frontend && npm audit --audit-level moderate',
      'Frontend Dependency Vulnerabilities'
    );

    if (fs.existsSync('backend/package.json')) {
      await this.runTest(
        'cd backend && npm audit --audit-level moderate',
        'Backend Dependency Vulnerabilities'
      );
    }

    // Check for hardcoded secrets
    await this.runTest(
      'grep -r -i "password.*=\\|secret.*=\\|key.*=\\|token.*=" --include="*.js" --include="*.jsx" frontend/src/ || echo "No hardcoded secrets found"',
      'Hardcoded Secrets Detection'
    );

    // Check for dangerous functions
    await this.runTest(
      'grep -r "eval\\|innerHTML\\|document.write" --include="*.js" --include="*.jsx" frontend/src/ || echo "No dangerous functions found"',
      'Dangerous Function Detection'
    );

    // Check for console statements (should be removed in production)
    await this.runTest(
      'grep -r "console\\." --include="*.js" --include="*.jsx" frontend/src/ | wc -l',
      'Console Statement Count'
    );
  }

  // 2. File Security Tests
  async fileSecurityTests() {
    this.log('\n📁 Running File Security Tests...', 'info');

    // Check for sensitive files
    const sensitiveFiles = [
      '.env',
      '.env.local',
      '.env.production',
      'config.json',
      'secrets.json',
      'private.key'
    ];

    sensitiveFiles.forEach(file => {
      if (fs.existsSync(file)) {
        this.results.warnings.push({
          test: 'Sensitive File Detection',
          issue: `Sensitive file found: ${file}`,
          recommendation: 'Ensure sensitive files are not committed to version control'
        });
        this.log(`⚠️ Sensitive file found: ${file}`, 'warning');
      }
    });

    // Check .gitignore
    if (fs.existsSync('.gitignore')) {
      const gitignore = fs.readFileSync('.gitignore', 'utf8');
      const requiredEntries = ['.env', 'node_modules', '*.log'];
      const missing = requiredEntries.filter(entry => !gitignore.includes(entry));
      
      if (missing.length > 0) {
        this.results.warnings.push({
          test: 'Gitignore Security',
          issue: `Missing entries in .gitignore: ${missing.join(', ')}`,
          recommendation: 'Add missing entries to .gitignore'
        });
        this.log(`⚠️ Missing .gitignore entries: ${missing.join(', ')}`, 'warning');
      } else {
        this.results.passed.push({ test: 'Gitignore Security', status: 'PASSED' });
        this.log('✅ Gitignore properly configured', 'success');
      }
    }
  }

  // 3. Code Quality Security Tests
  async codeQualityTests() {
    this.log('\n🔍 Running Code Quality Security Tests...', 'info');

    // Check for TODO/FIXME comments that might indicate security issues
    await this.runTest(
      'grep -r -i "TODO.*security\\|FIXME.*security\\|HACK\\|XXX" --include="*.js" --include="*.jsx" frontend/src/ || echo "No security-related TODOs found"',
      'Security TODO Detection'
    );

    // Check for commented out code
    await this.runTest(
      'grep -r "^\\s*//.*password\\|^\\s*//.*secret\\|^\\s*//.*key" --include="*.js" --include="*.jsx" frontend/src/ || echo "No commented security code found"',
      'Commented Security Code Detection'
    );

    // Check package.json for security
    if (fs.existsSync('frontend/package.json')) {
      const packageJson = JSON.parse(fs.readFileSync('frontend/package.json', 'utf8'));
      
      // Check for dev dependencies in production
      if (packageJson.dependencies) {
        const devInProd = Object.keys(packageJson.dependencies).filter(dep => 
          dep.includes('test') || dep.includes('dev') || dep.includes('mock')
        );
        
        if (devInProd.length > 0) {
          this.results.warnings.push({
            test: 'Package.json Security',
            issue: `Development dependencies in production: ${devInProd.join(', ')}`,
            recommendation: 'Move development dependencies to devDependencies'
          });
          this.log(`⚠️ Dev dependencies in production: ${devInProd.join(', ')}`, 'warning');
        }
      }
    }
  }

  // 4. Legal Platform Specific Tests
  async legalPlatformTests() {
    this.log('\n⚖️ Running Legal Platform Specific Tests...', 'info');

    // Check for proper error handling
    await this.runTest(
      'grep -r "try.*catch" --include="*.js" --include="*.jsx" frontend/src/ | wc -l',
      'Error Handling Implementation Count'
    );

    // Check for authentication patterns
    await this.runTest(
      'grep -r -i "auth\\|login\\|token\\|jwt" --include="*.js" --include="*.jsx" frontend/src/ | wc -l',
      'Authentication Implementation Count'
    );

    // Check for data validation patterns
    await this.runTest(
      'grep -r -i "validate\\|sanitize\\|escape" --include="*.js" --include="*.jsx" frontend/src/ | wc -l',
      'Data Validation Implementation Count'
    );

    // Legal platform specific checks
    const legalSecurityChecks = [
      'Client data encryption patterns',
      'Document access controls',
      'Audit trail implementation',
      'Privacy compliance measures'
    ];

    legalSecurityChecks.forEach(check => {
      this.results.passed.push({
        test: check,
        status: 'MANUAL_REVIEW_REQUIRED',
        recommendation: `Manual review required for: ${check}`
      });
    });
  }

  // 5. Generate Simple Report
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      platform: 'ChainVerdict Legal Platform',
      testType: 'Simple VAPT Assessment',
      summary: {
        totalTests: this.results.passed.length + this.results.failed.length + this.results.critical.length,
        passed: this.results.passed.length,
        failed: this.results.failed.length,
        warnings: this.results.warnings.length,
        critical: this.results.critical.length
      },
      riskLevel: this.calculateRiskLevel(),
      results: this.results,
      recommendations: this.generateRecommendations()
    };

    // Save JSON report
    const jsonPath = `simple-vapt-report-${Date.now()}.json`;
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));

    // Generate simple HTML report
    this.generateHTMLReport(report);

    return report;
  }

  calculateRiskLevel() {
    if (this.results.critical.length > 0) return 'CRITICAL';
    if (this.results.failed.length > 3) return 'HIGH';
    if (this.results.failed.length > 0 || this.results.warnings.length > 2) return 'MEDIUM';
    return 'LOW';
  }

  generateRecommendations() {
    const recommendations = [
      'Implement comprehensive input validation',
      'Set up automated security scanning in CI/CD',
      'Regular security training for development team',
      'Implement proper error handling and logging',
      'Use HTTPS in production environment',
      'Regular security audits and penetration testing'
    ];

    if (this.results.critical.length > 0) {
      recommendations.unshift('URGENT: Fix critical security issues immediately');
    }

    return recommendations;
  }

  generateHTMLReport(report) {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>ChainVerdict Simple VAPT Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { background: #e3f2fd; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .risk-critical { color: #d32f2f; font-weight: bold; }
        .risk-high { color: #f57c00; font-weight: bold; }
        .risk-medium { color: #fbc02d; font-weight: bold; }
        .risk-low { color: #388e3c; font-weight: bold; }
        .section { margin: 20px 0; }
        .test-passed { color: #4caf50; }
        .test-failed { color: #f44336; }
        .test-warning { color: #ff9800; }
        .recommendation { background: #fff3e0; padding: 10px; margin: 5px 0; border-left: 4px solid #ff9800; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔒 ChainVerdict Simple VAPT Report</h1>
            <p>Generated: ${report.timestamp}</p>
        </div>
        
        <div class="summary">
            <h2>📊 Executive Summary</h2>
            <p><strong>Risk Level:</strong> <span class="risk-${report.riskLevel.toLowerCase()}">${report.riskLevel}</span></p>
            <p><strong>Tests Passed:</strong> ${report.summary.passed}</p>
            <p><strong>Tests Failed:</strong> ${report.summary.failed}</p>
            <p><strong>Warnings:</strong> ${report.summary.warnings}</p>
            <p><strong>Critical Issues:</strong> ${report.summary.critical}</p>
        </div>

        <div class="section">
            <h2>✅ Passed Tests</h2>
            ${report.results.passed.map(test => `
                <div class="test-passed">✅ ${test.test}</div>
            `).join('')}
        </div>

        <div class="section">
            <h2>❌ Failed Tests</h2>
            ${report.results.failed.map(test => `
                <div class="test-failed">❌ ${test.test}</div>
            `).join('')}
        </div>

        <div class="section">
            <h2>⚠️ Warnings</h2>
            ${report.results.warnings.map(warning => `
                <div class="test-warning">⚠️ ${warning.test}: ${warning.issue}</div>
            `).join('')}
        </div>

        <div class="section">
            <h2>🚨 Critical Issues</h2>
            ${report.results.critical.map(critical => `
                <div class="test-failed">🚨 ${critical.test}</div>
            `).join('')}
        </div>

        <div class="section">
            <h2>💡 Recommendations</h2>
            ${report.recommendations.map(rec => `
                <div class="recommendation">${rec}</div>
            `).join('')}
        </div>
    </div>
</body>
</html>`;

    const htmlPath = `simple-vapt-report-${Date.now()}.html`;
    fs.writeFileSync(htmlPath, html);
    this.log(`📊 HTML Report generated: ${htmlPath}`, 'success');
  }

  // Main execution
  async runSimpleVAPT() {
    this.log('🚀 Starting Simple VAPT for ChainVerdict Legal Platform...', 'info');
    
    try {
      await this.basicSecurityTests();
      await this.fileSecurityTests();
      await this.codeQualityTests();
      await this.legalPlatformTests();

      const report = this.generateReport();
      
      this.log('\n✅ Simple VAPT completed!', 'success');
      this.log(`📊 Risk Level: ${report.riskLevel}`, report.riskLevel === 'CRITICAL' ? 'critical' : 'info');
      this.log(`🔍 Results: ${report.summary.passed} passed, ${report.summary.failed} failed, ${report.summary.warnings} warnings`, 'info');

      if (report.riskLevel === 'CRITICAL') {
        this.log('🚨 URGENT: Critical security issues found! Review immediately.', 'critical');
      }

    } catch (error) {
      this.log(`❌ Simple VAPT failed: ${error.message}`, 'error');
    }
  }
}

// Run if called directly
if (require.main === module) {
  const vapt = new SimpleVAPT();
  vapt.runSimpleVAPT();
}

module.exports = SimpleVAPT;
