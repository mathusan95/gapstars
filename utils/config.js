const config = {
  baseUrl: `https://cataas.com`,
  greetings: ["Hello", "You"],
  rules: {
    width: "required|numeric|min:0",
    height: "required|numeric|min:0",
    size: "required|numeric|min:0",
    color: "required|string",
  },
};

module.exports = config;
