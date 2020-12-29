$(document).ready(function() {
	var username = getCookie("username");
	var password = getCookie("password");

	if (username != "" && password != "") {
		$("form div input[name=username]").val(username);
		$("form div input[name=password]").val(password);
		$("#auto-login").attr("checked", true);
		$("#login-btn").click();
	}
	
	$("#auto-login").change(function () {
		if($(this).is(":checked")) {
			setCookie("username", $("form div input[name=username]").val(), 365);
			setCookie("password", $("form div input[name=password]").val(), 365);
		}
		else {
			deleteCookie("username");
			deleteCookie("password");
		}
	});

	$("form div input[name=username]").keyup(updateCookie);
	$("form div input[name=password]").keyup(updateCookie);
});

function setCookie(name, value, exdays=null) {
	var exdate = new Date();
	exdate.setTime(exdate.getTime() + exdays * 24 * 60 * 60 * 1000);
	var cookieValue = name + "=" + encodeURIComponent(value);
	if (exdays) {
		cookieValue += "; expires=" + exdate.toUTCString();
	}
	document.cookie = cookieValue;
}

function getCookie(name) {
	var value = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
	return value ? value[2] : null;
}

function deleteCookie(name) {
	document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

function updateCookie() {
	if ($("#auto-login").is(":checked")) {
		var target = $(this);
		setCookie(target.attr("name"), target.val(), 365);
	}
}
