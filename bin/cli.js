#!/usr/bin/env node
const fs = require("fs-extra");
const chalk = require("chalk");
const { exec } = require("child_process");
const spawn = require("child_process").spawn;
const path = require("path");

const [, , ...project] = process.argv;

const errorMessage = chalk.red(
  "🚨  It seems something has gone wrong. Report issues here 👉 https://github.com/PlayPickup/expugrea/issues"
);

const createDirectory = async () => {
  try {
    await fs.mkdirp(...project);
    console.log(chalk.green("📁  Project directory created successfully!"));
  } catch (err) {
    console.error(err);
    console.log(errorMessage);
  }
};

const setupProjectFiles = async () => {
  const configFiles = [
    ".browserslistrc",
    ".eslintignore",
    ".eslintrc.json",
    ".prettierignore",
    ".prettierrc",
  ];

  try {
    process.chdir(...project);

    exec("git init", (error, stdout, stderr) => {
      if (error) {
        console.error(`error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
      }
      console.log(chalk.green("✅  Git initialized!"));
    });

    await fs.copy(path.resolve(__dirname, "../lib"), ".");

    for (let index = 0; index < configFiles.length; index++) {
      fs.createReadStream(
        path.join(__dirname, `../lib/${configFiles[index]}`)
      ).pipe(fs.createWriteStream(`${configFiles[index]}`));
    }

    const gitIgnore = `
build
dist
.cache
.DS_Store
node_modules
.env
    `;

    fs.writeFileSync(".gitignore", gitIgnore, (err) => {
      if (err) {
        console.error(err);
        console.log(errorMessage);
      }
      return;
    });

    console.log(chalk.green("✅  Project files copied successfully!"));
    fs.cm;
  } catch (error) {
    console.error(error);
    console.log(errorMessage);
  }
};

const installProject = async () => {
  console.log(chalk.yellow("⏳  Installing project dependencies via yarn..."));
  const yarn = spawn("yarn", ["install"]);
  yarn.stdout.on("data", (data) => {
    console.log(chalk.blue(data.toString()));
  });

  yarn.stderr.on("data", (data) => {
    console.log(chalk.blue(data.toString()));
  });

  yarn.on("error", (err) => {
    console.error(err);
    console.log(errorMessage);
  });

  yarn.on("exit", (code) => {
    if (code === 0) {
      console.log(chalk.green("💯  Project dependencies installed!"));
      console.log(
        chalk.cyanBright(
          "👩‍💻  Happy hacking! Issues? Questions? https://github.com/PlayPickup/expugrea/issues  👨‍💻"
        )
      );
      console.log(`⚡️  To get started, type cd ${project.toString()}`);
      return;
    }
    console.log(errorMessage);
    return console.log("Child process exited with code " + code.toString());
  });
};

(async () => {
  await createDirectory();
  await setupProjectFiles();
  await installProject();
})();
