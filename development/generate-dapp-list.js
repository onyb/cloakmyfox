const axios = require('axios');
const { promises: fs } = require('fs');

const baseURL = 'https://apis.dappradar.com/v2/dapps';
const chains = ['arbitrum', 'ethereum', 'polygon', 'bnb-chain', 'optimism'];

start().catch(console.error);

async function start() {
  resultsPerPage = 50;
  page = 1;

  const allResults = [];

  while (true) {
    const params = {
      resultsPerPage,
      page,
    };

    try {
      console.log(`Fetching page ${page}`)
      const response = await axios.get(baseURL, {
        headers: {
          'x-api-key': process.env.DAPP_RADAR_API_KEY,
        },
        params,
      });
      const { results, pageCount } = response.data;
      const filteredResults = results
        .filter((dapp) => dapp.chains.some((chain) => chains.includes(chain)))
        .map((dapp) => dapp.website);
      console.log(`Fetched ${filteredResults.length} results\n`);

      allResults.push(...filteredResults);

      if (page >= pageCount) {
        break;
      }

      page += 1;

      await new Promise((resolve) => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`Error fetching page ${page}: ${error}`);
      break;
    }
  }

  await fs.writeFile('dapp-list.json', JSON.stringify(allResults, null, 2));
}
