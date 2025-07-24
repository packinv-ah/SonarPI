// Function to return a float number
function validatedNum(value) {
  return parseFloat(Number(value) ? value : 0).toFixed(2);
}

module.exports = validatedNum;
