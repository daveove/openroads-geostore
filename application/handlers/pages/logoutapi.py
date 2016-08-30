import urllib
from decorators import login_required
from sessions import SessionHandler
from cookie import clear_cookie
from application.handlers.base import BaseHandler

class LogoutApiHandler(BaseHandler):
    @login_required
    def get(self):
        session = SessionHandler()
        session.logout()

        clear_cookie(self, name="_ut_")

        if self.GET("r"):
            url = urllib.unquote(str(self.GET("r")))
        else:
            url = self.request.referer

        self.redirect(url)