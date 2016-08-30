from gaesessions import SessionMiddleware
from request import global_vars
import datetime
import gaesentry


def initialize_global_vars():
    global_vars.datetime_now = datetime.datetime.now()
    adjusted = global_vars.datetime_now + datetime.timedelta(hours=8)
    global_vars.datetime_now_adjusted = adjusted
    global_vars.user = None


def webapp_add_wsgi_middleware(app):
    initialize_global_vars()
    gaesentry.add_sentry_to_logging()
    from google.appengine.ext.appstats import recording
    app = recording.appstats_wsgi_middleware(app)
    cookie_key = "6ghJ7fJ4StrQbrTYggCfn5gJv7FfgDefFgYhI8v6Dgce7SwDmYdLOjoPePi"
    cookie_key += "PhnSWfEbnTKCadXsoSbAt"
    app = SessionMiddleware(app, cookie_key=cookie_key)
    return app
