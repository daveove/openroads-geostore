import os
from raven import Client
from raven.handlers.logging import SentryHandler
from raven.conf import setup_logging
import logging

GAESENTRY_SENTRY_DSN = (
    'sync+https://40dee6edeb0548f99e483cf64b74a5c1:380e6e01aa934d0fb8736be907b'
    '9912d@app.getsentry.com/77892'
)


def add_sentry_to_logging():
    if not os.environ.get('HTTP_HOST').startswith('localhost:'):
        client = Client(GAESENTRY_SENTRY_DSN)
        handler = SentryHandler(client=client, level=logging.WARNING)
        setup_logging(handler)
