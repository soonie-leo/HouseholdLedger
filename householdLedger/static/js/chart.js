$(document).ready(function() {
	drawChart();
});

function drawChart() {
	var tmp = $("#data").text();
	var data = JSON.parse($("#data").html(tmp).text());

	var baseDatas = Object.keys(data).map(function(key) {
		return [key, data[key]];
	});
	baseDatas.sort(function(a, b) {
		return new Date(a[0]) - new Date(b[0]);
	});

	// 거래내역이 없는 날짜 추가
	var datas = [];
	var base = new Date(baseDatas[0][0]);
	base.setDate(base.getDate() - 1);
	for (var i in baseDatas) {
		base.setDate(base.getDate() + 1);
		var tmp = new Date(baseDatas[i][0]);
		while (base.getDate() != tmp.getDate()) {
			var key = base.getFullYear()
				+ "." + (base.getMonth()+1).toString().padStart(2, "0")
				+ "." + base.getDate().toString().padStart(2, "0");
			var value = {
				"income": 0,
				"expenses": 0
			};
			datas.push([key, value]);
			base.setDate(base.getDate() + 1);
		}
		datas.push(baseDatas[i]);
	}

	drawDaily(datas);
	drawWeekly(datas);
	drawMonthly(datas);
}

function drawDaily(datas) {
	var dates = [];
	var incomes = [];
	var expenses = [];
	for (var i in datas) {
		dates.push(datas[i][0]);
		incomes.push(datas[i][1]["income"]);
		expenses.push(datas[i][1]["expenses"]);
	}

	var dc = $("#daily-chart");
	var dailyChart = new Chart(dc, {
		type: "bar",
		data: {
			labels: dates,
			datasets: [{
				label: "수입",
				data: incomes,
				backgroundColor: "rgba(54, 162, 235, 0.6)",
				hidden: true
			},{
				label: "지출",
				data: expenses,
				backgroundColor: "rgba(255, 99, 132, 0.6)"
			}]
		}
	});
}

function getWeekStr(date, offset=0) {
	var weekStart = new Date(date);
	weekStart.setDate(weekStart.getDate() - date.getDay() + offset);
	var weekEnd = new Date(date);
	var weekStr = (weekStart.getFullYear() % 100)
		+ "." + (weekStart.getMonth() + 1).toString().padStart(2, "0")
		+ "." + weekStart.getDate().toString().padStart(2, "0")
		+ "~" + (weekEnd.getFullYear() % 100)
		+ "." + (weekEnd.getMonth() + 1).toString().padStart(2, "0")
		+ "." + weekEnd.getDate().toString().padStart(2, "0");

	return weekStr;
}

function drawWeekly(datas) {
	var dates = [];
	var incomes = [];
	var expenses = [];
	var income = 0;
	var expense = 0;
	for (var i in datas) {
		var d = new Date(datas[i][0]);
		income += datas[i][1]["income"];
		expense += datas[i][1]["expenses"];

		if (d.getDay() == 6) {
			if (i < 6) dates.push(getWeekStr(d, 6-i));
			else dates.push(getWeekStr(d));
			incomes.push(income);
			expenses.push(expense);
			income = 0;
			expense = 0;
		}
	}
	if (d.getDay() != 6) {
		dates.push(getWeekStr(d));
		incomes.push(income);
		expenses.push(expense);
	}

	var wc = $("#weekly-chart");
	var weeklyChart = new Chart(wc, {
		type: "bar",
		data: {
			labels: dates,
			datasets: [{
				label: "수입",
				data: incomes,
				backgroundColor: "rgba(54, 162, 235, 0.6)",
				hidden: true
			},{
				label: "지출",
				data: expenses,
				backgroundColor: "rgba(255, 99, 132, 0.6)"
			}]
		}
	});
}

function getMonthStr(date) {
	var month = new Date(date);
	month.setMonth(month.getMonth() - 1);
	var monthStr = (month.getFullYear() % 100)
		+ "." + (month.getMonth() + 1).toString().padStart(2, "0")

	return monthStr;
}

function drawMonthly(datas) {
	var dates = [];
	var incomes = [];
	var expenses = [];
	var income = 0;
	var expense = 0;
	var cur_month = new Date(datas[0][0]).getMonth();
	for (var i in datas) {
		var d = new Date(datas[i][0]);
		income += datas[i][1]["income"];
		expense += datas[i][1]["expenses"];

		if (cur_month != d.getMonth()) {
			dates.push(getMonthStr(d));
			incomes.push(income);
			expenses.push(expense);
			income = 0;
			expense = 0;
			cur_month = d.getMonth();
		}
	}
	if (cur_month == d.getMonth()) {
		d.setMonth(d.getMonth() + 1);
		dates.push(getMonthStr(d));
		incomes.push(income);
		expenses.push(expense);
	}

	var mc = $("#monthly-chart");
	var monthlyChart = new Chart(mc, {
		type: "bar",
		data: {
			labels: dates,
			datasets: [{
				label: "수입",
				data: incomes,
				backgroundColor: "rgba(54, 162, 235, 0.6)"
			},{
				label: "지출",
				data: expenses,
				backgroundColor: "rgba(255, 99, 132, 0.6)"
			}]
		}
	});
}
