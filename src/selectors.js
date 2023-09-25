async function getInputElementByLabel(aPage, aText) {
  const labels = await aPage.$$("label");
  for (const label of labels) {
    const labelText = await (await label.getProperty("innerText")).jsonValue();
    if (labelText == aText) {
      const inputId = await aPage.evaluate(
        (el) => el.getAttribute("for"),
        label
      );
      return aPage.$("#" + inputId);
    }
  }
}

async function getElementByInnerText(aPage, aSelector, aText, aContain) {
  const elements = await aPage.$$(aSelector);
  for (const element of elements) {
    const text = await (await element.getProperty("innerText")).jsonValue();
    if (aContain && text.indexOf(aText) > -1) return element;
    if (!aContain && text === aText) return element;
  }
}

async function getFileInputByFileType(aPage, aFileType) {
  const inputs = await aPage.$$("input[type=file]");
  for (const input of inputs) {
    const acceptAtr = await aPage.evaluate(
      (el) => el.getAttribute("accept"),
      input
    );
    if (acceptAtr === aFileType) {
      return input;
    }
  }
}

async function waitForElement(aPage, aSelector, aTimeout, aErrorMessage) {
  try {
    await aPage.waitForSelector(aSelector, aTimeout);
  } catch (e) {
    throw new Error(aErrorMessage);
  }
}

async function getUploadProgress(aPage) {
  const element = await aPage.$("div.mod-file div.list-progress > div");
  return Number(
    await aPage.evaluate((el) => el.getAttribute("aria-valuenow"), element)
  );
}

async function checkNavBarUserData(aPage, aTimeout, aThrow, aErrorMessage) {
  try {
    await aPage.waitForSelector("div.user-avatar", aTimeout);
    return true;
  } catch (e) {
    if (aThrow) throw new Error(aErrorMessage);
    return false;
  }
}

module.exports = {
  getInputElementByLabel,
  getElementByInnerText,
  getFileInputByFileType,
  waitForElement,
  getUploadProgress,
  checkNavBarUserData,
};
