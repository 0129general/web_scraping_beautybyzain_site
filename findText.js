async function performFindText(options) {
	const {
		element,
		attribute,
		selectorText,
		textContents,
		slug,
		parentElement,
		parentAttribute,
		parentSelectorText,
	} = options;
	let texts = [];

	function extractTexts(elements) {
		elements.forEach((el) => {
			const text = el.textContent.trim();
			if (
				textContents
					? text.toLowerCase().includes(textContents.toLowerCase())
					: true
			) {
				texts.push(text);
			}
		});
	}

	function findElementsWithParent(parentSelector, childSelector) {
		document.querySelectorAll(parentSelector).forEach((parentEl) => {
			extractTexts(parentEl.querySelectorAll(childSelector));
		});
	}

	if (parentElement && parentAttribute && parentSelectorText) {
		findElementsWithParent(
			`${parentElement}[${parentAttribute}*="${parentSelectorText}"]`,
			element || "*"
		);
	} else if (element && attribute && selectorText) {
		extractTexts(
			document.querySelectorAll(`${element}[${attribute}*="${selectorText}"]`)
		);
	} else if (element) {
		extractTexts(document.querySelectorAll(element));
	}

	console.log(`Texts found for ${slug}:`, texts);
	const finalSum = universalFilter(texts, slug);
	compareAndUpdateValue(finalSum, slug);
	return finalSum;
}

// Filters and finds the smallest non-zero number from the text content
function universalFilter(texts, slug) {
	const divideBy100Slugs = ["FC", "Scrooge"];
	let smallestNumber = Infinity;

	texts.forEach((text) => {
		const cleanedText = text.replace(/,/g, "");
		const numberMatch = cleanedText.match(/\d+(\.\d+)?/);

		if (numberMatch) {
			let number = parseFloat(numberMatch[0]);

			if (divideBy100Slugs.includes(slug)) {
				number /= 100;
			}

			if (number !== 0 && number < smallestNumber) {
				smallestNumber = number;
			}
		}
	});

	if (smallestNumber === Infinity) {
		console.log("No valid non-zero numbers found.");
		return null;
	} else {
		smallestNumber = parseFloat(smallestNumber.toPrecision(5));
		console.log(`Smallest non-zero number found: ${smallestNumber}`);
		return smallestNumber;
	}
}

module.exports = {
	performFindText,
}