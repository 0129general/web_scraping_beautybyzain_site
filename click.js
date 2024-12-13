const puppeteer = require('puppeteer');
async function replaceTextContentsIfEmail(accountId, textContents) {
	if (textContents === "UserKeys") {
		// Fetch the UserKeys value from Chrome storage
		console.log(
			`Replacing textContents with UserKeys for account ${accountId}`
		);
		console.log("textContents", textContents);
		const keys = await getStorageData([`UserKeys_${accountId}`]);
		const userKey = keys[`UserKeys_${accountId}`];
		console.log("userKey", userKey);
		if (userKey) {
			return userKey;
		} else {
			console.error(`No UserKeys found for account ${accountId}`);
			return null;
		}
	}

	// Return the original textContents if it's not "email"
	return textContents;
}

async function performClick(options, page) {
	const {
		accountId, // Add accountId to the options
		element,
		textContents,
		attribute,
		selectorText,
		parentElement,
		parentAttribute,
		parentSelectorText,
	} = options;

	// Check if textContents should be replaced with the UserKeys value
	const finalTextContents = await replaceTextContentsIfEmail(accountId, textContents);

	// Simulate human-like click using Puppeteer
	async function simulateHumanClick(element) {
		const boundingBox = await element.boundingBox();
		const x = boundingBox.x + boundingBox.width / 2;
		const y = boundingBox.y + boundingBox.height / 2;

		await page.mouse.move(x, y);
		await page.mouse.down();
		await page.mouse.up();
		await page.mouse.click(x, y);
	}

	async function clickElements(elements) {
//		for (const el of elements) {
			await simulateHumanClick(elements[0]);
//		}
	}

	async function findElementsWithParent(parentSelector, childSelector) {
		const parents = await page.$$(parentSelector);
		for (const parentEl of parents) {
			const childElements = await parentEl.$$(childSelector);
	
			const filteredElements = await filterElementsByTextContent(childElements);
			if (filteredElements.length > 0) {
				await clickElements(filteredElements);
				break;
			}
		}
	}

	async function filterElementsByTextContent(elements) {
		if (finalTextContents) {
			const filtered = [];
			for (const el of elements) {
				const textContent = await el.evaluate(el => el.textContent.trim().toLowerCase());
				if (textContent.includes(finalTextContents.trim().toLowerCase())) {
					filtered.push(el);
				}
			}
			return filtered;
		}
		return elements;
	}

	function buildSelector() {
		if (element && attribute && selectorText) {
			return `${element}[${attribute}*="${selectorText}"]`;
		} else if (element && attribute) {
			return `${element}[${attribute}]`;
		} else if (element) {
			return element;
		}
		return "*"; // Default to selecting all elements if no specific element type is provided
	}

	const childSelector = buildSelector();

	if (parentElement && parentAttribute && parentSelectorText) {
		const parentSelector = `${parentElement}[${parentAttribute}*="${parentSelectorText}"]`;
		await findElementsWithParent(parentSelector, childSelector);
		console.log(parentSelector, childSelector);
	} else {
		console.log(childSelector);
		const elements = await page.$$(childSelector);
		const filteredElements = await filterElementsByTextContent(elements);
			
		if (filteredElements.length > 0) {
			await clickElements(filteredElements);
		}
	}
}

module.exports = {
	performClick,
}
