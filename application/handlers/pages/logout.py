from decorators import login_required
from cookie import clear_cookie
from functions import success_message
from sessions import SessionHandler
from application.handlers.base import BaseHandler

class LogoutHandler(BaseHandler):
    @login_required
    def get(self):
        """
            Handles the /logout endpoint.
            Logs out users.
        """
        session = SessionHandler()
        session.logout()

        clear_cookie(self, name="_ut_")

        success = "You have logged out successfully!"
        success_message(self, success)
        self.redirect("/login")