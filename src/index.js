const core = require("@actions/core");
const Puppeteer = require("puppeteer");
const { BrowserFetcher } = require("puppeteer");
const fs = require("fs");
const Options = require("./options");
const Selectors = require("./selectors");

const LoginURL = "https://mod.3dmgame.com/login?redirect=/";
const ModEditBaseURL = "https://mod.3dmgame.com/Workshop/PublishMod/";

const options = new Options();
const actionSettings = {
  chromiumRevision: "1069273",
  executePath: "./.action_3dm_large_file/chromium/",
};

const puppeteerLaunchOptions = {
  headless: !options.localDev,
  args: ["--lang=zh"],
};

async function main() {
  try {
    if (options.test) console.log("Running in test mode.");
    console.log("Mod id: " + options.id);
    console.log("Mod file path: " + options.file);

    if (!options.localDev) {
      fs.mkdirSync(actionSettings.executePath, { recursive: true });
      console.log("Downloading chromium.");
      const browserFetcher = new BrowserFetcher({
        path: actionSettings.executePath,
      });
      const revisionInfo = await browserFetcher.download(
        actionSettings.chromiumRevision
      );
      puppeteerLaunchOptions.executablePath = revisionInfo.executablePath;
      console.log("Download finished.");
    }

    var browser = await Puppeteer.launch(puppeteerLaunchOptions);
    let page = await browser.newPage();

    // Use cookie
    let usePasswd = !options.cookies;
    const bothLoginExist =
      options.cookies && options.username && options.password;

    if (!usePasswd) {
      console.log("Attempting to login with cookies.");
      await page.setCookie(...JSON.parse(options.cookies));
      await page.goto("https://mod.3dmgame.com");
      // check login
      if (
        await Selectors.checkNavBarUserData(
          page,
          options.timeout,
          !bothLoginExist,
          "Login Failed. Maximum timeout reached."
        )
      )
        console.log("Login Successful.");
      else {
        console.log("Login with cookies failed. Use password instead.");
        usePasswd = true;
      }
    }

    // set language with cookie
    await page.setCookie(
      ...[
        {
          name: "language",
          value: "zh-cn",
          domain: "mod.3dmgame.com",
        },
      ]
    );
    console.log("Set language to zh-cn.");

    // login with password
    if (usePasswd) {
      await page.goto(LoginURL);
      console.log("Using password to authenticate.");
      await Selectors.waitForElement(
        page,
        "input[type=password]",
        options.timeout,
        "Maximum timeout reached when loading the login page."
      );

      console.log("Entering credentials.");
      let usernameInput = await Selectors.getInputElementByLabel(
        page,
        "手机号码 / 3DM账号"
      );
      await usernameInput.type(options.username);
      await page.type("input[type=password]", options.password);
      const loginBtn = await Selectors.getElementByInnerText(
        page,
        "button > span",
        "登录",
        true
      );

      console.log("Attempting to login.");
      await loginBtn.click();

      // check login
      await Selectors.checkNavBarUserData(
        page,
        options.timeout,
        true,
        "Login Failed. Maximum timeout reached."
      );
      console.log("Login Successful.");
    }

    // open mod editing page
    console.log(`Redirecting to the mod editing page, mod id: ${options.id}.`);
    await page.goto(ModEditBaseURL + options.id);

    await Selectors.waitForElement(
      page,
      "input[type=file]",
      options.timeout,
      "Maximum timeout reached while loading the mod editing page."
    );
    console.log("Mod page loaded.");

    console.log("Preparing to upload mod file.");

    const fileUploadInput = await Selectors.getFileInputByFileType(
      page,
      ".zip,.rar,.7z"
    );

    await fileUploadInput.uploadFile(options.file);

    await Selectors.waitForElement(
      page,
      "div.mod-file div.upload-file div.list-progress",
      options.timeout,
      "Maximum timeout reached while wait for file to start uploading."
    );

    console.log("Upload started.");

    // Print upload progress
    let uploadProgress = 0;
    let lastTimeProgressChanged = Date.now();
    while (uploadProgress < 100) {
      const progressLastFrame = uploadProgress;
      uploadProgress = await Selectors.getUploadProgress(page);
      if (progressLastFrame != uploadProgress) {
        lastTimeProgressChanged = Date.now();
        console.log(`Upload progress: ${Math.round(uploadProgress)}%`);
      }
      if (Date.now() - lastTimeProgressChanged > options.timeout) {
        throw new Error(
          "Maximum timeout reached when waiting for the upload progress to move."
        );
      }
    }

    // Check if upload is finished using the file name field. the field will be auto filled when upload finished.
    {
      const fileNameInput = await Selectors.getInputElementByLabel(
        page,
        "资源名称 (玩家下载压缩包时的文件名)"
      );
      const fileNameOrignal = await page.evaluate(
        (x) => x.value,
        fileNameInput
      );

      const lastTimeChecked = Date.now();
      while (true) {
        const fileName = await page.evaluate((x) => x.value, fileNameInput);
        if (fileName !== fileNameOrignal) break;
        if (Date.now() - lastTimeChecked > options.timeout)
          throw new Error(
            "Maximum timeout reached when waiting for the upload to finish."
          );
      }
      console.log("Upload complete.");

      // change fileNameInput if filename is set
      if (options.filename) {
        await page.evaluate(
          (element, options) => {
            element.value = options.filename;
          },
          fileNameInput,
          options
        );
        console.log("Changed file name to: " + options.filename);
      }
    }
    // Click the save button to save the changes.
    console.log("Saving changes.");

    const saveBtn = await Selectors.getElementByInnerText(
      page,
      "button > span",
      "更新 MOD"
    );
    if (saveBtn === undefined) throw new Error("Can't find save button.");

    if (!options.test) {
      await saveBtn.click();

      // Need to check if saved
      await Selectors.checkNavBarUserData(
        page,
        options.timeout,
        true,
        "Maximum timeout reached while saving."
      );
    }

    console.log("Mod saved.");

    if (!options.localDev) await browser.close();
  } catch (error) {
    core.setFailed(error.message);
    await browser.close();
  }
}

main();
