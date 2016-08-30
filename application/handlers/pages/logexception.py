import logging
from application.handlers.base import BaseHandler
from main import jinja_environment

class LogExceptionHandler(BaseHandler):
    @classmethod
    def log_exception(self, request, res, exception):
        logging.exception(exception)
        template = jinja_environment.get_template('error500.html')
        if request.referer:
            url = request.referer
        else:
            url = "/"
        res.write(template.render({"user": {}, "url": url}))