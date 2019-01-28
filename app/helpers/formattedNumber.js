function formattedNumber(num) {
  return num < 10 ? `0${num}` : num;
}

module.exports = formattedNumber;
