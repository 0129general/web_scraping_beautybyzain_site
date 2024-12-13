const puppeteer = require('puppeteer');
const actionSequences = require('./actionSequence');

const {executeSequence} = require('./execute');

(async () => {
    const browser = await puppeteer.launch({ headless: false, slowMo: 100 });
    const page = await browser.newPage();
    await page.goto('https://www.wowvegas.com/');

    const actionSequence = actionSequences.WowVegas;
    const delay = Math.random() * 2 * 1000;
    await new Promise((resolve) =>
        setTimeout(resolve, action.duration || 1000 + delay)
    );
    executeSequence(page, actionSequence, 0);
})();