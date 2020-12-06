$(document).ready(function() {
	setEditButtons();

	$("#ledger").sortable();
	$("#ledger").sortable("disable");
	$("#ledger").sortable("option", "handle", true);
});
