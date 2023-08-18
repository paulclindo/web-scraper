const { chromium } = require("playwright");
const fs = require("fs");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const biography =
    "https://www.amazon.com/Best-Sellers-Kindle-Store-Biographies-Memoirs/zgbs/digital-text/154754011/ref=zg_bs_nav_digital-text_2_154606011";
  const business =
    "https://www.amazon.com/Best-Sellers-Kindle-Store-Business-Investing/zgbs/digital-text/154821011/ref=zg_bs_nav_digital-text_2_154606011";

  const tech =
    "https://www.amazon.com/Best-Sellers-Kindle-Store-Computers-Technology/zgbs/digital-text/156116011/ref=zg_bs_nav_digital-text_2_154606011";
  const health =
    "https://www.amazon.com/Best-Sellers-Kindle-Store-Health-Fitness-Dieting/zgbs/digital-text/156430011/ref=zg_bs_nav_digital-text_2_154606011";
  const politics =
    "https://www.amazon.com/Best-Sellers-Kindle-Store-Politics-Social-Sciences/zgbs/digital-text/305951011/ref=zg_bs_nav_digital-text_2_154606011";

  const romance =
    "https://www.amazon.com/Best-Sellers-Kindle-Store-Romance/zgbs/digital-text/158566011/ref=zg_bs_nav_digital-text_2_154606011";
  const scienceFiction =
    "https://www.amazon.com/Best-Sellers-Kindle-Store-Science-Fiction-Fantasy/zgbs/digital-text/668010011/ref=zg_bs_nav_digital-text_2_154606011";
  // Navigate to the Amazon Kindle Best Sellers page
  const sports =
    "https://www.amazon.com/Best-Sellers-Kindle-Store-Sports-Outdoors/zgbs/digital-text/159818011/ref=zg_bs_nav_digital-text_2_154606011";
  await page.goto(sports);

  // Wait for the list of books to load
  await page.waitForSelector("#zg");

  // Extract book URLs
  const bookLinks = await page.$$eval(
    '.zg-grid-general-faceout a.a-link-normal[tabindex="-1"]',
    (links) => links.map((link) => link.href),
  );

  // // console.log(bookLinks);
  //
  // const bookLinksMock = [
  //   "https://www.amazon.com/Never-Lie-addictive-psychological-thriller-ebook/dp/B0BBL2ZW73/ref=zg_bs_g_154606011_sccl_1/134-5012872-9947438?psc=1',",
  // ];

  const bookList = [];

  // only first 14 books from bookLinks
  const bookListForm = bookLinks.slice(0, 14);

  // Loop through book URLs
  for (const bookLink of bookListForm) {
    const bookPage = await browser.newPage();
    await bookPage.goto(bookLink);

    // Extract book title
    const cover = await bookPage
      .$eval("#ebooksImgBlkFront", (el) => el.getAttribute("src"))
      .catch(() => "");

    const title = await bookPage
      .$eval("#productTitle", (el) => el.innerText.trim())
      .catch(() => "unknown");
    const author = await bookPage
      .$eval(".author a.a-link-normal", (el) => el.innerText.trim())
      .catch(() => "unknown");
    const ratingCount = await bookPage
      .$eval("#acrCustomerReviewText", (el) => el.innerText.trim())
      .catch(() => "0");
    const ratingStarts = await bookPage
      .$eval(".reviewCountTextLinkedHistogram", (el) =>
        el.getAttribute("title"),
      )
      .catch(() => "3 out of 5 stars");

    const synopsis = await bookPage
      .$eval("#bookDescription_feature_div .a-expander-content", (el) =>
        el.innerText.trim(),
      )
      .catch(() => "No synopsis");

    const numberOfPages = await bookPage
      .$eval(
        "#rpi-attribute-book_details-ebook_pages .rpi-attribute-value",
        (el) => el.innerText.replace(" pages", "").trim(),
      )
      .catch(() => "250");

    // const publisher =
    //   (await bookPage.$eval(
    //     "#rpi-attribute-book_details-publisher .rpi-attribute-value",
    //     (el) => el.innerText.trim(),
    //   )) ?? "unknown";
    //
    // const publicationDate =
    //   (await bookPage.$eval(
    //     "#rpi-attribute-book_details-publication_date .rpi-attribute-value",
    //     (el) => el.innerText.trim(),
    //   )) ?? "July 2, 1990";

    // const price = await bookPage.$eval(".a-button-inner .slot-price", (el) =>
    //   el.innerText.trim(),
    // );

    const details = await bookPage
      .$eval("#detailBullets_feature_div ul", (details) =>
        details.innerText.trim(),
      )
      .catch(() => "No details");

    console.log(`Title: ${title}`);

    // Extract reviews
    const reviews = await bookPage
      .$$eval('#customerReviews [id^="customer_review-"]', (reviewEls) =>
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
      )
      .catch(() => []);

    bookList.push({
      title,
      cover,
      author,
      ratingCount,
      ratingStarts,
      synopsis,
      numberOfPages,
      reviews,
      // publisher,
      // publicationDate,
      // price,
      details,
    });

    // Close the book page
    await bookPage.close();
  }

  const json = JSON.stringify(bookList, null, 2);
  fs.writeFileSync(`category-sports.json`, json);
  console.log("done!");

  // Close the browser
  await browser.close();
})();
