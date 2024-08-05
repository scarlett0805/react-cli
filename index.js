#!/usr/bin/env node
import inquirer from "inquirer";
import { Command } from "commander";
import fs from "fs";
import path from "path";
import ora from "ora";
import chalk from "chalk";
import { spawnSync } from "child_process";

function getPackageJSON() {
  const packageJsonPath = path.join(process.cwd(), "package.json");
  const packageJsonContent = fs.readFileSync(packageJsonPath, "utf8");
  return JSON.parse(packageJsonContent);
}

const Mypackage = getPackageJSON();
const program = new Command();
program.version(Mypackage.version);
program
  .command("init")
  .description("Create a new project")
  .action(() => {
    initProject();
  });
program.parse(process.argv);

const choices = [
    { name: '选项A', value: 'a' },
    { name: '选项B', value: 'b' },
    { name: '选项C', value: 'c' },
];

function initProject() {

  inquirer
    .prompt([
      {
        type: "input",
        message: "Please enter the name of the project:",
        name: "name",
        default: "my-app",
      },
      {
        type: "list",
        message: "Please select the status of the emoji:",
        name: "status",
        choices: ["😄", "😡", "😭"],
      },
    ])
    .then(async (answers) => {
      if (answers.status === "😡") {
        console.log(chalk.yellow("don't be angry, be happy!"));
        return;
      }
      if (answers.status === "😭") {
        console.log(chalk.yellow("don't cry, be happy!"));
        return;
      }

      console.log(chalk.yellowBright("Please wait a moment..."));
      const localPath = path.join(process.cwd(), answers.name);
      const remote = `https://github.com/scarlett0805/vite-react.git`;
      const spinner = ora("download template......").start();
      const result = await spawnSync("git", ["clone", remote, localPath], {
        stdio: "pipe",
      });

      if (result.status !== 0) {
        spinner.fail(
          chalk.red("download template failed:" + result.stderr.toString())
        );
        return;
      }
      spinner.succeed(chalk.green("download template success"));
      updatePackageJsonName(localPath, answers.name);
      spinner.succeed(chalk.green("update package.json success"));
    });
}

function updatePackageJsonName(localPath, newName) {
  const packageJsonPath = path.join(localPath, "package.json");
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    packageJson.name = newName;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  } catch (err) {
    console.error(chalk.red("update package.json failed:" + err));
  }
}

