import fs from "fs";
import fetch from "node-fetch";

fs.readFile("output.txt", async (err, data) => {
  if (err) {
    console.error(err);
  }
  const urls = data.toString().split(",");

  const fetcherGroups = [];
  let groupIdx = 0;
  for (let u of urls) {
    if (fetcherGroups[groupIdx] === undefined) {
      fetcherGroups[groupIdx] = [];
    }
    if (fetcherGroups[groupIdx].length === 10) {
      groupIdx++;
      fetcherGroups[groupIdx] = [];
    }

    fetcherGroups[groupIdx].push(buildFetcher(u));
  }

  for (let i = 0; i < fetcherGroups.length; i++) {
    const fetchers = fetcherGroups[i];
    console.log(`fetching fetcher group ${i} with length ${fetchers.length}`);
    const responses = await Promise.all(fetchers);
    console.log(responses.length);
    for (let j = 0; j < responses.length; j++) {
      const res = responses[j];
      res.body.pipe(fs.createWriteStream(`./${i}-${j}.png`));
    }
  }
});

const buildFetcher = (url) => {
  return fetch(url);
};
