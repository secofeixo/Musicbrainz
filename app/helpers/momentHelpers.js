function removeHourMinSec(date) {
  date.milliseconds(0);
  date.seconds(0);
  date.minutes(0);
  date.hours(0);
}

module.exports = removeHourMinSec;
