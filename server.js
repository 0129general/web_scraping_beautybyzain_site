import puppeteer from "puppeteer";

const getQuotes = async () => {
  // Launch Puppeteer with a visible browser for debugging
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  // Open a new page
  const page = await browser.newPage();

  // Navigate to the target website and wait for the page to fully load
  await page.goto("https://lilyandelarose.com/", {
    waitUntil: "load", // Ensures the page and resources like images are fully loaded
  });

  // Wait for 15 seconds to allow all content to load
  await page.waitForTimeout(15000);

  // Ensure the specific element is available (flt-canvas)
//   try {
//     await page.waitForSelector("flt-canvas", { timeout: 20000 });
//   } catch (error) {
//     console.error("The target element was not found within the timeout period.");
//     await browser.close();
//     return;
//   }

  // Extract data from the page
  const data = await page.evaluate(() => {
    // Select the flt-canvas element
    const canvas = document.querySelector("flt-canvas");
    if (!canvas) return null; // Return null if the element is not found

    // Extract image URL
    const imgElement = canvas.querySelector("img");
    const imageUrl = imgElement ? imgElement.src : null;

    // Extract product name
    const nameElement = canvas.querySelector('p span');
    const productName = nameElement ? nameElement.innerText : null;

    // Extract product price
    const priceElement = canvas.querySelector(
      'p[style*="text-align: center"] span'
    );
    const productPrice = priceElement ? priceElement.innerText : null;

    return {
      imageUrl,
      productName,
      productPrice,
    };
  });

  // Display the extracted data
  console.log(data);

  // Close the browser after scraping
//   await browser.close();
};

// Start the scraping
getQuotes();
