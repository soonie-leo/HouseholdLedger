from flask import Blueprint
from flask import flash
from flask import g
from flask import redirect
from flask import render_template
from flask import request
from flask import url_for
from werkzeug.exceptions import abort

import click
import json

from householdLedger.auth import login_required
from householdLedger.db import get_db

bp = Blueprint("ledger", __name__, url_prefix="/ledger")


@bp.route("/")
@login_required
def index():
    db = get_db()
    ledger = db.execute(
        "SELECT id, user_id, date, detail, income, expenses, source, tag, note, order_num"
        " FROM ledger WHERE user_id = ? ORDER BY order_num DESC", [g.user["id"]]
    ).fetchall()

    return render_template("ledger/index.html", ledger=ledger)


@bp.route("/chart")
@login_required
def chart():
    db = get_db()
    ledger = db.execute(
        "SELECT id, user_id, date, income, expenses, tag, order_num"
        " FROM ledger WHERE user_id = ? ORDER BY order_num DESC", [g.user["id"]]
    ).fetchall()

    data = {}
    for row in ledger:
        date = row["date"].strftime("%Y.%m.%d")
        if date not in data:
            data[date] = {
                "income": 0,
                "expenses": 0
            }
        data[date]["income"] += row["income"]
        data[date]["expenses"] += row["expenses"]

    return render_template("ledger/chart.html", data=json.dumps(data))


@bp.route("/insert", methods=["POST"])
@login_required
def insert():
    date = request.form["date"]
    detail = request.form["detail"]
    income = request.form["income"]
    expenses = request.form["expenses"]
    source = request.form["source"]
    tag = request.form["tag"]
    note = request.form["note"]

    db = get_db()
    row_num = db.execute("SELECT count(*) FROM ledger WHERE user_id = ?", [g.user["id"]]).fetchone()
    db.execute(
        "INSERT INTO ledger (user_id, date, detail, income, expenses, source, tag, note, order_num)"
        " VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        (g.user["id"], date, detail, int(income), int(expenses), source, tag, note, int(row_num[0])+1),
    )
    db.commit()

    return "ok"


@bp.route("/<int:id>/update", methods=["POST"])
@login_required
def update(id):
    date = request.form["date"]
    detail = request.form["detail"]
    income = request.form["income"]
    expenses = request.form["expenses"]
    source = request.form["source"]
    tag = request.form["tag"]
    note = request.form["note"]

    db = get_db()
    db.execute(
        "UPDATE ledger SET date = ?, detail = ?, income = ?, expenses = ?, source = ?, tag = ?, note = ?"
        " WHERE id = ?",
        (date, detail, income, expenses, source, tag, note, id)
    )
    db.commit()
    return "ok"


@bp.route("/<int:id>/update/order", methods=["POST"])
@login_required
def update_order(id):
    order = request.form["order"]
    error = None

    if not order:
        error = "Order number is required."

    if error is not None:
        return error
    else:
        db = get_db()
        db.execute(
            "UPDATE ledger SET order_num = ? WHERE id = ?", (order, id)
        )
        db.commit()
        return "ok"


@bp.route("/<int:id>/delete", methods=["POST"])
@login_required
def delete(id):
    db = get_db()
    db.execute("DELETE FROM ledger WHERE id = ?", (id,))
    db.commit()
    return "ok"
