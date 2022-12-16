require("dotenv").config();
const core = require("@actions/core");
const fs = require("fs");

class Options {
  username;
  password;
  cookies;
  id;
  file;
  timeout;
  test;
  localDev;

  constructor() {
    this.localDev = process.env.local_dev === "true";

    if (this.localDev) {
      this.username = process.env.login_username;
      this.password = process.env.login_password;
      this.cookies = process.env.cookies;
      this.id = process.env.mod_id;
      this.file = process.env.mod_file;
      this.filename = process.env.mod_filename;
      this.timeout = Number(process.env.timeout);
      this.test = process.env.test === "true";
    }

    if (!this.localDev) {
      this.username = core.getInput("username");
      this.password = core.getInput("password");
      this.cookies = core.getInput("cookies");
      this.id = core.getInput("id", { required: true });
      this.file = core.getInput("file", { required: true });
      this.filename = core.getInput("filename");
      this.timeout = Number(core.getInput("timeout"));
      this.test = core.getBooleanInput("test");
    }

    if (!(this.cookies || (this.username && this.password)))
      throw new Error(
        "Username/Password or cookies, you have to choose at least one method to authenticate."
      );

    if (this.cookies && this.username && this.password)
      console.log(
        "Username/Password and cookies are both provided, will use cookies first."
      );

    if (this.file && !fs.existsSync(this.file))
      throw new Error(`Mod file ${this.file} does not exist.`);

    if (isNaN(this.timeout))
      throw new Error(`Timeout: ${this.timeout} is not a number.`);
  }
}

module.exports = Options;
