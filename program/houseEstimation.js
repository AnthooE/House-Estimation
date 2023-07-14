const fs = require('fs');
const readline = require('readline');
const prompt = require('prompt-sync')();

function parseData(data) {
  const apartmentAreas = [];
  const apartmentPrices = [];
  const lines = data.split("\n");
  for (let line of lines) {
    const [area, price] = line.split(",");
    apartmentAreas.push(parseFloat(area));
    apartmentPrices.push(parseFloat(price));
  }
  return [apartmentAreas, apartmentPrices];
}

function readFile(fileName) {
  return new Promise((resolve, reject) => {
    fs.readFile(fileName, 'utf8', (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      const [apartmentAreas, apartmentPrices] = parseData(data);
      resolve([apartmentAreas, apartmentPrices]);
    });
  });
}

function calculateIndicators(apartmentAreas, apartmentPrices) {
  const indicatorsX = [];  // Mean of x, median of x, variance of x, standard deviation of x
  const indicatorsY = [];  // Mean of y, median of y, variance of y, standard deviation of y
  const indicatorsXY = []; // Covariance, 'coefficient of linear correlation'
  let sumAll = 0;       // Used to calculate the sum of x and y
  let sumSquareX = 0;   // Used to calculate the sum of squared x
  let sumSquareY = 0;   // Used to calculate the sum of squared y

  // Calculations for apartment areas (x values) of the dataset
  // Mean of x
  const meanX = apartmentAreas.reduce((a, b) => a + b, 0) / apartmentAreas.length;
  indicatorsX.push(meanX);  // Add to the array

  // Median of x
  const listSize = apartmentAreas.length;
  const sortedList = apartmentAreas.slice().sort((a, b) => a - b);
  let Xmedian;
  if (listSize % 2 === 0) {
    Xmedian = (sortedList[listSize / 2 - 1] + sortedList[listSize / 2]) / 2;
  } else {
    Xmedian = sortedList[Math.floor(listSize / 2)];
  }
  indicatorsX.push(Xmedian);  // Add to the array

  // Mean squared of x
  for (let i = 0; i < apartmentAreas.length; i++) {
    // Sum of squared Xi
    sumSquareX += Math.pow(apartmentAreas[i], 2);
  }
  const meanSquareX = sumSquareX / apartmentAreas.length;

  // Mean of squared x
  const meanXSquared = Math.pow(meanX, 2);

  // Variance of x
  const varianceX = meanSquareX - meanXSquared;
  indicatorsX.push(varianceX);  // Add to the array

  // Standard deviation of x
  const stdDevX = Math.sqrt(varianceX);
  indicatorsX.push(stdDevX);  // Add to the array

  // Calculations for apartment prices (y values) of the dataset
  // Mean of y
  const meanY = apartmentPrices.reduce((a, b) => a + b, 0) / apartmentPrices.length;
  indicatorsY.push(meanY);

  // Median of y
  const listSizeY = apartmentPrices.length;
  const sortedListY = apartmentPrices.slice().sort((a, b) => a - b);
  let Ymedian;
  if (listSizeY % 2 === 0) {
    Ymedian = (sortedListY[listSizeY / 2 - 1] + sortedListY[listSizeY / 2]) / 2;
  } else {
    Ymedian = sortedListY[Math.floor(listSizeY / 2)];
  }
  indicatorsY.push(Ymedian);  // Add to the array

  // Mean squared of y
  for (let i = 0; i < apartmentPrices.length; i++) {
    // Sum of squared Yi
    sumSquareY += Math.pow(apartmentPrices[i], 2);
  }
  const meanSquareY = sumSquareY / apartmentPrices.length;

  // Mean of squared y
  const meanYSquared = Math.pow(meanY, 2);

  // Variance of y
  const varianceY = meanSquareY - meanYSquared;
  indicatorsY.push(varianceY);

  // Standard deviation of y
  const stdDevY = Math.sqrt(varianceY);
  indicatorsY.push(stdDevY);

  // Other calculations
  // Calculation of the mean of x times the mean of y
  const meanProduct = meanX * meanY;

  // Mean of x times y
  for (let i = 0; i < apartmentAreas.length; i++) {
    sumAll += apartmentAreas[i] * apartmentPrices[i];
  }
  const meanXY = sumAll / apartmentAreas.length;

  // Covariance of (x, y)
  const covarianceXY = meanXY - meanProduct;
  indicatorsXY.push(covarianceXY);

  // Coefficient of linear correlation
  const coefficientXY = covarianceXY / (stdDevX * stdDevY);
  indicatorsXY.push(coefficientXY);

  return [indicatorsX, indicatorsY, indicatorsXY];
}

function algo1(indicatorsX, indicatorsY, indicatorsXY) {
  // Calculation of a = covarianceXY / varianceX
  const a = indicatorsXY[0] / indicatorsX[2];

  // Calculation of b = meanY - a * meanX
  const b = indicatorsY[0] - a * indicatorsX[0];

  return [a, b];
}

function estimatePrice(area, a, b) {
  const calculation = (a * area + b) * 1000; // Multiply by thousand to get the result in thousands
  console.log(`\nPrice of an apartment for ${area}m²: `);
  console.log(`${calculation.toFixed(2)}€`);
}

function displayModel(a, b) {
  console.log("\nEstimation model to calculate the price of an apartment: ");
  console.log(`y = ${a.toFixed(2)}x + ${b.toFixed(2)}`);
}

function displayIndicators(indicatorsX, indicatorsY, indicatorsXY) {
  console.log("\n* ---- Various indicators concerning the data ---- *");
  console.log("Indicators for areas:");
  console.log(`Mean: ${indicatorsX[0]} square meters.`);
  console.log(`Median: ${indicatorsX[1]} square meters.`);
  console.log(`Variance: ${indicatorsX[2]} square meters squared.`);
  console.log(`Standard Deviation: ${indicatorsX[3]} square meters.`);

  console.log("\nIndicators for prices:");
  console.log(`Mean: ${indicatorsY[0]} €`);
  console.log(`Median: ${indicatorsY[1]} €`);
  console.log(`Variance: ${indicatorsY[2]} €²`);
  console.log(`Standard Deviation: ${indicatorsY[3]} €`);

  console.log("\nOther indicators:");
  console.log(`Covariance: ${indicatorsXY[0]}`);
  console.log(`Coefficient of Linear Correlation: ${indicatorsXY[1]}`);
}

function menuEntry() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    console.log("*  -------------------------------------  MENU  --------------------------------------  *");
    console.log("*  Available options:                                                                   *");
    console.log("*                                                                                      *");
    console.log("*  1 - Display indicators associated with the dataset                                   *");
    console.log("*  2 - Calculate the model using analytical resolution                                 *");
    console.log("*  3 - Estimate the price of an apartment based on a model                             *");
    console.log("*  4 - Quit the tool                                                                    *");
    console.log("*  -----------------------------------------------------------------------------------  *");

    rl.question("Select an option (between 1 and 4): ", (entry) => {
      entry = parseInt(entry);
      if (!Number.isNaN(entry) && entry >= 1 && entry <= 4) {
        rl.close();
        resolve([true, entry]);
      } else {
        console.log("Error: you did not enter an integer between 1 and 4.");
        menuEntry().then(resolve);
      }
    });
  });
}

let indicatorsX = [];
let indicatorsY = [];
let indicatorsXY = [];

function main(fileName) {
    readFile(fileName)
      .then(([apartmentAreas, apartmentPrices]) => {
        menuEntry().then(([isOk, entry]) => {
          if (isOk) {
            let a = 5;
            let b = 8;
  
            if (entry === 1) {
              const [indicatorsX, indicatorsY, indicatorsXY] = calculateIndicators(apartmentAreas, apartmentPrices);
              displayIndicators(indicatorsX, indicatorsY, indicatorsXY);
              console.log("\n\n\n\n"); // Spaces for better readability
            } else if (entry === 2) {
              if (indicatorsX.length === 0) {
                [indicatorsX, indicatorsY, indicatorsXY] = calculateIndicators(apartmentAreas, apartmentPrices);
              }
              [a, b] = algo1(indicatorsX, indicatorsY, indicatorsXY);
              displayModel(a, b);
              console.log("\n\n\n\n"); // Spaces for better readability
            } else if (entry === 3) {
              if (indicatorsX.length === 0 || a === 0) {
                const [indicatorsX, indicatorsY, indicatorsXY] = calculateIndicators(apartmentAreas, apartmentPrices);
                [a, b] = algo1(indicatorsX, indicatorsY, indicatorsXY);
              }
              const inputArea = parseFloat(prompt("Enter the area of your apartment (integer number): "));
              estimatePrice(inputArea, a, b);
              console.log("\n\n\n\n"); // Spaces for better readability
            } else if (entry === 4) {
              console.log("Thank you for using our tool!");
            } else {
              console.log("Invalid option!");
            }
  
            if (entry !== 4) {
              main(fileName);
            }
          }
        });
      })
      .catch((err) => {
        console.error('Error reading the file:', err);
      });
  }

const fileName = "data/data.txt";
main(fileName);
