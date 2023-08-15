// @ts-check
const { chromium } = require("playwright");
const fs = require("fs");
const { expect } = require("@playwright/test");

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  // Navigate to a website
  await page.goto(
    "https://www.amazon.com/kindle-dbs/browse/ref=dbs_b_def_rwt_brws_ts_recs_l?metadata=cardAppType%3ADESKTOP%24deviceTypeID%3AA2Y8LFC259B97P%24clientRequestId%3ANDDBBHYJ9NMM7QVAV33V%24deviceAppType%3ADESKTOP%24ipAddress%3A10.161.94.173%24browseNodes%3A154606011%24userAgent%3AMozilla%2F5.0+%28Macintosh%3B+Intel+Mac+OS+X+10_15_7%29+AppleWebKit%2F537.36+%28KHTML%2C+like+Gecko%29+Chrome%2F115.0.0.0+Safari%2F537.36%24cardSurfaceType%3Adesktop%24cardMobileOS%3AUnknown%24deviceSurfaceType%3Adesktop&storeType=ebooks&widgetId=unified-ebooks-storefront-default_TopSellersStrategy&sourceAsin=&content-id=amzn1.sym.bb33addf-488a-4e99-909f-3acc87146400&refTagFromService=ts&title=Best+sellers+&pf_rd_p=bb33addf-488a-4e99-909f-3acc87146400&sourceType=recs&pf_rd_r=NDDBBHYJ9NMM7QVAV33V&pd_rd_wg=fTnVw&ref_=dbs_f_def_rwt_wigo_ts_recs_wigo&SkipDeviceExclusion=true&page=1&pd_rd_w=X9dU1&nodeId=154606011&pd_rd_r=16116a10-e5db-44c9-8bdf-cfcd274be0aa&view=LIST",
  );
  await page.screenshot({ path: "screenshot.png" });

  // Expect a title "to contain" a substring.

  const cardsEl = await page.$$eval(
    "#browse-views-area .browse-clickable-item",
    (cardsEl) => {
      const books = [];
      cardsEl.forEach((cardEl) => {
        const title = cardEl
          .querySelector(".a-list-item.a-size-base.a-color-base.a-text-bold")
          .innerText.replace(",", "-");
        const authorName = cardEl.querySelector(
          ".browse-text-line.browse-defined-width.browse-smaller-text-one-line",
        ).innerText;
        const imageUrl = cardEl.querySelector("img.browse-list-view-img").src;

        const price = (
          cardEl.querySelector(".a-color-price")?.innerText ?? "$10.99"
        )
          .split("$")[1]
          .trim();
        const ratingDetails = cardEl.querySelector(".dbs-icon-alt").innerText;
        const reviewCount = ratingDetails
          .split(", ")[1]
          .replace("ratings", "")
          .trim();

        const reviewStar = ratingDetails.split(", ")[0].split(" out")[0];

        books.push({
          title,
          authorName,
          imageUrl,
          price: +price,
          reviewCount: +reviewCount,
          reviewStar: +reviewStar,
        });
      });
      return books;
    },
  );

  console.log(cardsEl);

  fs.writeFile(
    "books.csv",
    [
      "title,author,cover,price,reviewsStar,reviewsCount\n",
      ...cardsEl.map((book) => {
        return `${book.title},${book.authorName},${book.imageUrl},${book.price},${book.reviewStar},${book.reviewCount}\n`;
      }),
    ].join(""),
    function (err) {
      if (err) throw err;
      console.log("Saved!");
    },
  );

  // fs.writeFile("books.json", JSON.stringify(cardsEl), function (err) {
  //   if (err) throw err;
  //   console.log("Saved!");
  // });

  // ...
  await browser.close();
})();
