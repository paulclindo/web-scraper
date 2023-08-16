const { chromium } = require("playwright");
const fs = require("fs");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Navigate to the Amazon Kindle Best Sellers page
  await page.goto(
    "https://www.amazon.com/Best-Sellers-Kindle-Store-Biographies-Memoirs/zgbs/digital-text/154754011/ref=zg_bs_nav_digital-text_2_154606011",
  );

  // Wait for the list of books to load
  await page.waitForSelector("#zg");

  // Extract book URLs
  const bookLinks = await page.$$eval(
    '.zg-grid-general-faceout a.a-link-normal[tabindex="-1"]',
    (links) => links.map((link) => link.href),
  );

  // // console.log(bookLinks);
  //
  const bookLinksMock = [
    "https://www.amazon.com/Never-Lie-addictive-psychological-thriller-ebook/dp/B0BBL2ZW73/ref=zg_bs_g_154606011_sccl_1/134-5012872-9947438?psc=1',",
  ];

  const bookList = [];
  // Loop through book URLs
  for (const bookLink of bookLinksMock) {
    const bookPage = await browser.newPage();
    await bookPage.goto(bookLink);

    // Extract book title
    const title = await bookPage.$eval("#productTitle", (el) =>
      el.textContent.trim(),
    );
    const author = await bookPage.$eval(".author a.a-link-normal", (el) =>
      el.textContent.trim(),
    );
    const ratingCount = await bookPage.$eval("#acrCustomerReviewText", (el) =>
      el.textContent.trim(),
    );
    const ratingStarts = await bookPage.$eval(
      ".reviewCountTextLinkedHistogram",
      (el) => el.getAttribute("title"),
    );

    const synopsis =
      (await bookPage.$eval(
        "#bookDescription_feature_div .a-expander-content",
        (el) => el.textContent.trim(),
      )) ?? "This book has no synopsis";

    const numberOfPages = await bookPage.$eval(
      "#rpi-attribute-book_details-ebook_pages .rpi-attribute-value",
      (el) => el.textContent.replace(" pages", "").trim(),
    );

    console.log(`Title: ${title}`);

    // Extract reviews
    const reviews = await bookPage.$$eval(
      '#customerReviews [id^="customer_review-"]',
      (reviewEls) =>
        reviewEls.map((el) => {
          const userName = el.querySelector(
            ".a-profile-content span",
          ).innerText;
          const avatar = el.querySelector("[data-src]").getAttribute("src");
          const comment = el.querySelector(
            ".review-text-content span",
          ).innerText;
          const stars = el
            .querySelector(".review-rating")
            .innerText.split(" out of 5 stars")[0];

          return {
            userName,
            avatar,
            comment,
            stars,
          };
        }),
    );

    bookList.push({
      title,
      author,
      ratingCount,
      ratingStarts,
      synopsis,
      numberOfPages,
      reviews,
    });

    // Close the book page
    await bookPage.close();
  }

  const json = JSON.stringify(bookList, null, 2);
  fs.writeFileSync("data.json", json);
  console.log("done!");

  // Close the browser
  await browser.close();
})();
