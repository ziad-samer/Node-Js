require("dotenv").config();
const STORE_API = "https://api.escuelajs.co/api/v1/products";
const API_KEY = process.env.API_KEY;
async function getProducts() {
  return fetch(STORE_API).then((res) => res.json());
}

function categorize(products) {
  return Object.values(
    products.reduce((categories, product) => {
      if (!categories[product.category.id]) {
        categories[product.category.id] = {
          category: { id: product.category.id, name: product.category.name },
          products: [],
        };
      }
      categories[product.category.id].products.push(product);
      return categories;
    }, {})
  );
}

async function getRate() {
  const api = `https://api.currencyapi.com/v3/latest?apikey=${API_KEY}&currencies=EGP`;
  const rate = await fetch(api)
    .then((Response) => Response.json())
    .then((json) => +json.data.EGP.value);
  return rate;
}

async function transformProductsPrice(categories) {
  const rate = await getRate();
  return categories.map((category) => ({
    ...category,
    products: category.products.map((product) => ({
      ...product,
      price: (product.price * rate).toFixed(2),
    })),
  }));
}

getProducts()
  .then(categorize)
  .then(transformProductsPrice)
  .then((data) => console.log(JSON.stringify(data, null, 2)));
