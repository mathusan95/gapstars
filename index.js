//package imports
const fs = require("fs").promises;
const { join } = require("path");
const mergeImg = require("merge-img");
const argv = require("minimist")(process.argv.slice(2));
const axios = require("axios");
const { v4 } = require("uuid");
const Validator = require("validatorjs");
const moment = require("moment");

//file imports
const { greetings, baseUrl, rules } = require("./utils/config");

let { width = 400, height = 500, color = "Pink", size = 100 } = argv;

//@param text:string
const getCatImageWithText = async (
  text,
  imageHeight,
  imageWidth,
  imageSize
) => {
  const url = `${baseUrl}/cat/says/${text}`;
  const options = {
    url,
    method: "GET",
    params: {
      width: imageWidth,
      height: imageHeight,
      color: color,
      s: imageSize,
    },
    responseType: "arraybuffer",
  };
  return await axios(options);
};

//@param:ImageHeight:number
//@param:imageWidth:number
//@param:imageSize:number
//@param:imageColor:string
const mainFunction = async (imageHeight, imageWidth, imageSize, imageColor) => {
  try {
    const validation = new Validator(
      {
        height: imageHeight,
        width: imageWidth,
        size: imageSize,
        color: imageColor,
      },
      rules
    );
    //validate the input arguments
    if (validation.passes()) {
      //fetch images from the api
      const promises = greetings.map((imgText) => {
        return getCatImageWithText(
          imgText,
          imageHeight,
          imageWidth,
          imageSize,
          imageColor
        );
      });
      const results = await Promise.allSettled(promises);
      const errors = results.filter((data) => data.status === "rejected");

      if (errors.length > 0) {
        throw new Error("error when fetching image");
      }
      //merge the results from the api
      const imgArray = results.map((val, index) => {
        if (index == 0) {
          return {
            src: Buffer.from(val?.value?.data, "binary"),
            x: 0,
            y: 0,
          };
        } else {
          return {
            src: Buffer.from(val?.value?.data, "binary"),
            x: width,
            y: 0,
          };
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

      //directory location with foldername current date
      const fileDirectory = join(process.cwd(),`${moment(new Date()).format("YYYY-MM-DD")}`);
      try {
        //check directory exists
        await fs.readdir(fileDirectory);
      } catch (error) {
        //create new directory
        await fs.mkdir(fileDirectory);
      }

      //save the file inside the directory
      await fs.writeFile(`${fileDirectory}/cat-card_${v4()}`,bufferdImg,"binary");
    } else {
      throw new Error("invalid Input Exception");
    }
  } catch (error) {
    //TODO log the error
    console.log(error.message, "error>>>");
  }
};

mainFunction(height, width, size, color);
