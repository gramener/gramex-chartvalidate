#!/usr/bin/env node

import fs from "fs";
import { minimatch } from "minimatch";
import assert from "assert";
import semver from "semver";
import * as marked from "marked";
import YAML from "yaml";

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

let pkg;
runTest("package.json should be a valid JSON file", () => {
  pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
  assert.ok(pkg);
});

runTest('package.json "name" property should start with "@gramex/"', () => {
  assert.ok(pkg.name);
  assert.ok(pkg.name.startsWith("@gramex/"));
});

runTest('package.json "version" should be a valid semver and greater than 1.0.0', () => {
  assert.ok(pkg.version);
  assert.ok(semver.valid(pkg.version));
  assert.ok(semver.gte(pkg.version, "1.0.0"));
});

runTest('package.json "description" property should exist', () => {
  assert.ok(pkg.description);
});

runTest('package.json "module" should begin with "dist/" and end with ".js"', () => {
  assert.ok(pkg.module);
  assert.ok(pkg.module.startsWith("dist/"));
  assert.ok(pkg.module.endsWith(".js"));
});

runTest('package.json "main" should be the same as "module" but end with ".min.js" instead of ".js"', () => {
  assert.ok(pkg.main);
  assert.equal(pkg.main, pkg.module.replace(/\.js$/, ".min.js"));
});

runTest('package.json "browser" should not be defined', () => {
  assert.ok(!pkg.browser);
});

runTest('package.json "scripts.build" should be defined', () => {
  assert.ok(pkg.scripts);
  assert.ok(pkg.scripts.build);
});

runTest('package.json "scripts.prepublishOnly" should build"', () => {
  assert.ok(pkg.scripts);
  assert.ok(pkg.scripts.prepublishOnly.includes("npm run build") || pkg.scripts.prepublishOnly.includes("npm test"));
});

runTest('package.json "scripts.prepublish" should not be defined', () => {
  assert.ok(!pkg.scripts.prepublish);
});

runTest('package.json "scripts.pretest" should build if "scripts.test" exists"', () => {
  if (!pkg.scripts.test) return;
  if (pkg.scripts.pretest) assert.ok(pkg.scripts.pretest.includes("npm run build"));
});

runTest('package.json "files" should include "README.md", module, browser', () => {
  assert.ok(Array.isArray(pkg.files));
  assert.ok(pkg.files.some((pattern) => minimatch("README.md", pattern)));
  assert.ok(!pkg.module || pkg.files.some((pattern) => minimatch(pkg.module, pattern)));
  assert.ok(!pkg.browser || pkg.files.some((pattern) => minimatch(pkg.browser, pattern)));
});

runTest('package.json "repository" should point to a {type: git, url: "git@github.com/gramener/..."}', () => {
  assert.ok(pkg.repository);
  assert.equal(pkg.repository.type, "git");
  assert.ok(pkg.repository.url.startsWith("git@github.com/gramener/"));
});

runTest('package.json "keywords" should be defined', () => {
  assert.ok(Array.isArray(pkg.keywords));
});

runTest('package.json "author" should be defined', () => {
  assert.ok(pkg.author);
});

runTest('package.json "license" should be "MIT"', () => {
  assert.equal(pkg.license, "MIT");
});

runTest('package.json "bugs" should point the same code base as repository, but with "/issues" added', () => {
  assert.ok(pkg.bugs);
  assert.equal(pkg.bugs.url, `${pkg.repository.url.replace("git@", "https://").replace(".git", "")}/issues`);
});

runTest('package.json "homepage" is at https://gramener.com/gramex-<name>/ (if defined)', () => {
  if (pkg.homepage) assert.equal(pkg.homepage, `https://gramener.com/gramex-${pkg.name.split("/").at(1)}/`);
});

runTest('package.json "publishConfig" should push to https://registry.npmjs.org/', () => {
  assert.ok(pkg.publishConfig);
  assert.equal(pkg.publishConfig.access, "public");
  assert.equal(pkg.publishConfig.registry, "https://registry.npmjs.org/");
});

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
  if (!pkg.homepage) return;
  assert.ok(ci_yml.deploy);
  assert.equal(ci_yml.deploy.script, "deploy");
  assert.ok(ci_yml.deploy.variables);
  assert.equal(ci_yml.deploy.variables.SERVER, "gramener.com");
  assert.equal(ci_yml.deploy.variables.URL, `gramex-${pkg.name.split("/").at(1)}`);
  assert.equal(ci_yml.deploy.variables.VERSION, "static");
  assert.equal(ci_yml.deploy.variables.SETUP, "npm install && npm run build");
});

const readmeContent = fs.readFileSync("README.md", "utf8");
const tokens = marked.lexer(readmeContent);
const headings = tokens.filter((token) => token.type === "heading");

runTest("README.md should begin with a H1 with the package name", () => {
  assert.equal(headings[0].depth, 1);
  assert.equal(headings[0].text, pkg.name);
});

runTest('README.md should have "Example" as the first H2', () => {
  assert.equal(headings[1].depth, 2);
  assert.equal(headings[1].text, "Example");
});

runTest('README.md should have the next 2nd-level heading as "Installation"', () => {
  assert.equal(headings[2].depth, 2);
  assert.equal(headings[2].text, "Installation");
});

runTest('README.md should an "API" 2nd-level heading', () => {
  assert.ok(headings.some((h) => h.depth === 2 && h.text === "API"));
});

runTest("README.md should end with Release Notes, Authors and License 2nd-level headings", () => {
  const last3 = headings.slice(-3);
  assert.ok(last3.every((h) => h.depth === 2));
  assert.equal(last3.map((h) => h.text).join(), "Release notes,Authors,License");
});

runTest("README.md should have package.description between the first 2 headings", () => {
  const firstHeadingIndex = readmeContent.indexOf(headings[0].raw);
  const secondHeadingIndex = readmeContent.indexOf(headings[1].raw);
  const descriptionIndex = readmeContent.indexOf(pkg.description);
  assert.ok(descriptionIndex > firstHeadingIndex && descriptionIndex < secondHeadingIndex);
});

console.log("TAP version 14");
console.log(`1..${testCount}`);
calls.forEach((call) => call());
