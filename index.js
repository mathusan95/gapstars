//package imports
const { writeFile } = require("fs");
const { join } = require("path");
const request = require("request");// not used due to depecreation
const mergeImg = require("merge-img");
const argv = require("minimist")(process.argv.slice(2));
const axios = require("axios");

//file imports
const imageTextConstants = require("./utils/imageTextEnum");
const baseUrl = require("./utils/config");

const { width = 400, height = 500, color = "Pink", size = 100 } = argv;

//request package has been depreciated so its not adviseable to continue using that package ,so instead i have used another http client (Axios)
const getCatImageWithText = async (text) => {
  const url = `${baseUrl}/cat/says/${text}`;
  const options = {
    url,
    method: "GET",
    params: {
      width: width,
      height: height,
      color: color,
      s: size,
    },
    responseType: "arraybuffer",
  };
  return await axios(options);
};

const mainFunction = async () => {
  // try catch is the modern way of error handling in js
  try {
    let results = [];
    let promises = [];
    //fetch images from the api and (for loop is faster and works better with promises)
    for (const imgText of imageTextConstants) {
      const promise = getCatImageWithText(imgText);
      promises.push(promise);
    }
    results = await Promise.allSettled(promises);
    //check for any error when fecthing images beacuse api call is happening at the same time which increases the performance
    for (const result of results) {
      if (result?.status === "rejected") {
        let error = new Error();
        error.message = "error when fetching image";
        throw error;
      }
    }

    //merge the results from the api
    const imgArray = results.map((val, index) => {
      if (index == 0) {
        return { src: Buffer.from(val?.value?.data, "binary"), x: 0, y: 0 };
      } else {
        return { src: Buffer.from(val?.value?.data, "binary"), x: width, y: 0 };
      }
    });
    const img = await mergeImg(imgArray);
    const bufferdImg = img.getBuffer("image/jpeg", (err, buffer) => {
      if (err) {
        throw err;
      } else {
        return buffer;
      }
    });
    const fileLocation = join(process.cwd(), `/cat-card.jpg`);
    writeFile(fileLocation, bufferdImg, "binary", (err) => {
      if (err) {
        throw err;
      }
      console.log("file has been saved");
      return;
    });
  } catch (error) {
    // here we can log the error message using any logging package pinoLogger
    console.log(error.message, "error>>>");
  }
};

mainFunction();
