const formatTime = date => {
  console.log(date)
  const utcy = date.getUTCFullYear()
  const utcm = date.getUTCMonth() + 1
  const utcd = date.getUTCDate()
  const utch = date.getUTCHours()
  const utcmin = date.getUTCMinutes()
  const utcs = date.getUTCSeconds()
  let new_datetime = utcy + '/' + utcm + '/' + utcd + ' ' + utch + ':' + utcmin + ':' + utcs
  console.log(new_datetime)
  let timestamp = new Date(new_datetime).getTime();
  timestamp = timestamp / 1000;
  // 增加8个小时，北京时间比utc时间多八个时区
  timestamp = timestamp + 8 * 60 * 60;
  let newDate = new Date(parseInt(timestamp) * 1000);
  console.log(newDate)
  const year = newDate.getFullYear()
  const month = newDate.getMonth() + 1
  const day = newDate.getDate()
  const hour = newDate.getHours()
  const minute = newDate.getMinutes()
  const second = newDate.getSeconds()
  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

module.exports = {
  formatTime: formatTime
}



