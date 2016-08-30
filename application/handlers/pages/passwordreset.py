import logging
import datetime
import urllib
from google.appengine.api import taskqueue
from decorators import csrf_protect
from sessions import SessionHandler
from functions import error_message, success_message, hp, generate_token
from application.handlers.base import BaseHandler
from application.models.user import User

class PasswordResetHandler(BaseHandler):
    def get(self):
        """
            Handles the /password/reset endpoint.
            Resets password of the user.
        """
        if self.GET("password_token") and self.GET("uid"):
            user = User.get_by_id(int(self.GET("uid")))
            if user:
                if user.password_token == self.GET("password_token"):
                    self.tv["reset"] = True
                    self.tv["token"] = self.GET("password_token")
                    self.tv["uid"] = self.GET("uid")
                    self.render("password-reset.html")
                else:
                    error = "You may have clicked an expired link "
                    error += "or mistyped the address."
                    error_message(self, error)
                    self.redirect("/login")
            else:
                error = "Sorry, we couldn't process your request. "
                error += "Please try again."
                error_message(self, error)
                self.redirect("/password/reset")
        else:
            self.render("password-reset.html")

    @csrf_protect
    def post(self):
        """
            Handles the /password/reset endpoint.
            Resets password of the user.
        """
        if self.POST("email"):
            email = self.POST("email").lower().strip()

            query = User.query()
            query = query.filter(User.current_email == email)
            user = query.get()

            if user:
                user.password_token = generate_token()
                user.put()

                content = {
                    "token": user.password_token,
                    "uid": str(user.key.id()),
                    "receiver_name": user.first_name,
                    "receiver_email": user.current_email,
                    "subject": "Reset Password",
                    "email_type": "password_reset"
                }

                taskqueue.add(
                    url="/tasks/email/send",
                    params=content,
                    method="POST")

                success = "We sent an email to "
                success += self.POST("email") + ". Please open the "
                success += "email and click on the password reset link "
                success += "to reset your password."
                success_message(self, success)
                self.redirect("/password/reset")
            else:
                error = "Sorry, " + self.POST("email")
                error += " does not belong to an existing account."
                error_message(self, error)
                self.redirect("/password/reset")
        elif self.POST("new_password") and self.POST("confirm_password") \
             and self.GET("uid") and self.GET("password_token"):
            if self.POST("new_password") == self.POST("confirm_password"):
                user = User.get_by_id(int(self.GET("uid")))
                if user:
                    if user.password_token == self.GET("password_token"):
                        password = user.hash_password(self.POST("new_password"))
                        user.password_token = generate_token()
                        user.previous_passwords.append(password)
                        user.password_update = datetime.datetime.now()
                        user.hashed_password = password
                        user.put()

                        session = SessionHandler(user)
                        session.login()
                        code = session.generate_login_code()
                        if self.POST("redirect"):
                            self.redirect(urllib.unquote(str(self.POST("redirect"))))
                        else:
                            self.redirect("/dashboard")
                        return
                    else:
                        error = "Sorry, your password reset request has expired."
                        error += " Please create a new request."
                        error_message(self, error)
                        self.redirect("/password/reset")
                else:
                    error = "Sorry, we couldn't process your request. "
                    error += "Please try again."
                    error_message(self, error)
                    self.redirect("/password/reset")
            else:
                error = "Passwords do not match."
                error_message(self, error)
                url = "/password/reset?password_token=" + self.POST("password_token")
                url += "&uid=" + self.POST("uid")
                self.redirect(url)
        else:
            error = "Please fill all required fields."
            error_message(self, error)
            self.redirect("/password/reset")