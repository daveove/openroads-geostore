from application.handlers.base import BaseHandler

class MainHandler(BaseHandler):
    def get(self):
        """
            Handles the / endpoint.
            Shows the landing page.
        """
        self.redirect("/login")