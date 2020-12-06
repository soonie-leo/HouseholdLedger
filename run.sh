#! /bin/bash

. venv/bin/activate

export FLASK_APP=householdLedger
export FLASK_ENV=development

flask run --host=0.0.0.0 --port=5000

#gunicorn --bind 0.0.0.0:5000 --workers 2 wsgi:app
