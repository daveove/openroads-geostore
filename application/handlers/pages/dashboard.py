import logging
from decorators import *
from functions import *
from application.handlers.base import BaseHandler
from google.appengine.datastore.datastore_query import Cursor

# MODELS
from application.models.apidata import APIData
from application.models.user import User

class DashboardHandler(BaseHandler):
    @login_required
    def get(self):
        """
            Handles the /dashboard endpoint.
            Dashboard page of the user.
        """
        if self.user.role == "OPENDATAADMIN":
            self.redirect("/agency/admins")
        elif self.user.role in ["SYSADMIN", "GEOSTOREADMIN"]:
            self.render("sysadmin-dashboard-page.html")
        elif self.user.role == "CLUSTERDIRECTOR":
            self.redirect("/workspace?current_workspace=all")
        elif self.user.role == "AGENCYADMIN":
            self.redirect("/programs")
        else:
            self.redirect("/environment")

    @allowed_users(["SUPERADMIN", "OPENDATAADMIN"])
    def post(self):
        """
            Handles the /dashboard endpoint.
            Dashboard page of the user.
        """
        if self.POST("email"):
            email = self.POST("email").strip().lower()
            user = User.check_user(email)
            if user:
                error = "Sorry, it looks like "
                error += email + " belongs to an existing account."
                error_message(self, error)
                self.redirect("/opendata/admins")
                return

            user = User.invite_new_opendata_admin(
                email=email)

            success = "Your invitation has been sent to "
            success += email + "."
            success_message(self, success)
            self.redirect("/opendata/admins")
            return

        self.redirect("/dashboard")