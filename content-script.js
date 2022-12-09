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
        if (key === mapDateToString(new Date())) {
            times.push($('div[data-test-id=today-cell]').find('span[data-test-id="day-summary"]').first().text());
        }
        else {
            times.push($('div[data-test-id="' + key + '"]').find('span[data-test-id="day-summary"]').first().text());
        }
    }
    return times;
}

calculateWork = (value) => {
    var hoursAndMinutes = value.trim().split("h");
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

function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return weekNo;
}

insertIntoPage = (workTime) => {
    var weekNumber = getWeekNumber(new Date());
    var now = workTime.filter(x => x.weekNumber === weekNumber)[0];

    $(".AttendancePage-module__header___cbl1Z").find("#myAttendance").remove();
    $(".AttendancePage-module__header___cbl1Z").append(`
    <div id="myAttendance" class="WidgetArea-module__widgetsWrapper___TVJCo" style="margin-top: 20px;">
    <div class="Widget-module__wrapper___xmbJe">
        <div class="WidgetHead-module__name___A2zdl">Monatskonto</div>
        <div class="WidgetBody-module__wrapper___dqSWy">
            <div class="AttendanceBalanceWidget-module__left___XChX0">
                ${workTime.map(x => {
        return `<div class="WidgetItem-module__wrapper___zgWan">
                    <div class="WidgetItemTitle-module__title___JvxYv"><span>${x.workedHours.minutes > 0 ? x.workedHours.hours : "-"}h${x.workedHours.minutes > 0 ? x.workedHours.minutes % 60 : "-"}</span></div>
                    <div class="WidgetItemSubtitle-module__subtitle___LLkNS"><span>KW${x.weekNumber.toString()}</span></div>
                </div>`
    }).join("")
        }
            </div>
        </div>
    </div>
    <div class="Widget-module__wrapper___xmbJe">
        <div class="WidgetHead-module__name___A2zdl">Wochenfortschritt</div>
        <div class="WidgetBody-module__wrapper___dqSWy">
            <div style="width: 100%; height: 100%; border: 1px solid #dee2e6; border-radius: 4px; overflow: hidden">
                <div style="width: ${now ? (now.workedHours.minutes / 1200) * 100 : 0}%; height: 100%; background: #49b544;">
            </div>
        </div>
    </div>
</div>`);
}

load = (dates) => {
    var times = loadContentWith(dates);
    var dictionary = calculateWorkAndBreaksFor(times);
    var totals = calculateTotalWorkAndBreak(dictionary);
    var workingTime = mapMilliSecondsToHoursAndMinutes(totals.work);
    var breakTime = mapMilliSecondsToHoursAndMinutes(totals.break);

    return { "work": workingTime, "break": breakTime };
}

var prevMonthlyDatesPerWeek;

doSomething = () => {
    var monthlyDatesPerWeek = [];
    var currentDate = new Date();
    var i = 1;
    var firstWeekInMonth = getDatesInWeek(new Date(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), 1));
    var hours = load(firstWeekInMonth);
    monthlyDatesPerWeek.push({
        dates: firstWeekInMonth,
        weekNumber: getWeekNumber(new Date(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), 1)),
        workedHours: hours.work,
        breakHours: hours.break
    });
    while (currentDate.getMonth() == new Date().getMonth()) {
        var date = new Date(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), 1 + (i * 7));
        hours = load(getDatesInWeek(date))
        monthlyDatesPerWeek.push({
            dates: getDatesInWeek(date),
            weekNumber: getWeekNumber(date),
            workedHours: hours.work,
            breakHours: hours.break
        });
        i++;
        currentDate = new Date(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), 1 + (i * 7));
    }

    var rebuild = true;
    if (prevMonthlyDatesPerWeek) {
        for (var x = 0; x < prevMonthlyDatesPerWeek.length; x++) {
            var prevwork = prevMonthlyDatesPerWeek[x].workedHours;
            var prevbreaks = prevMonthlyDatesPerWeek[x].breakHours;
            var work = prevMonthlyDatesPerWeek[x].workedHours;
            var breaks = prevMonthlyDatesPerWeek[x].breakHours;

            if (prevwork.hours === work.hours && prevwork.minutes === work.minutes && prevbreaks.hours === breaks.hours && prevbreaks.minutes === breaks.minutes) {
                rebuild = false;
                break;
            }
        }
    }

    if (rebuild || $(".AttendancePage-module__header___cbl1Z").find("#myAttendance").length === 0) {
        prevMonthlyDatesPerWeek = monthlyDatesPerWeek;
        insertIntoPage(monthlyDatesPerWeek);
    }
}

setInterval(doSomething, 1000);

