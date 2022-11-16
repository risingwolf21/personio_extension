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

insertIntoPage = (workTime) => {
    $(".AttendancePage-module__header___cbl1Z").find("#myAttendance").remove();
    $(".AttendancePage-module__header___cbl1Z").append(`
    <div id="myAttendance" class="WidgetArea-module__widgetsWrapper___TVJCo" style="margin-top: 20px;">
    <div class="Widget-module__wrapper___xmbJe">
        <div class="WidgetHead-module__name___A2zdl">Arbeitszeitkonto</div>
        <div class="WidgetBody-module__wrapper___dqSWy">
            <div class="AttendanceBalanceWidget-module__left___XChX0">
                <div class="WidgetItem-module__wrapper___zgWan">
                    <div class="WidgetItemTitle-module__title___JvxYv"><span>53h10</span></div>
                    <div class="WidgetItemSubtitle-module__subtitle___LLkNS"><span>Erfasst</span></div>
                </div>
                <div class="WidgetItem-module__wrapper___zgWan">
                    <div class="WidgetItemTitle-module__title___JvxYv"><span>53h10</span></div>
                    <div class="WidgetItemSubtitle-module__subtitle___LLkNS"><span>Erfasst</span></div>
                </div>
                <div class="WidgetItem-module__wrapper___zgWan">
                    <div class="WidgetItemTitle-module__title___JvxYv"><span>53h10</span></div>
                    <div class="WidgetItemSubtitle-module__subtitle___LLkNS"><span>Erfasst</span></div>
                </div>
            </div>
        </div>
    </div>
    <div data-test-id="widget-work-schedule-container" class="Widget-module__wrapper___xmbJe">
        <div class="WidgetHead-module__name___A2zdl">Arbeitstage &amp; Wochenstunden</div>
        <div class="WidgetBody-module__wrapper___dqSWy">
            <div class="WorkScheduleWidget-module__left____3U8L">
                <div class="WidgetItem-module__wrapper___zgWan">
                    <div class="WidgetItemTitle-module__title___JvxYv"><span data-test-id="widget-work-schedule-days">5
                            Tage</span></div>
                    <div class="WidgetItemSubtitle-module__subtitle___LLkNS"><span
                            data-test-id="widget-work-schedule-weekdays">Mo, Di, Mi, Do, Fr</span></div>
                </div>
                <div class="WidgetItem-module__wrapper___zgWan">
                    <div class="WidgetItemTitle-module__title___JvxYv"><span
                            data-test-id="widget-work-schedule-hours">20h</span></div>
                    <div class="WidgetItemSubtitle-module__subtitle___LLkNS"><span>Wochenstunden</span></div>
                </div>
            </div>
            <div class="WorkScheduleWidget-module__ellipsis___bBt7v">
                <div class="DropdownMenu-module__2p2rUa8Y__v3-0-17">
                    <div data-test-id="widget-work-schedule-menu" data-action-name="widget-work-schedule-menu"
                        class="DropdownMenuToggle-module__3kJdGE4x__v3-0-17"><i class="far fa-ellipsis-h"
                            style="font-size: 16px; color: var(--icon-subdued);"></i></div>
                </div>
            </div>
        </div>
    </div>
</div>`);
}

var prevWorkingTime;
var prevBreakTime;

doSomething = () => {
    var dateArray = getDatesInWeek(new Date());

    var times = loadContentWith(dateArray);

    var dictionary = calculateWorkAndBreaksFor(times);

    var totals = calculateTotalWorkAndBreak(dictionary);

    var workingTime = mapMilliSecondsToHoursAndMinutes(totals.work);
    var breakTime = mapMilliSecondsToHoursAndMinutes(totals.break);

    if (prevWorkingTime && (prevWorkingTime.hours === workingTime.hours && prevWorkingTime.minuntes === workingTime.minutes))
        return;

    if (prevBreakTime && (prevBreakTime.hours === breakTime.hours && prevBreakTime.minuntes === breakTime.minutes))
        return;

    prevWorkingTime = workingTime;
    prevBreakTime = breakTime;

    insertIntoPage(workingTime);
}

setInterval(doSomething, 1000);

