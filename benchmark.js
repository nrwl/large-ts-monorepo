const cp = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const parser = require('yargs-parser');

const options = parser(process.argv.slice(2), {
  // small, medium, large, nested
  string: ['scenario'],
  boolean: ['verbose'],
});

if (!options.scenario) {
  throw new Error('Please specify the package size to run the benchmark for.');
}

const scenarioInfo = {
  small: {
    levels: [1, 3, 2],
    count: 10,
  },
  medium: {
    levels: [1, 7, 6],
    count: 50,
  },
  large: {
    levels: [1, 12, 20],
    count: 253,
  },
  nested: {
    levels: [1, 2, 2, 2, 2, 2],
    count: 63,
  },
};

const NUMBER_OF_RUNS = 3;
const totalPkgs = scenarioInfo[options.scenario].count;

function logTitle(message) {
  console.log(''.padEnd(message.length, '-'));
  console.log(message);
  console.log(''.padEnd(message.length, '-'));
}

function clearOutput() {
  cp.execSync('find packages -type d -name dist | xargs rm -rf');
}

function clearCache() {
  cp.execSync('nx reset');
}

function spawnSync(cmd, args, env = {}) {
  return cp.spawnSync(
    path.join(
      '.',
      'node_modules',
      '.bin',
      os.platform() === 'win32' ? cmd + '.cmd' : cmd
    ),
    args,
    {
      stdio: options.verbose ? 'inherit' : 'pipe',
      env: { ...process.env, ...env },
    }
  );
}

function runBenchmark(task, options = {}) {
  clearOutput();
  clearCache();

  if (options.warmup) {
    console.log('Running warmup...');
    task();
  }

  let totalTime = 0;
  for (let i = 0; i < NUMBER_OF_RUNS; ++i) {
    (options.clearOutput ?? true) && clearOutput();
    (options.clearCache ?? true) && clearCache();
    options.prepare && options.prepare();

    console.log(`Run ${i + 1}...`);
    const startTime = Date.now();
    task();
    const endTime = Date.now();
    const elapsedTime = endTime - startTime;
    totalTime += elapsedTime;
    console.log(`Ran in ${elapsedTime}ms`);
  }

  return totalTime / NUMBER_OF_RUNS;
}

function getPkgsToAffectCount(percentage) {
  const count = Math.round((totalPkgs * percentage) / 100);
  const actualPercentage = Math.round((count * 100) / totalPkgs);

  return { count, percentage: actualPercentage };
}

function updatePkg(pkgName) {
  const filePath = path.join(__dirname, 'packages', pkgName, 'src', 'index.ts');
  const content = fs.readFileSync(filePath);
  fs.writeFileSync(filePath, `${content}//`);
}

function affectPackages(pkgsCountToAffect) {
  let affectedPkgsCount = 0;

  // level 0
  updatePkg(`${options.scenario}-pkg1`);
  affectedPkgsCount++;

  // level 1
  for (
    let i = 1;
    i <= scenarioInfo[options.scenario].levels[1] &&
    affectedPkgsCount < pkgsCountToAffect;
    i++
  ) {
    updatePkg(`${options.scenario}-pkg1-${i}`);
    affectedPkgsCount++;
  }

  // level 2
  for (
    let i = 1;
    i <= scenarioInfo[options.scenario].levels[1] &&
    affectedPkgsCount < pkgsCountToAffect;
    i++
  ) {
    for (
      let j = 1;
      j <= scenarioInfo[options.scenario].levels[2] &&
      affectedPkgsCount < pkgsCountToAffect;
      j++
    ) {
      updatePkg(`${options.scenario}-pkg1-${i}-${j}`);
      affectedPkgsCount++;
    }
  }
}

const affected10Info = getPkgsToAffectCount(10);
const affected20Info = getPkgsToAffectCount(20);
const affected50Info = getPkgsToAffectCount(50);
const benchmarkTimes = {
  normal: {
    cold: 0,
    affected10: 0,
    affected20: 0,
    affected50: 0,
    affectedLeafDep: 0,
  },
  references: {
    cold: 0,
    affected10: 0,
    affected20: 0,
    affected50: 0,
    affectedLeafDep: 0,
  },
};

// Cold builds
logTitle(`Running a cold build with "tsc" ${NUMBER_OF_RUNS} times`);
benchmarkTimes.normal.cold = runBenchmark(() =>
  spawnSync('nx', [
    'run',
    `${options.scenario}-pkg1:build`,
    `--configuration=old`,
  ])
);

logTitle(`Running a cold build with "tsc --build" ${NUMBER_OF_RUNS} times`);
benchmarkTimes.references.cold = runBenchmark(() =>
  spawnSync('nx', ['run', `${options.scenario}-pkg1:build`])
);

// ~10% affected
const affected10RunOptions = {
  prepare: () => affectPackages(affected10Info.count),
  warmup: true,
  clearCache: false,
  clearOutput: false,
};

logTitle(
  `Running build for ${affected10Info.count} affected packages (~${affected10Info.percentage}%) with "tsc" ${NUMBER_OF_RUNS} times`
);
benchmarkTimes.normal.affected10 = runBenchmark(
  () =>
    spawnSync('nx', [
      'run',
      `${options.scenario}-pkg1:build`,
      `--configuration=old`,
    ]),
  affected10RunOptions
);

logTitle(
  `Running build for ${affected10Info.count} affected packages (~${affected10Info.percentage}%) with "tsc --build" ${NUMBER_OF_RUNS} times`
);
benchmarkTimes.references.affected10 = runBenchmark(
  () => spawnSync('nx', ['run', `${options.scenario}-pkg1:build`]),
  affected10RunOptions
);

// ~20% affected
const affected20RunOptions = {
  prepare: () => affectPackages(affected20Info.count),
  warmup: true,
  clearCache: false,
  clearOutput: false,
};

logTitle(
  `Running build for ${affected20Info.count} affected packages (~${affected20Info.percentage}%) with "tsc" ${NUMBER_OF_RUNS} times`
);
benchmarkTimes.normal.affected20 = runBenchmark(
  () =>
    spawnSync('nx', [
      'run',
      `${options.scenario}-pkg1:build`,
      `--configuration=old`,
    ]),
  affected20RunOptions
);

logTitle(
  `Running build for ${affected20Info.count} affected packages (~${affected20Info.percentage}%) "tsc --build" ${NUMBER_OF_RUNS} times`
);
benchmarkTimes.references.affected20 = runBenchmark(
  () => spawnSync('nx', ['run', `${options.scenario}-pkg1:build`]),
  affected20RunOptions
);

// ~50% affected
const affected50RunOptions = {
  prepare: () => affectPackages(affected50Info.count),
  warmup: true,
  clearCache: false,
  clearOutput: false,
};

logTitle(
  `Running build for ${affected50Info.count} affected packages (~${affected50Info.percentage}%) with "tsc" ${NUMBER_OF_RUNS} times`
);
benchmarkTimes.normal.affected50 = runBenchmark(
  () =>
    spawnSync('nx', [
      'run',
      `${options.scenario}-pkg1:build`,
      `--configuration=old`,
    ]),
  affected50RunOptions
);

logTitle(
  `Running build for ${affected50Info.count} affected packages (~${affected50Info.percentage}%) with "tsc --build" ${NUMBER_OF_RUNS} times`
);
benchmarkTimes.references.affected50 = runBenchmark(
  () => spawnSync('nx', ['run', `${options.scenario}-pkg1:build`]),
  affected50RunOptions
);

// leaf project dep affected
const affectedLeafDepRunOptions = {
  prepare: () => {
    const topPkgName = `${options.scenario}-pkg1`;
    updatePkg(
      topPkgName.padEnd(
        topPkgName.length +
          2 * (scenarioInfo[options.scenario].levels.length - 1),
        '-1'
      )
    );
  },
  warmup: true,
  clearCache: false,
  clearOutput: false,
};

logTitle(
  `Running build for project with a leaf dependency affected with "tsc" ${NUMBER_OF_RUNS} times`
);
benchmarkTimes.normal.affectedLeafDep = runBenchmark(
  () =>
    spawnSync('nx', [
      'run',
      `${options.scenario}-pkg1:build`,
      `--configuration=old`,
    ]),
  affectedLeafDepRunOptions
);

logTitle(
  `Running build for project with a leaf dependency affected with "tsc --build" ${NUMBER_OF_RUNS} times`
);
benchmarkTimes.references.affectedLeafDep = runBenchmark(
  () => spawnSync('nx', ['run', `${options.scenario}-pkg1:build`]),
  affectedLeafDepRunOptions
);

// Summary
console.log('\n');
console.log('\n');
logTitle('RESULTS');
console.log('\n');
console.log(
  `Average cold build time with "tsc" is: ${benchmarkTimes.normal.cold}ms`
);
console.log(
  `Average cold build time with "tsc --build" time is: ${benchmarkTimes.references.cold}ms`
);
console.log(
  `Cold builds with "tsc --build" is ${
    benchmarkTimes.normal.cold / benchmarkTimes.references.cold
  }x faster than not using --build`
);

console.log('\n');

console.log(
  `Average build time for ${affected10Info.count} affected packages (~${affected10Info.percentage}%) with "tsc" is: ${benchmarkTimes.normal.affected10}ms`
);
console.log(
  `Average build time for ${affected10Info.count} affected packages (~${affected10Info.percentage}%) with "tsc --build" time is: ${benchmarkTimes.references.affected10}ms`
);
console.log(
  `Running "tsc --build" was ${
    benchmarkTimes.normal.affected10 / benchmarkTimes.references.affected10
  }x faster than not using --build`
);

console.log('\n');

console.log(
  `Average build time for ${affected20Info.count} affected packages (~${affected20Info.percentage}%) with "tsc" is: ${benchmarkTimes.normal.affected20}ms`
);
console.log(
  `Average build time for ${affected20Info.count} affected packages (~${affected20Info.percentage}%) with "tsc --build" time is: ${benchmarkTimes.references.affected20}ms`
);
console.log(
  `Running "tsc --build" was ${
    benchmarkTimes.normal.affected20 / benchmarkTimes.references.affected20
  }x faster than not using --build`
);

console.log('\n');

console.log(
  `Average build time for ${affected50Info.count} affected packages (~${affected50Info.percentage}%) with "tsc" is: ${benchmarkTimes.normal.affected50}ms`
);
console.log(
  `Average build time for ${affected50Info.count} affected packages (~${affected50Info.percentage}%) with "tsc --build" time is: ${benchmarkTimes.references.affected50}ms`
);
console.log(
  `Running "tsc --build" was ${
    benchmarkTimes.normal.affected50 / benchmarkTimes.references.affected50
  }x faster than not using --build`
);

console.log('\n');

console.log(
  `Average build time for project with a leaf dependency affected with "tsc" is: ${benchmarkTimes.normal.affectedLeafDep}ms`
);
console.log(
  `Average build time for project with a leaf dependency affected with "tsc --build" time is: ${benchmarkTimes.references.affectedLeafDep}ms`
);
console.log(
  `Running "tsc --build" was ${
    benchmarkTimes.normal.affectedLeafDep /
    benchmarkTimes.references.affectedLeafDep
  }x faster than not using --build`
);

// cleanup pkgs changes
cp.execSync('git restore .');
