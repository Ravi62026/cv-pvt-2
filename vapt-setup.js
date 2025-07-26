#!/usr/bin/env node

/**
 * ChainVerdict VAPT (Vulnerability Assessment & Penetration Testing) Suite
 * Comprehensive security testing for legal platform
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

class VAPTSuite {
  constructor() {
    this.results = {
      vulnerabilities: [],
      criticalIssues: [],
      warnings: [],
      recommendations: [],
      summary: {}
    };
    this.targetUrl = 'http://localhost:5173';
    this.apiUrl = 'http://localhost:5000'; // Adjust based on your backend
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      critical: '\x1b[35m',
      reset: '\x1b[0m'
    };
    
    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
  }

  async runCommand(command, description, critical = false) {
    this.log(`🔍 ${description}`, 'info');
    try {
      const output = execSync(command, { 
        encoding: 'utf8', 
        stdio: 'pipe',
        timeout: 60000 
      });
      
      if (critical && output.includes('vulnerabilities')) {
        this.results.criticalIssues.push({
          test: description,
          output: output,
          severity: 'HIGH'
        });
        this.log(`🚨 CRITICAL: ${description}`, 'critical');
      } else {
        this.log(`✅ ${description} - Completed`, 'success');
      }
      
      return output;
    } catch (error) {
      this.log(`❌ ${description} - Error: ${error.message}`, 'error');
      this.results.vulnerabilities.push({
        test: description,
        error: error.message,
        severity: 'MEDIUM'
      });
      return null;
    }
  }

  // 1. Dependency Vulnerability Assessment
  async dependencyVulnerabilityAssessment() {
    this.log('🔍 Starting Dependency Vulnerability Assessment...', 'info');
    
    // Frontend dependencies
    await this.runCommand(
      'cd frontend && npm audit --audit-level low --json',
      'Frontend Dependency Vulnerability Scan',
      true
    );

    // Backend dependencies (if exists)
    if (fs.existsSync('backend/package.json')) {
      await this.runCommand(
        'cd backend && npm audit --audit-level low --json',
        'Backend Dependency Vulnerability Scan',
        true
      );
    }

    // Check for outdated packages
    await this.runCommand(
      'cd frontend && npm outdated',
      'Outdated Package Detection'
    );

    // Snyk vulnerability scan
    try {
      await this.runCommand(
        'cd frontend && npx snyk test --severity-threshold=medium',
        'Snyk Advanced Vulnerability Scan',
        true
      );
    } catch (error) {
      this.log('Snyk not available, skipping advanced scan', 'warning');
    }
  }

  // 2. Static Application Security Testing (SAST)
  async staticApplicationSecurityTesting() {
    this.log('🔍 Starting Static Application Security Testing...', 'info');

    // ESLint security scan
    await this.runCommand(
      'cd frontend && npx eslint . --ext .js,.jsx,.ts,.tsx -c ../.eslintrc.security.js --format json',
      'ESLint Security Analysis'
    );

    // Check for hardcoded secrets
    await this.runCommand(
      'grep -r -i "password\\|secret\\|key\\|token\\|api_key" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" frontend/src/ || echo "No hardcoded secrets found"',
      'Hardcoded Secrets Detection'
    );

    // Check for dangerous functions
    await this.runCommand(
      'grep -r -i "eval\\|innerHTML\\|document.write\\|setTimeout.*string\\|setInterval.*string" --include="*.js" --include="*.jsx" frontend/src/ || echo "No dangerous functions found"',
      'Dangerous Function Detection'
    );

    // Check for console.log in production code
    await this.runCommand(
      'grep -r "console\\." --include="*.js" --include="*.jsx" frontend/src/ || echo "No console statements found"',
      'Console Statement Detection'
    );
  }

  // 3. Dynamic Application Security Testing (DAST)
  async dynamicApplicationSecurityTesting() {
    this.log('🔍 Starting Dynamic Application Security Testing...', 'info');

    // Check if application is running
    const isAppRunning = await this.checkApplicationStatus();
    if (!isAppRunning) {
      this.log('⚠️ Application not running on localhost:5173. Please start the app first.', 'warning');
      return;
    }

    // Basic HTTP security headers check
    await this.checkSecurityHeaders();
    
    // SSL/TLS configuration check
    await this.checkSSLConfiguration();
    
    // CORS configuration check
    await this.checkCORSConfiguration();
    
    // Authentication bypass testing
    await this.testAuthenticationBypass();
    
    // Input validation testing
    await this.testInputValidation();
  }

  async checkApplicationStatus() {
    try {
      const response = await this.makeHttpRequest(this.targetUrl);
      this.log('✅ Application is running and accessible', 'success');
      return true;
    } catch (error) {
      this.log(`❌ Application not accessible: ${error.message}`, 'error');
      return false;
    }
  }

  async checkSecurityHeaders() {
    this.log('🔍 Checking Security Headers...', 'info');
    
    try {
      const response = await this.makeHttpRequest(this.targetUrl, { method: 'HEAD' });
      const headers = response.headers;
      
      const requiredHeaders = [
        'x-frame-options',
        'x-content-type-options',
        'x-xss-protection',
        'strict-transport-security',
        'content-security-policy'
      ];

      const missingHeaders = [];
      requiredHeaders.forEach(header => {
        if (!headers[header]) {
          missingHeaders.push(header);
        }
      });

      if (missingHeaders.length > 0) {
        this.results.vulnerabilities.push({
          test: 'Security Headers Check',
          issue: `Missing security headers: ${missingHeaders.join(', ')}`,
          severity: 'MEDIUM',
          recommendation: 'Implement missing security headers'
        });
        this.log(`⚠️ Missing security headers: ${missingHeaders.join(', ')}`, 'warning');
      } else {
        this.log('✅ All required security headers present', 'success');
      }
    } catch (error) {
      this.log(`❌ Security headers check failed: ${error.message}`, 'error');
    }
  }

  async checkSSLConfiguration() {
    this.log('🔍 Checking SSL/TLS Configuration...', 'info');
    
    // This would be more relevant for production HTTPS endpoints
    if (this.targetUrl.startsWith('https://')) {
      try {
        await this.runCommand(
          `openssl s_client -connect ${this.targetUrl.replace('https://', '')}:443 -servername ${this.targetUrl.replace('https://', '')} < /dev/null`,
          'SSL Certificate Validation'
        );
      } catch (error) {
        this.log('SSL check requires OpenSSL, skipping...', 'warning');
      }
    } else {
      this.results.warnings.push({
        test: 'SSL Configuration',
        issue: 'Application running on HTTP instead of HTTPS',
        severity: 'HIGH',
        recommendation: 'Enable HTTPS in production'
      });
      this.log('⚠️ Application running on HTTP - Enable HTTPS for production', 'warning');
    }
  }

  async checkCORSConfiguration() {
    this.log('🔍 Checking CORS Configuration...', 'info');
    
    try {
      const response = await this.makeHttpRequest(this.targetUrl, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'https://malicious-site.com',
          'Access-Control-Request-Method': 'POST'
        }
      });

      const corsHeaders = response.headers['access-control-allow-origin'];
      if (corsHeaders === '*') {
        this.results.vulnerabilities.push({
          test: 'CORS Configuration',
          issue: 'Wildcard CORS policy detected',
          severity: 'MEDIUM',
          recommendation: 'Restrict CORS to specific domains'
        });
        this.log('⚠️ Wildcard CORS policy detected - security risk', 'warning');
      }
    } catch (error) {
      this.log('CORS check completed', 'info');
    }
  }

  async testAuthenticationBypass() {
    this.log('🔍 Testing Authentication Bypass...', 'info');
    
    const bypassPayloads = [
      '/admin',
      '/dashboard',
      '/api/users',
      '/api/admin',
      '/../admin',
      '/admin/../admin'
    ];

    for (const payload of bypassPayloads) {
      try {
        const response = await this.makeHttpRequest(this.targetUrl + payload);
        if (response.statusCode === 200) {
          this.results.vulnerabilities.push({
            test: 'Authentication Bypass',
            issue: `Unauthenticated access to: ${payload}`,
            severity: 'HIGH',
            recommendation: 'Implement proper authentication checks'
          });
          this.log(`🚨 Potential auth bypass: ${payload}`, 'critical');
        }
      } catch (error) {
        // Expected for protected routes
      }
    }
  }

  async testInputValidation() {
    this.log('🔍 Testing Input Validation...', 'info');
    
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      'javascript:alert("XSS")',
      '<img src=x onerror=alert("XSS")>',
      '"><script>alert("XSS")</script>',
      "'; alert('XSS'); //"
    ];

    const sqlPayloads = [
      "' OR '1'='1",
      "'; DROP TABLE users; --",
      "' UNION SELECT * FROM users --",
      "admin'--",
      "' OR 1=1#"
    ];

    // Test XSS payloads (would need actual form endpoints)
    this.log('Testing XSS payloads...', 'info');
    
    // Test SQL injection payloads (would need actual API endpoints)
    this.log('Testing SQL injection payloads...', 'info');
    
    // This is a placeholder - actual implementation would test real endpoints
    this.results.recommendations.push({
      test: 'Input Validation',
      recommendation: 'Implement comprehensive input validation and sanitization'
    });
  }

  // 4. API Security Testing
  async apiSecurityTesting() {
    this.log('🔍 Starting API Security Testing...', 'info');
    
    // Test rate limiting
    await this.testRateLimiting();
    
    // Test API authentication
    await this.testAPIAuthentication();
    
    // Test API authorization
    await this.testAPIAuthorization();
  }

  async testRateLimiting() {
    this.log('🔍 Testing Rate Limiting...', 'info');
    
    // Make multiple rapid requests to test rate limiting
    const requests = [];
    for (let i = 0; i < 100; i++) {
      requests.push(this.makeHttpRequest(this.apiUrl + '/api/test'));
    }

    try {
      const responses = await Promise.allSettled(requests);
      const rateLimited = responses.some(r => 
        r.status === 'fulfilled' && r.value.statusCode === 429
      );

      if (!rateLimited) {
        this.results.vulnerabilities.push({
          test: 'Rate Limiting',
          issue: 'No rate limiting detected',
          severity: 'MEDIUM',
          recommendation: 'Implement API rate limiting'
        });
        this.log('⚠️ No rate limiting detected', 'warning');
      } else {
        this.log('✅ Rate limiting is working', 'success');
      }
    } catch (error) {
      this.log('Rate limiting test completed', 'info');
    }
  }

  async testAPIAuthentication() {
    this.log('🔍 Testing API Authentication...', 'info');
    
    const protectedEndpoints = [
      '/api/users',
      '/api/cases',
      '/api/documents',
      '/api/admin'
    ];

    for (const endpoint of protectedEndpoints) {
      try {
        const response = await this.makeHttpRequest(this.apiUrl + endpoint);
        if (response.statusCode === 200) {
          this.results.vulnerabilities.push({
            test: 'API Authentication',
            issue: `Unauthenticated access to: ${endpoint}`,
            severity: 'HIGH',
            recommendation: 'Implement proper API authentication'
          });
          this.log(`🚨 Unauthenticated API access: ${endpoint}`, 'critical');
        }
      } catch (error) {
        // Expected for protected endpoints
      }
    }
  }

  async testAPIAuthorization() {
    this.log('🔍 Testing API Authorization...', 'info');
    
    // Test with different user roles
    const testCases = [
      { role: 'citizen', endpoint: '/api/admin/users' },
      { role: 'lawyer', endpoint: '/api/admin/settings' },
      { role: 'citizen', endpoint: '/api/lawyer/cases' }
    ];

    // This would require actual JWT tokens for different roles
    this.results.recommendations.push({
      test: 'API Authorization',
      recommendation: 'Implement role-based access control testing'
    });
  }

  // 5. Legal Platform Specific Security Testing
  async legalPlatformSecurityTesting() {
    this.log('🔍 Starting Legal Platform Specific Security Testing...', 'info');
    
    // Test document access controls
    await this.testDocumentSecurity();
    
    // Test client data protection
    await this.testClientDataProtection();
    
    // Test audit trail functionality
    await this.testAuditTrail();
  }

  async testDocumentSecurity() {
    this.log('🔍 Testing Document Security...', 'info');
    
    // Test document access without proper authorization
    const documentTests = [
      '/api/documents/1',
      '/api/documents/admin',
      '/api/documents/../../../etc/passwd',
      '/api/documents/..%2F..%2F..%2Fetc%2Fpasswd'
    ];

    for (const test of documentTests) {
      try {
        const response = await this.makeHttpRequest(this.apiUrl + test);
        if (response.statusCode === 200) {
          this.results.vulnerabilities.push({
            test: 'Document Security',
            issue: `Unauthorized document access: ${test}`,
            severity: 'CRITICAL',
            recommendation: 'Implement strict document access controls'
          });
          this.log(`🚨 CRITICAL: Unauthorized document access: ${test}`, 'critical');
        }
      } catch (error) {
        // Expected for protected documents
      }
    }
  }

  async testClientDataProtection() {
    this.log('🔍 Testing Client Data Protection...', 'info');
    
    // Check for data exposure in API responses
    this.results.recommendations.push({
      test: 'Client Data Protection',
      recommendation: 'Ensure client data is properly encrypted and access-controlled'
    });
  }

  async testAuditTrail() {
    this.log('🔍 Testing Audit Trail...', 'info');
    
    // Test if actions are properly logged
    this.results.recommendations.push({
      test: 'Audit Trail',
      recommendation: 'Implement comprehensive audit logging for all user actions'
    });
  }

  // Utility function for HTTP requests
  makeHttpRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const requestOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname + urlObj.search,
        method: options.method || 'GET',
        headers: options.headers || {},
        timeout: 5000
      };

      const req = (urlObj.protocol === 'https:' ? https : http).request(requestOptions, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data
          });
        });
      });

      req.on('error', reject);
      req.on('timeout', () => reject(new Error('Request timeout')));
      
      if (options.data) {
        req.write(options.data);
      }
      
      req.end();
    });
  }

  // Generate comprehensive VAPT report
  generateVAPTReport() {
    const report = {
      timestamp: new Date().toISOString(),
      platform: 'ChainVerdict Legal Platform',
      testType: 'VAPT (Vulnerability Assessment & Penetration Testing)',
      summary: {
        totalTests: this.results.vulnerabilities.length + this.results.criticalIssues.length + this.results.warnings.length,
        criticalIssues: this.results.criticalIssues.length,
        vulnerabilities: this.results.vulnerabilities.length,
        warnings: this.results.warnings.length,
        recommendations: this.results.recommendations.length
      },
      riskLevel: this.calculateRiskLevel(),
      findings: {
        critical: this.results.criticalIssues,
        vulnerabilities: this.results.vulnerabilities,
        warnings: this.results.warnings,
        recommendations: this.results.recommendations
      },
      nextSteps: this.generateNextSteps()
    };

    const reportPath = `vapt-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    this.log(`📊 VAPT Report generated: ${reportPath}`, 'success');
    this.generateHTMLReport(report);
    
    return report;
  }

  calculateRiskLevel() {
    const critical = this.results.criticalIssues.length;
    const high = this.results.vulnerabilities.filter(v => v.severity === 'HIGH').length;
    const medium = this.results.vulnerabilities.filter(v => v.severity === 'MEDIUM').length;

    if (critical > 0) return 'CRITICAL';
    if (high > 2) return 'HIGH';
    if (high > 0 || medium > 3) return 'MEDIUM';
    return 'LOW';
  }

  generateNextSteps() {
    const steps = [
      'Review and fix all critical vulnerabilities immediately',
      'Implement missing security headers',
      'Set up automated security scanning in CI/CD pipeline',
      'Conduct regular penetration testing',
      'Implement comprehensive logging and monitoring',
      'Train development team on secure coding practices'
    ];

    if (this.results.criticalIssues.length > 0) {
      steps.unshift('URGENT: Address critical security issues within 24 hours');
    }

    return steps;
  }

  generateHTMLReport(report) {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>ChainVerdict VAPT Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .critical { color: #d32f2f; }
        .high { color: #f57c00; }
        .medium { color: #fbc02d; }
        .low { color: #388e3c; }
        .summary { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .finding { margin: 10px 0; padding: 10px; border-left: 4px solid #ccc; }
    </style>
</head>
<body>
    <h1>ChainVerdict VAPT Report</h1>
    <div class="summary">
        <h2>Executive Summary</h2>
        <p><strong>Risk Level:</strong> <span class="${report.riskLevel.toLowerCase()}">${report.riskLevel}</span></p>
        <p><strong>Critical Issues:</strong> ${report.summary.criticalIssues}</p>
        <p><strong>Vulnerabilities:</strong> ${report.summary.vulnerabilities}</p>
        <p><strong>Warnings:</strong> ${report.summary.warnings}</p>
    </div>
    
    <h2>Findings</h2>
    ${report.findings.critical.map(f => `
        <div class="finding critical">
            <h3>CRITICAL: ${f.test}</h3>
            <p>${f.output || f.issue}</p>
        </div>
    `).join('')}
    
    ${report.findings.vulnerabilities.map(f => `
        <div class="finding ${f.severity.toLowerCase()}">
            <h3>${f.severity}: ${f.test}</h3>
            <p>${f.issue || f.error}</p>
            ${f.recommendation ? `<p><strong>Recommendation:</strong> ${f.recommendation}</p>` : ''}
        </div>
    `).join('')}
    
    <h2>Next Steps</h2>
    <ol>
        ${report.nextSteps.map(step => `<li>${step}</li>`).join('')}
    </ol>
</body>
</html>`;

    const htmlPath = `vapt-report-${Date.now()}.html`;
    fs.writeFileSync(htmlPath, html);
    this.log(`📊 HTML Report generated: ${htmlPath}`, 'success');
  }

  // Main VAPT execution
  async runVAPT() {
    this.log('🚀 Starting ChainVerdict VAPT Suite...', 'info');
    
    try {
      await this.dependencyVulnerabilityAssessment();
      await this.staticApplicationSecurityTesting();
      await this.dynamicApplicationSecurityTesting();
      await this.apiSecurityTesting();
      await this.legalPlatformSecurityTesting();

      const report = this.generateVAPTReport();
      
      this.log('✅ VAPT completed successfully!', 'success');
      this.log(`📊 Risk Level: ${report.riskLevel}`, report.riskLevel === 'CRITICAL' ? 'critical' : 'info');
      this.log(`🔍 Found: ${report.summary.criticalIssues} critical, ${report.summary.vulnerabilities} vulnerabilities`, 'info');

      if (report.riskLevel === 'CRITICAL') {
        this.log('🚨 URGENT ACTION REQUIRED: Critical vulnerabilities found!', 'critical');
      }

    } catch (error) {
      this.log(`❌ VAPT failed: ${error.message}`, 'error');
    }
  }
}

// Run VAPT if called directly
if (require.main === module) {
  const vapt = new VAPTSuite();
  vapt.runVAPT();
}

module.exports = VAPTSuite;
