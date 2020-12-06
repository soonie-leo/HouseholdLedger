import os

from flask import Flask
from flask import redirect
from flask import url_for


def create_app():
	app = Flask(__name__)
	app.config.from_mapping(
		SECRET_KEY="dev",
		DATABASE="/tmp/household_ledger.sqlite",
	)

	# register the database commands
	from householdLedger import db
	db.init_app(app)

	# apply the blueprints to the app
	from householdLedger import auth, ledger
	app.register_blueprint(auth.bp)
	app.register_blueprint(ledger.bp)

	app.add_url_rule("/", endpoint="index")

	@app.route("/")
	def index():
		return redirect(url_for("ledger.index"))

	return app
