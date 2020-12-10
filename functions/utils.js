const getDueDateStatus = (date, time) => {
  //let nowTime = new Date().toLocaleString("en-US", { timeZone: "Europe/Copenhagen" }).getTime()
  let nowTime = new Date().getTime();

  let nowPlusWeek = nowTime + (7 * 24 * 60 * 60 * 1000);
  let dateTimestamp;
  let dateSplit = date.split('-');

  if (!time) {
    dateTimestamp = new Date(dateSplit[0], (1 * dateSplit[1]) - 1, dateSplit[2]).getTime();
  } else {
    let timeSplit = time.split(':');
    dateTimestamp = new Date(dateSplit[0], (1 * dateSplit[1]) - 1, dateSplit[2], timeSplit[0], timeSplit[1]).getTime();
  }

  if (dateTimestamp < nowTime) return 'overdue';
  if (nowTime < dateTimestamp < nowPlusWeek) 'upcoming_within_week';
  return 'upcoming';
};

module.exports = { getDueDateStatus };