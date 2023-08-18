const fs = require("fs");

const categories = [
  "biography",
  "business",
  "tech",
  "health",
  "politics",
  "romance",
  "science fiction",
  "sports",
];

const slugify = (str) => {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};
// generate csv file with the following columns based on categories (name, slug)
const csv = categories
  .map((category) => {
    return `${category},${slugify(category)}`;
  })
  .join("\n");

fs.writeFileSync("categories.csv", csv);
