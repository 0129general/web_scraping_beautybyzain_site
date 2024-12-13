function simulateTypingElement(element, text) {
    return new Promise((resolve, reject) => {
        if (!element) {
            return reject(new Error("Element not found"));
        }

        element.value = ""; // Clear the input field

        let index = 0;

        const typeCharacter = () => {
            if (index < text.length) {
                const char = text[index];

                // Dispatch keydown event
                element.dispatchEvent(
                    new KeyboardEvent("keydown", {
                        key: char,
                        code: `Key${char.toUpperCase()}`,
                        bubbles: true,
                    })
                );

                // Update the input field's value
                element.value += char;

                // Dispatch input event
                element.dispatchEvent(new Event("input", { bubbles: true }));

                // Dispatch keyup event
                element.dispatchEvent(
                    new KeyboardEvent("keyup", {
                        key: char,
                        code: `Key${char.toUpperCase()}`,
                        bubbles: true,
                    })
                );

                index++;
                setTimeout(typeCharacter, Math.random() * 100 + 40); // Mimic human typing speed
            } else {
                resolve(`Typing completed for element: ${element}`);
            }
        };

        typeCharacter();
    });
}


async function simulateTyping(selector, text) {
    const elements = document.querySelectorAll(selector);
    if (elements.length === 0) {
        throw new Error(`Elements not found for selector: ${selector}`);
    }

    for (const element of elements) {
        await simulateTypingElement(element, text);
    }

    return `Typing completed for selector: ${selector}`;
}

// Handles typing user and password credentials into input fields
async function inputCredentials(
    userSelector,
    userText,
    passSelector,
    passText
) {
    try {
        console.log(await simulateTyping(userSelector, userText));
    } catch (error) {
        //console.error(`Error typing user credentials: ${error.message}`);
    }

    try {
        console.log(await simulateTyping(passSelector, passText));
    } catch (error) {
        //console.error(`Error typing password credentials: ${error.message}`);
    }
}