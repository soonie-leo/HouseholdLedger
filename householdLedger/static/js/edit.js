function setEditButtons() {
	$("#edit-order-btn").click(editOrderMode);
	$("#edit-add-btn").click(editAddMode);
	$("#edit-delete-btn").click(editDeleteMode);
}

function startEditMode() {
	$("#edit-order-btn").parent().addClass("d-none");
	$("#edit-add-btn").parent().addClass("d-none");
	$("#edit-delete-btn").parent().addClass("d-none");

	addCompleteBtn();
	addCancelBtn();
}

function addCompleteBtn() {
	var html = '';
	html += '<li class="list-group-item p-0">';
	html += '	<button id="edit-complete-btn" type="button" class="btn btn-success">완료</button>';
	html += '</li>';
	$("#edit-btn-list").append(html);
}

function addCancelBtn() {
	var html = '';
	html += '<li class="list-group-item p-0">';
	html += '	<button id="edit-cancel-btn" type="button" class="btn btn-danger">취소</button>';
	html += '</li>';
	$("#edit-btn-list").append(html);
}

function endEditMode() {
	$("#edit-order-btn").parent().removeClass("d-none");
	$("#edit-add-btn").parent().removeClass("d-none");
	$("#edit-delete-btn").parent().removeClass("d-none");

	$("#edit-complete-btn").parent().remove();
	$("#edit-cancel-btn").parent().remove();
}


/************************************************************************
 *                                                                      *
 *                        Edit Order Settings                           *
 *                                                                      *
 ************************************************************************/
function editOrderMode() {
	startEditMode();
	enableSortableTable();

	$("#edit-complete-btn").click(editOrderComplete);
	$("#edit-cancel-btn").click(editOrderCancel);
}

function editOrderComplete() {
	disableSortableTable();
	updateOrderNum();
	endEditMode();
}

function editOrderCancel() {
	disableSortableTable();
	endEditMode();
}

function enableSortableTable() {
	$("#ledger").disableSelection();
	$("#ledger").sortable("enable");
	$("#ledger").sortable("option", "handle", false);
}

function disableSortableTable() {
	$("#ledger").enableSelection();
	$("#ledger").sortable("disable");
	$("#ledger").sortable("option", "handle", true);
}

function updateOrderNum() {
	var rowCnt = parseInt($("#row-cnt").text());
	$(".table-row").each(function(i, row) {
		var target = $(row);
		var newOrder = rowCnt -i;

		if (target.attr("order") != newOrder) {
			var url = "/ledger/" + target.attr("id") + "/update/order";
			var data = {
				"order": newOrder
			}

			$.post(url, data, function(result) {
				if (result != "ok") {
					printErrorAlert(result);
				}
				else {
					target.find(".spare-column").text(newOrder);
					target.attr("order", newOrder);
				}
			});
		}
	});
}


/************************************************************************
 *                                                                      *
 *                         Edit Add Settings                            *
 *                                                                      *
 ************************************************************************/
function editAddMode() {
	startEditMode();
	addNewRow();

	$("#edit-complete-btn").click(editAddComplete);
	$("#edit-cancel-btn").click(editAddCancel);
}

function editAddComplete() {
	if (addNewRowData()) {
		removeNewRow();
		endEditMode();
	}
}

function editAddCancel() {
	removeNewRow();
	endEditMode();
}

function addNewRow() {
	var html = '';
	html += '<div id="add-row" class="row table-row">';
	html += '	<div class="col-sm-1">' + (parseInt($("#row-cnt").text()) + 1) + '</div>';
	html += '	<div class="col-sm-1"><input autocomplete="off" type="text" class="text-center" id="datePicker" placeholder="날짜 선택"></div>';
	html += '	<div class="col-sm-3"><input autocomplete="off" type="text" id="input-detail"></div>';
	html += '	<div class="col-sm-1"><input autocomplete="off" type="number" class="text-right" id="input-income" placeholder="0"></div>';
	html += '	<div class="col-sm-1"><input autocomplete="off" type="number" class="text-right" id="input-expenses" placeholder="0"></div>';
	html += '	<div class="col-sm-2"><input autocomplete="off" type="text" id="input-source"></div>';
	html += '	<div class="col-sm-2"><input autocomplete="off" type="text" id="input-tag"></div>';
	html += '	<div class="col-sm-1"><input autocomplete="off" type="text" id="input-note"></div>';
	html += '</div>';
	$("#ledger .table-header").after(html);

	$("#datePicker").datepicker({
		format: "yyyy.mm.dd",
		language: "ko"
	});
}

function removeNewRow() {
	var row = $("#add-row");
	if (row) {
		row.remove();
	}
}

function addNewRowData() {
	var data = {
		"date": $("#datePicker").val(),
		"detail": $("#input-detail").val(),
		"income": $("#input-income").val(),
		"expenses": $("#input-expenses").val(),
		"source": $("#input-source").val(),
		"tag": $("#input-tag").val(),
		"note": $("#input-note").val(),
	};

	if (data["income"] == "") {
		data["income"] = 0;
	}
	if (data["expenses"] == "") {
		data["expenses"] = 0;
	}

	var isOk = checkNewRowData(data);
	if(isOk) {
		$.post("/ledger/insert", data, function(result) {
			if(result == "ok") {
				location.reload();
			}
		});
	}

	return isOk;
}

function checkNewRowData(data) {
	var isOk = true;

	if (!data["date"]) {
		printErrorAlert("날짜를 입력하세요.");
		isOk = false;
	}
	else {
		var tmp = data["date"].replace(/\./g, "-");
		data["date"] = tmp + " 00:00:00";
	}
	if (!data["detail"]) {
		printErrorAlert("사용내역윽 입력하세요.");
		isOk = false;
	}
	if (data["income"] <= 0 && data["expenses"] <= 0) {
		printErrorAlert("수입 혹은 지출 중 하나 이상 입력하세요.");
		isOk = false;
	}

	return isOk;
}


/************************************************************************
 *                                                                      *
 *                        Edit Delete Settings                          *
 *                                                                      *
 ************************************************************************/
function editDeleteMode() {
	startEditMode();
	enableDeleteBtn();

	$("#edit-complete-btn").click(editDeleteComplete);
	$("#edit-cancel-btn").click(editDeleteCancel);
}

function editDeleteComplete() {
	executeEditRow();
	executeDelete();
	disableDeleteBtn();
	endEditMode();
}

function editDeleteCancel() {
	$(".editable").each(function (i, row) {
		disableEditableRow($(row).attr("id"));
	});
	disableDeleteBtn();
	$(".table-row").each(function (i, row) {
		$(row).removeClass("d-none");
	});
	endEditMode();
}

function enableDeleteBtn() {
	$("#ledger").prepend('<div id="delete-list" class="d-none"></div>');
	$(".spare-column").each(function (i, col) {
		var target = $(col);

		var html = '';
		html += '<a href="javascript:void(0);" onclick="enableEditableRow(' + target.parent().attr("id") + ');" class="text-success">';
		html += '	<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-pencil-square" fill="currentColor" xmlns="http://www.w3.org/2000/svg">';
		html += '		<path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456l-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>';
		html += '		<path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>';
		html += '	</svg>';
		html += '</a>';
		html += '<a href="javascript:void(0);" onclick="addDeleteRowList(' + target.parent().attr("id") + ');" class="text-danger">';
		html += '	<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-trash" fill="currentColor" xmlns="http://www.w3.org/2000/svg">';
		html += '		<path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>';
		html += '		<path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>';
		html += '	</svg>';
		html += '</a>';

		target.html(html);
	});
}

function enableEditableRow(id) {
	var target = $("#" + id);
	target.addClass("editable");

	target.children().eq(3).find("script").remove();
	target.children().eq(4).find("script").remove();

	var date = target.children().eq(1).text();
	var detail = target.children().eq(2).text();
	var income = target.children().eq(3).text().replace(/,/g, "");
	var expenses = target.children().eq(4).text().replace(/,/g, "");
	var source = target.children().eq(5).text();
	var tags = target.children().eq(6).children();
	var tag = "";
	for (var i=0; i<tags.length; i++) {
		if (i > 0) tag += ",";
		tag += tags.eq(i).text();
	}
	var note = target.children().eq(7).text();

	var html = target.children().eq(0).clone().wrapAll("<div/>").parent().html();
	html += '<div class="col-sm-1"><input autocomplete="off" type="text" class="text-center" id="datePicker' + id + '" placeholder="날짜 선택" org="' + date + '" value="' + date + '"></div>';
	html += '<div class="col-sm-3"><input autocomplete="off" type="text" id="input-detail' + id + '" org="' + detail + '" value="' + detail + '"></div>';
	html += '<div class="col-sm-1"><input autocomplete="off" type="number" class="text-right" id="input-income' + id + '" placeholder="0" org="' + income + '" value="' + income + '"></div>';
	html += '<div class="col-sm-1"><input autocomplete="off" type="number" class="text-right" id="input-expenses' + id + '" placeholder="0" org="' + expenses + '" value="' + expenses + '"></div>';
	html += '<div class="col-sm-2"><input autocomplete="off" type="text" id="input-source' + id + '" org="' + source + '" value="' + source + '"></div>';
	html += '<div class="col-sm-2"><input autocomplete="off" type="text" id="input-tag' + id + '" org="' + tag + '" value="' + tag + '"></div>';
	html += '<div class="col-sm-1"><input autocomplete="off" type="text" id="input-note' + id + '" org="' + note + '" value="' + note + '"></div>';
	target.html(html);
}

function disableEditableRow(id) {
	var target = $("#" + id);

	var date = target.children().eq(1).find("input").attr("org");
	var detail = target.children().eq(2).find("input").attr("org");
	var income = target.children().eq(3).find("input").attr("org");
	var expenses = target.children().eq(4).find("input").attr("org");
	var source = target.children().eq(5).find("input").attr("org");
	var tags = target.children().eq(6).find("input").attr("org").split(",");
	var tag = "";
	for (var i in tags) {
		tag += '<span class="badge badge-info">' + tags[i] + '</span> ';
	}
	var note = target.children().eq(7).find("input").attr("org");

	var html = target.children().eq(0).clone().wrapAll("<div/>").parent().html();
	html += '<div class="col-sm-1">' + date + '</div>';
	html += '<div class="col-sm-3">' + detail + '</div>';
	html += '<div class="col-sm-1">' + income.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</div>';
	html += '<div class="col-sm-1">' + expenses.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</div>';
	html += '<div class="col-sm-2">' + source + '</div>';
	html += '<div class="col-sm-2">' + tag + '</div>';
	html += '<div class="col-sm-1">' + note + '</div>';
	target.html(html);
}

function executeEditRow() {
	var requestCnt = 0;
	var editCnt = 0;

	$(".editable").each(function (i, row) {
		requestCnt += 1;

		var id = $(row).attr("id");
		var data = {
			"date": $("#datePicker" + id).val(),
			"detail": $("#input-detail" + id).val(),
			"income": $("#input-income" + id).val(),
			"expenses": $("#input-expenses" + id).val(),
			"source": $("#input-source" + id).val(),
			"tag": $("#input-tag" + id).val(),
			"note": $("#input-note" + id).val(),
		};

		if (data["income"] == "") {
			data["income"] = 0;
		}
		if (data["expenses"] == "") {
			data["expenses"] = 0;
		}

		var isOk = checkNewRowData(data);
		if (isOk) {
			url = "/ledger/" + id + "/update";
			$.post(url, data, function(result) {
				if (result == "ok") {
					editCnt += 1;
					if (requestCnt == editCnt) {
						location.reload();
					}
				}
			});
		}
	});
}

function addDeleteRowList(id) {
	$("#delete-list").append("<row>" + id + "</row>");
	$("#" + id).addClass("d-none");
}

function disableDeleteBtn() {
	$("#delete-list").remove();

	$(".table-row").each(function(i, row) {
		var target = $(row);
		target.find(".spare-column").text(target.attr("order"));
	});
}

function executeDelete() {
	var requestCnt = 0;
	var deleteCnt = 0;
	$("#delete-list row").each(function (i, row) {
		requestCnt += 1;
		var targetId = $(row).text();
		var url = "/ledger/" + targetId + "/delete";
		$.post(url, function (result) {
			if (result == "ok") {
				deleteCnt += 1;
				$("#" + targetId).remove();
				if (requestCnt == deleteCnt) {
					$("#row-cnt").text($("#row-cnt").text() - deleteCnt);
					updateOrderNum();
					location.reload();
				}
			}
		});
	});
}
