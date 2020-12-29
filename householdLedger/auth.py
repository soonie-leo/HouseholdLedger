import functools

from flask import Blueprint
from flask import flash
from flask import g
from flask import redirect
from flask import render_template
from flask import request
from flask import session
from flask import url_for
from werkzeug.security import check_password_hash
from werkzeug.security import generate_password_hash

from householdLedger.db import get_db

bp = Blueprint("auth", __name__, url_prefix="/auth")


def login_required(view):
	@functools.wraps(view)
	def wrapped_view(**kwargs):
		if g.user is None:
			return redirect(url_for("auth.login"))
		return view(**kwargs)
	
	return wrapped_view


def admin_required(view):
	@functools.wraps(view)
	def wrapped_view(**kwargs):
		if g.user["username"] != "admin":
			return redirect(url_for("ledger.home"))
		return view(**kwargs)
	
	return wrapped_view


@bp.before_app_request
def load_logged_in_user():
	user_id = session.get("user_id")

	if user_id is None:
		g.user = None
	else:
		g.user = (
			get_db().execute("SELECT * FROM user WHERE id = ?", (user_id,)).fetchone()
		)


@bp.route("/register", methods=("GET", "POST"))
@admin_required
def register():
	if request.method == "POST":
		username = request.form["username"]
		password = request.form["password"]
		db = get_db()
		error = None

		if not username:
			error = "Username is required."
		elif not password:
			error = "Password is required."
		elif (
			db.execute("SELECT id FROM user WHERE username = ?", (username,))
			.fetchone() is not None
		):
			error = f"User {username} is already registered."

		if error is None:
			db.execute(
				"INSERT INTO user (username, password) VALUES (?, ?)",
				(username, generate_password_hash(password)),
			)
			db.commit()
			return redirect(url_for("auth.login"))

		flash(error)

	return render_template("auth/register.html")


@bp.route("/login", methods=("GET", "POST"))
def login():
	isLogout = request.args.get("isLogout", False)

	if request.method == "POST":
		username = request.form["username"]
		password = request.form["password"]
		db = get_db()
		error = None
		user = db.execute(
		"SELECT * FROM user WHERE username = ?", (username,)
		).fetchone()

		if user is None:
			error = "Incorrect username."
		elif not check_password_hash(user["password"], password):
			error = "Incorrect password."

		if error is None:
			session.clear()
			session["user_id"] = user["id"]
			return redirect(url_for("ledger.home"))

		flash(error)

	return render_template("auth/login.html", isLogout=isLogout)


@bp.route("/logout")
def logout():
	session.clear()
	return redirect(url_for("auth.login", isLogout=True))
