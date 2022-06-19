import jsdom from "jsdom";
import fs from "fs";
import fetch from "node-fetch";

const buildFetcher = async (index) => {
  return new Promise(async (resolve, _) => {
    const res = await fetch(
      `https://www.flaticon.com/search/${index}?word=animal&color=color&order_by=4`
    );
    const html = await res.text();
    // Parse html as DOM so that we can query on it.
    const dom = new jsdom.JSDOM(html);
    const iconImgs = dom.window.document.querySelectorAll(
      "a.link-icon-detail > img"
    );
    const imageUrls = [];
    let amtPremiums = 0; // count amount of premium icons for statistical purposes
    for (let i of iconImgs) {
      const imgUrl = i.getAttribute("data-src");
      if (imgUrl.includes("premium")) {
        amtPremiums++;
        continue;
      }
      imageUrls.push(imgUrl.replace("/128/", "/512/"));
    }
    resolve([imageUrls, amtPremiums]);
  });
};

(async () => {
  const imageUrls = [];
  let premiumsTotal = 0;
  let urlsTotal = 0;
  for (let queryBlockStart = 48; queryBlockStart < 940; queryBlockStart += 50) {
    // Build fetchers
    const fetchers = [];
    for (let i = queryBlockStart; i < queryBlockStart + 50; i++) {
      fetchers.push(buildFetcher(i));
    }

    // Run fetchers
    const results = await Promise.all(fetchers);

    // Gather fetcher results
    for (let ri = 0; ri < results.length; ri++) {
      const [urls, amtPremiums] = results[ri];

      premiumsTotal += amtPremiums;
      urlsTotal += urls.length;

      imageUrls.push(...urls);
      console.log(
        `Queried page ${queryBlockStart + ri} successfully for ${
          urls.length
        } icons (total: ${urlsTotal}, premium: ${amtPremiums})`
      );
    }
  }
  console.log(
    `Total icon stats: ${
      imageUrls.length + premiumsTotal
    } icons, of which ${premiumsTotal} are premium`
  );
  fs.writeFile("output2.txt", imageUrls.join(","), (err) => {
    if (err) {
      console.error(err);
    }
    // file written successfully
  });
})();
