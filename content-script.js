getDatesBetween = (start, end) => {
    var dateArray = new Array();
    var currentDate = start
    while (currentDate <= end) {
        dateArray.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dateArray;
}

getDatesInWeek = (date) => {
    var monday = new Date(date);
    monday.setDate(monday.getDate() - monday.getDay() + 1);
    var sunday = new Date(date);
    sunday.setDate(sunday.getDate() - sunday.getDay() + 7);
    return getDatesBetween(monday, sunday);
}

mapDateToString = (date) => {
    return "day_" + date.getFullYear() + "-" + ((date.getMonth() + 1) > 9 ? '' : '0') + (date.getMonth() + 1)
        + "-" + (date.getDate() > 9 ? '' : '0') + date.getDate();
}

loadContentWith = (dates) => {
    var stringDates = dates.map(mapDateToString);
    var times = [];
    for (let i = 0; i < stringDates.length; i++) {
        var key = stringDates[i];
        var x = $('div[data-test-id="' + key + '"]').find('span[data-test-id="day-summary"]').first().text();
        times.push(x);
    }
    var todayTime = $('div[data-test-id=today-cell]').find('span[data-test-id="day-summary"]').first();
    if (todayTime) {
        times.push(todayTime.text());
    }
    return times;
}

calculateWork = (value) => {
    var hoursAndMinutes = item.trim().split("h");
    var duration = hoursAndMinutes[0] * 3600000 + hoursAndMinutes[1] * 60000;
    return { "work": duration, "break": 0 };
}

calculateWorkAndBreak = (value) => {
    var x = value.split("+");
    var hoursAndMinutes = x[0].trim().split("h");
    var duration = hoursAndMinutes[0] * 3600000 + hoursAndMinutes[1] * 60000;
    return { "work": duration, "break": x[1].trim() };
}

calculateWorkAndBreaksFor = (dates) => {
    var dictionary = [];
    for (let i = 0; i < dates.length; i++) {
        var item = dates[i];
        if (!item) {
            dictionary[dates[i]] = { "work": 0, "break": 0 };
            continue;
        } else if (!item.includes("+")) {
            dictionary[dates[i]] = calculateWork(item);
            continue;
        } else {
            dictionary[dates[i]] = calculateWorkAndBreak(item);
        }
    }
    return dictionary;
}

calculateTotalWorkAndBreak = (worksAndBreaks) => {
    var totalWork = 0
    var totalBreak = 0
    for (const [key, value] of Object.entries(worksAndBreaks)) {
        totalWork += value.work;
        totalBreak += value.break;
    }
    return { "work": totalWork, "break": totalBreak };
}

mapMilliSecondsToHoursAndMinutes = (sum) => {
    let seconds = Math.floor(sum / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);

    return { "hours": hours, "minutes": minutes, "seconds": seconds };
}

while(!$('div[data-test-id=today-cell]').find('span[data-test-id="day-summary"]').first()){
    setTimeout(1000);
}

var dateArray = getDatesInWeek(new Date());

var times = loadContentWith(dateArray);

var dictionary = calculateWorkAndBreaksFor(times);

var totals = calculateTotalWorkAndBreak(dictionary);

var workingTime = mapMilliSecondsToHoursAndMinutes(totals.work);
var breakTime = mapMilliSecondsToHoursAndMinutes(totals.break);

console.log("Worked this week for: ")
console.log(workingTime)
console.log("Break this week for: ")
console.log(breakTime)

