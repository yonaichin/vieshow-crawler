console.log("[SCHEDULER] Current time is %s.", DateTimezone(8));

require('./update_db.js');

// 新增當地時區的時間物件
function DateTimezone(offset) {

    // 建立現在時間的物件
    d = new Date();

    // 取得 UTC time
    utc = d.getTime() + (d.getTimezoneOffset() * 60000);

    // 新增不同時區的日期資料
    return new Date(utc + (3600000 * offset));

}


