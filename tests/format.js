const fs = require("fs");

// Read the file and parse the JSON to an object
const bookList = JSON.parse(fs.readFileSync("category-sports.json"));

// Loop through the bookList and log the title of each book
function removeSpecialChars(str) {
  return str
    .replace(/(?!\w|\s)./g, "")
    .replace(/\s+/g, " ")
    .replace(/^(\s*)([\W\w]*)(\b\s*$)/g, "$2");
}
const formattedBooks = bookList.map((book) => {
  const detailObject = book.details.split("\n").reduce((acc, curr) => {
    const [key, value] = curr.split(":");
    const keyTrimmed = removeSpecialChars(key.trim().replace(/\s/g, ""));
    const valueTrimmed = removeSpecialChars(value.trim());
    acc[keyTrimmed] = valueTrimmed;
    return acc;
  }, {});
  // parse to timestamp
  const formattedDate = new Date(
    detailObject?.PublicationDate ?? "January 1, 2020",
  );

  return {
    isbn:
      detailObject?.ASIN ?? Date.now().toString(32).toUpperCase().slice(0, 8),
    title: book.title,
    pages: +book.numberOfPages ?? 100,
    cover: book.cover ?? "",
    synopsis: removeSpecialChars(book.synopsis),
    publishDate: formattedDate,
    publisher:
      detailObject.Publisher?.split(" ")?.slice(0, -3)?.join(" ") ??
      "Unknown Publisher",
    // set a price key to get a random value from these values 10.90, 12.40, 15.10, 8.90, 6.10, 14.10, 9.90, 11.10, 13.10, 7.10
    price: [10.9, 12.4, 15.1, 8.9, 6.1, 14.1, 9.9, 11.1, 13.1, 7.1][
      Math.floor(Math.random() * 10)
    ],
    author: book.author ?? "Unknown Author",
    language: detailObject?.Language ?? "English",
    rating: +book.ratingStarts?.split(" ")?.[0] ?? 3,
    totalReviews: +book.ratingCount.split(" ")[0].replace(/,/g, "") ?? 0,
    categorySlug: "sports",
  };
});

// write in a csv
const csv = formattedBooks
  .reduce((acc, curr) => {
    const row = Object.values(curr).join("|");
    acc += row + "\n";
    return acc;
  }, "")
  .trim();

fs.writeFileSync(
  `csv/category-sports-formatted.csv`,
  "isbn|title|pages|cover|synopsis|publishDate|publisher|price|author|language|rating|totalReviews|categorySlug" +
    "\n" +
    csv,
);
