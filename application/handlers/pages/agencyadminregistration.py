from functions import wrap_response
from decorators import allowed_users
from mandrill_email import send_email
from google.appengine.api import taskqueue
from google.appengine.datastore.datastore_query import Cursor
from application.models.user import User
from application.handlers.base import BaseHandler

class AgencyAdminRegistrationHandler(BaseHandler):
    @allowed_users(["OPENDATAADMIN", "SYSADMIN"])
    def get(self):
        """
            Handles the /admin/register endpoint.
            Agency Admin registration.
        """
        if self.GET("ajax"):
            n = 50
            if self.GET("n"):
                n = int(self.GET("n"))

            query = User.query()
            query = query.filter(User.role == "AGENCYADMIN")

            if self.GET("status"):
                query = query.filter(User.status == self.GET("status").upper())

            if self.GET("cursor"):
                curs = Cursor(urlsafe=self.GET("cursor"))
                users, cursor, more = query.fetch_page(n, start_cursor=curs)
            else:
                users, cursor, more = query.fetch_page(n)

            response = {}
            response["more"] = False
            response["users"] = []
            response["cursor"] = ""

            if users:
                for user in users:
                    response["users"].append(user.to_approval_object())

                if more:
                    response["more"] = True
                    response["cursor"] = cursor.urlsafe()
                    response["url"] = CURRENT_URL
                    response["url"] += "agency/admins?ajax=1&status="
                    response["url"] += self.GET("status")
                    response["url"] += "&cursor=" + cursor.urlsafe()
                    if self.GET("n"):
                        response["url"] += "&n=" + self.GET("n")

            wrap_response(self, response)
        else:
            self.render("register-approve.html")

    @allowed_users(["OPENDATAADMIN", "SYSADMIN"])
    def post(self):
        """
            Handles the /admin/register endpoint.
            Agency Admin registration.
        """
        if self.POST("agency_admin_id") and self.POST("action"):
            user = User.get_by_id(int(self.POST("agency_admin_id")))
            if user:
                if self.POST("action") == "approve":
                    user.approved_by_name = " ".join(
                        [self.user.first_name, self.user.last_name])
                    user.approved_by_key = self.user.key
                    user.approved_on = datetime.datetime.now()
                    user.status = "APPROVED"

                    content = {
                        "receiver_name": user.first_name,
                        "receiver_email": user.current_email,
                        "subject": "Account Approved",
                        "email_type": "approve_account"
                    }

                    taskqueue.add(
                        url="/tasks/email/send",
                        params=content,
                        method="POST")

                elif self.POST("action") == "disapprove":
                    user.status = "DISAPPROVED"
                    user.disapproved_on = datetime.datetime.now()
                    user.disapproved_by_name = " ".join(
                        [self.user.first_name, self.user.last_name])
                    user.disapproved_by_key = self.user.key
                else:
                    wrap_response(self, {"status": "error"})
                    return

                user.put()
                wrap_response(self, {"status": "ok"})
                return

        wrap_response(self, {"status": "error"})