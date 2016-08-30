from mandrill_email import send_email
from google.appengine.api import taskqueue
from functions import success_message, error_message
from application.handlers.base import BaseHandler

# MODELS
from application.models.user import User

class SendVerificationHandler(BaseHandler):
    def get(self):
        """
            Handles the /register/verify/send endpoint.
            Resends email verification.
        """
        self.render("send-verification.html")

    def post(self):
        """
            Handles the /register/verify/send endpoint.
            Resends email verification.
        """
        if self.POST("email"):
            email = self.POST("email").lower().strip()

            query = User.query()
            query = query.filter(User.current_email == email)
            user = query.get()

            if user:
                if user.status == "PENDING":
                    content = {
                        "token": user.confirmation_token,
                        "uid": str(user.key.id()),
                        "receiver_name": user.first_name,
                        "receiver_email": user.current_email,
                        "subject": "Email Verfication",
                        "email_type": "verify"
                    }

                    taskqueue.add(
                        url="/tasks/email/send",
                        params=content,
                        method="POST")

                    success = "The verification email has been sent to "
                    success += self.POST("email") + ". Please open the "
                    success += "email and verify your account "
                    success += "to complete the registration."
                    success_message(self, success)
                    self.redirect("/register/verify/send")
                else:
                    error = "Account is already verified."
                    error_message(self, error)
                    self.redirect("/register/verify/send")
            else:
                error = "Sorry, " + self.POST("email")
                error += " does not belong to an existing account."
                error_message(self, error)
                self.redirect("/register/verify/send")
        else:
            error = "Email is required."
            error_message(self, error)
            self.redirect("/register/verify/send")