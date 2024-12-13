import puppeteer from "puppeteer";
import xlsx from "xlsx";
import express from "express";
import path from "path";

const app = express();
const PORT = 3000;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

let basic_url = "";

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/start-scraping", async (req, res) => {
  basic_url = req.body.basePath;

  if (!basic_url) {
    return res.status(400).send("Base path is required.");
  }

  try {
    const results = await getLinks(); // Fetch the scraped data
    saveToExcel(results, "products.xlsx"); // Save to Excel file
    res.json(results); // Send the results as a JSON response
  } catch (error) {
    console.error("Error during scraping:", error);
    res.status(500).send("Error during scraping.");
  }
});

const getLinks = async () => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      defaultViewport: null,
    });

    const page = await browser.newPage();

    await page.goto(`${basic_url}/collections/shop-products/`, {
      waitUntil: "domcontentloaded",
    });

    const links = await page.evaluate(() => {
      const productList = document.querySelectorAll("#product-grid li");
      return Array.from(productList)
        .map((product) => {
          const anchor = product.querySelector("a");
          return anchor ? anchor.getAttribute("href") : null;
        })
        .filter((href) => href !== null);
    });

    console.log("Links found:", links);

    const results = [];

    for (let index = 0; index < links.length; index++) {
      const fullUrl = basic_url + links[index];
      const productData = await getProduct(fullUrl, page);

      if (productData) {
        results.push({
          Serial: index + 1,
          Title: productData.title,
          Price: productData.price,
          Descriptions: productData.descriptions.join(" \n"),
        });
      }
    }

    await browser.close();
    return results; // Return the results to be used in the response
  } catch (error) {
    console.error("Error in getLinks:", error);
    throw error; // Propagate the error to handle it in the endpoint
  }
};

const getProduct = async (link, page) => {
  try {
    await page.goto(link, {
      waitUntil: "domcontentloaded",
    });

    return await page.evaluate(() => {
      const titleElement = document.querySelector(".product__title > h1");
      const priceElement = document.querySelector(".price__regular > .price-item--regular");
      const descriptionElements = document.querySelectorAll(".product__description.rte.quick-add-hidden p");

      const title = titleElement ? titleElement.textContent.trim() : null;
      const price = priceElement ? priceElement.textContent.trim() : null;
      const descriptions = Array.from(descriptionElements).map((desc) => desc.textContent.trim());

      return { title, price, descriptions };
    });
  } catch (error) {
    console.error(`Error in getProduct for ${link}:`, error);
    return null;
  }
};

const saveToExcel = (data, filename) => {
  try {
    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Products");
    xlsx.writeFile(workbook, filename);
    console.log(`Data successfully saved to ${filename}`);
  } catch (error) {
    console.error("Error saving to Excel:", error);
  }
};

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
