#!/usr/bin/env node

const fs = require("fs");
const minimatch = require("minimatch").minimatch;
const assert = require("assert");
const semver = require("semver");

let testCount = 0;
const calls = [];

function runTest(description, testFn) {
  const counter = ++testCount;
  calls.push(function () {
    try {
      testFn();
      console.log(`ok ${counter} - ${description}`);
    } catch (err) {
      console.log(`not ok ${counter} - ${description}`);
      console.log(`  ---\n  message: "${err.message}"\n  ...`);
    }
  });
}

let package;
runTest("package.json should be a valid JSON file", () => {
  package = JSON.parse(fs.readFileSync("package.json", "utf8"));
  assert.ok(package);
});

runTest('package.json "name" property should start with "@gramex/"', () => {
  assert.ok(package.name);
  assert.ok(package.name.startsWith("@gramex/"));
});

runTest('package.json "version" should be a valid semver and greater than 1.0.0', () => {
  assert.ok(package.version);
  assert.ok(semver.valid(package.version));
  assert.ok(semver.gte(package.version, "1.0.0"));
});

runTest('package.json "description" property should exist', () => {
  assert.ok(package.description);
});

// Additional tests
runTest('package.json "module" should begin with "dist/" and end with ".js"', () => {
  assert.ok(package.module);
  assert.ok(package.module.startsWith("dist/"));
  assert.ok(package.module.endsWith(".js"));
});

runTest('package.json "browser" should be the same as "module" but end with ".min.js" instead of ".js"', () => {
  assert.ok(package.browser);
  assert.equal(package.browser, package.module.replace(/\.js$/, ".min.js"));
});

runTest('package.json "scripts.build" should be defined', () => {
  assert.ok(package.scripts);
  assert.ok(package.scripts.build);
});

runTest('package.json "scripts.prepublishOnly" should lint and build"', () => {
  assert.ok(package.scripts);
  assert.equal(package.scripts.prepublishOnly, "npm run lint && npm run build");
});

runTest('package.json "scripts.lint" should run prettier and eslint', () => {
  assert.ok(package.scripts);
  assert.ok(package.scripts.lint.includes("prettier"));
  assert.ok(package.scripts.lint.includes("eslint"));
});

runTest('package.json "scripts.prepublish" should not be defined', () => {
  assert.ok(!package.scripts.prepublish);
});

runTest('package.json "files" should include "README.md", module, browser', () => {
  assert.ok(Array.isArray(package.files));
  assert.ok(package.files.some((pattern) => minimatch("README.md", pattern)));
  assert.ok(!package.module || package.files.some((pattern) => minimatch(package.module, pattern)));
  assert.ok(!package.browser || package.files.some((pattern) => minimatch(package.browser, pattern)));
});

runTest('package.json "repository" should point to a {type: git, url: "git+https://code.gramener.com/..."}', () => {
  assert.ok(package.repository);
  assert.equal(package.repository.type, "git");
  assert.ok(package.repository.url.startsWith("git+https://code.gramener.com/"));
});

runTest('package.json "keywords" should be defined', () => {
  assert.ok(Array.isArray(package.keywords));
});

runTest('package.json "author" should be defined', () => {
  assert.ok(package.author);
});

runTest('package.json "license" should be "MIT"', () => {
  assert.equal(package.license, "MIT");
});

runTest('package.json "bugs" should point the same code base as repository, but with "/-/issues" added', () => {
  assert.ok(package.bugs);
  assert.equal(package.bugs.url, `${package.repository.url.replace("git+", "").replace(".git", "")}/-/issues`);
});

runTest('package.json "prettier" should have a "printWidth" of 100 or more', () => {
  assert.ok(package.prettier);
  assert.ok(package.prettier.printWidth >= 100);
});

runTest('package.json "homepage" is at https://gramener.com/gramex-<name>/ (if defined)', () => {
  if (package.homepage) assert.equal(package.homepage, `https://gramener.com/gramex-${package.name.split("/").at(1)}/`);
});

runTest('package.json "publishConfig" should push to https://registry.npmjs.org/', () => {
  assert.ok(package.publishConfig);
  assert.equal(package.publishConfig.access, "public");
  assert.equal(package.publishConfig.registry, "https://registry.npmjs.org/");
});

const YAML = require("yaml");

let ci_yml;
runTest(".gitlab-ci.yml should be a valid YAML file", () => {
  ci_yml = YAML.parse(fs.readFileSync(".gitlab-ci.yml", "utf8"));
  assert.ok(ci_yml);
});

runTest(".gitlab-ci.yml should validate build errors", () => {
  assert.deepEqual(ci_yml.validate, {
    image: "gramener/builderrors",
    script: "builderrors",
  });
});

runTest(".gitlab-ci.yml should deploy to package.homepage as static (if defined)", () => {
  if (!package.homepage) return;
  assert.ok(ci_yml.deploy);
  assert.equal(ci_yml.deploy.script, "deploy");
  assert.ok(ci_yml.deploy.variables);
  assert.equal(ci_yml.deploy.variables.SERVER, "gramener.com");
  assert.equal(ci_yml.deploy.variables.URL, `gramex-${package.name.split("/").at(1)}`);
  assert.equal(ci_yml.deploy.variables.VERSION, "static");
  assert.equal(ci_yml.deploy.variables.SETUP, "npm install && npm run build");
});

console.log("TAP version 14");
console.log(`1..${testCount}`);
calls.forEach((call) => call());
