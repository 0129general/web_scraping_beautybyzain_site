import puppeteer from "puppeteer";

const basic_url = "https://www.beautybyzain.co";

const getLinks = async () => {
  try {
    // Start a Puppeteer session
    const browser = await puppeteer.launch({
      headless: true,
      defaultViewport: null,
    });

    // Open a new page
    const page = await browser.newPage();

    // Navigate to the target URL and wait for the DOM content to load
    await page.goto("https://www.beautybyzain.co/collections/shop-products/", {
      waitUntil: "domcontentloaded",
    });

    // Extract links from the page
    const links = await page.evaluate(() => {
      // Find the product grid and its list items
      const productList = document.querySelectorAll("#product-grid li");
      
      // Map over the product items and extract the href attribute from anchor tags
      return Array.from(productList).map((product) => {
        const anchor = product.querySelector("a");
        return anchor ? anchor.getAttribute("href") : null;
      }).filter((href) => href !== null); // Filter out null values
    });

    console.log("Links found:", links);

    // Process each link
    for (let index = 0; index < links.length; index++) {
      const fullUrl = basic_url + links[index];
      await getProduct(fullUrl, page); // Ensure await for asynchronous function
    }

    // Close the browser
    await browser.close();

    return links;
  } catch (error) {
    console.error("Error in getLinks:", error);
  }
};

const getProduct = async (link, page) => {
  try {
    // Navigate to the product link and wait for the DOM content to load
    await page.goto(link, {
      waitUntil: "domcontentloaded",
    });

    // Extract product data from the page
    const productData = await page.evaluate(() => {
      const titleElement = document.querySelector(".product__title > h1");
      const priceElement = document.querySelector(".price__regular > .price-item--regular");
      const descriptionElements = document.querySelectorAll(".product__description.rte.quick-add-hidden p");

      const title = titleElement ? titleElement.textContent.trim() : null;
      const price = priceElement ? priceElement.textContent.trim() : null;
      const descriptions = Array.from(descriptionElements).map((desc) => desc.textContent.trim());

      return { title, price, descriptions };
    });

    if (productData.title) {
      console.log(`Product Title: ${productData.title}`);
      console.log(`Product Price: ${productData.price}`);
      console.log(`Product Descriptions:`, productData.descriptions);
    } else {
      console.log(`No product title found for ${link}`);
    }
  } catch (error) {
    console.error(`Error in getProduct for ${link}:`, error);
  }
};

// Start the scraping
getLinks();
