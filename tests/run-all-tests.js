const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

const root = __dirname;
const reportDir = path.join(root, 'reports');
if (!fs.existsSync(reportDir)) {
  fs.mkdirSync(reportDir, { recursive: true });
}

function runStep(label, command) {
  const startedAt = new Date().toISOString();
  const start = Date.now();

  try {
    console.log(chalk.cyan(`\n[RUN] ${label}`));
    execSync(command, {
      cwd: root,
      stdio: 'inherit',
      shell: true,
      env: process.env
    });

    const durationMs = Date.now() - start;
    console.log(chalk.green(`[PASS] ${label} (${durationMs}ms)`));
    return { label, command, status: 'passed', durationMs, startedAt };
  } catch (error) {
    const durationMs = Date.now() - start;
    console.log(chalk.red(`[FAIL] ${label} (${durationMs}ms)`));
    return {
      label,
      command,
      status: 'failed',
      durationMs,
      startedAt,
      error: error.message
    };
  }
}

function readPerformanceSummary() {
  const file = path.join(reportDir, 'performance-baseline.json');
  if (!fs.existsSync(file)) {
    return { slowEndpoints: [], fileFound: false };
  }

  try {
    const json = JSON.parse(fs.readFileSync(file, 'utf8'));
    return { slowEndpoints: json.slowerThan500ms || [], fileFound: true };
  } catch {
    return { slowEndpoints: [], fileFound: false };
  }
}

function readCoverageSummary() {
  const coverageJson = path.join(reportDir, 'coverage', 'coverage.json');
  if (!fs.existsSync(coverageJson)) {
    return { coveragePct: null, fileFound: false };
  }

  try {
    const json = JSON.parse(fs.readFileSync(coverageJson, 'utf8'));
    return { coveragePct: json.line ?? null, fileFound: true };
  } catch {
    return { coveragePct: null, fileFound: false };
  }
}

const steps = [
  { label: 'Selenium E2E', command: 'npm run test:selenium' },
  { label: 'Integration Tests', command: 'npm run test:integration' },
  { label: 'Coverage', command: 'npm run test:coverage' },
  { label: 'Performance Baseline', command: 'npm run test:performance' }
];

const results = steps.map((s) => runStep(s.label, s.command));
const passed = results.filter((r) => r.status === 'passed').length;
const failed = results.length - passed;
const passRate = ((passed / results.length) * 100).toFixed(2);

const perf = readPerformanceSummary();
const coverage = readCoverageSummary();

const summary = {
  generatedAt: new Date().toISOString(),
  results,
  totals: {
    suites: results.length,
    passed,
    failed,
    passRatePct: Number(passRate)
  },
  coverage: coverage.coveragePct,
  slowestEndpoints: perf.slowEndpoints
};

const summaryFile = path.join(reportDir, 'qa2-summary.json');
fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2), 'utf8');

console.log(chalk.yellow('\n=== QA2 Summary ==='));
console.log(`Suites: ${results.length}`);
console.log(`Passed: ${chalk.green(passed)}`);
console.log(`Failed: ${failed > 0 ? chalk.red(failed) : chalk.green(failed)}`);
console.log(`Pass rate: ${passRate}%`);
console.log(`Coverage: ${coverage.coveragePct ?? 'N/A'}`);
console.log(`Slow endpoints (>500ms): ${perf.slowEndpoints.length ? perf.slowEndpoints.join(', ') : 'None'}`);
console.log(`Summary file: ${summaryFile}`);

process.exit(failed > 0 ? 1 : 0);
