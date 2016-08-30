import urllib
import logging
from google.appengine.api import taskqueue
from mandrill_email import send_email
from functions import success_message, error_message
from application.handlers.base import BaseHandler
from application.models.teams import Teams
from application.models.user import User

class VerifyRegisterHandler(BaseHandler):
    def get(self):
        """
            Handles the /register/verify endpoint.
            Verifies user registration.
        """
        if self.user:
            self.redirect("/dashboard")
        else:
            if self.GET("token") and self.GET("uid"):
                user = User.get_by_id(int(self.GET("uid")))
                logging.debug(user)
                if user:
                    if user.status == "PENDING":
                        if user.confirmation_token == self.GET("token"):
                            user.status = "VERIFIED"
                            user.put()

                            # find teams and add it
                            teams = Teams.query(Teams.invited_users == user.current_email).fetch(10)
                            for team in teams:
                                user.access_key.append(str(team.key.id()))
                                user.teams.append(str(team.key.id()))
                                user.put()

                                team.members.append(str(user.key.id()))
                                team.invited_users.remove(user.current_email)
                                team.put()

                            content = {
                                "receiver_name": user.first_name,
                                "receiver_email": user.current_email,
                                "subject": "Account Verified",
                                "email_type": "after_verify"
                            }

                            taskqueue.add(
                                url="/tasks/email/send",
                                params=content,
                                method="POST")

                            success = "Your account has been verified and pending approval. "
                            success += "You will receive an email once your account is approved."
                            success_message(self, success)
                            if self.GET("r"):
                                url = "/login/authorize?r="
                                url += urllib.quote(self.GET("r"))
                                self.redirect(url)
                            else:
                                self.redirect("/login")
                        else:
                            msg = "You might have clicked a broken or expired link."
                            error_message(msg)
                            self.redirect("/register")
                    elif user.status == "INVITE" and user.role == "OPENDATAADMIN":
                        self.tv["token"] = self.GET("token")
                        self.tv["uid"] = self.GET("uid")
                        self.tv["email"] = user.current_email
                        self.render("register-opendataadmin.html")
                    elif user.status == "VERIFIED":
                        success = "Your account is already verified and pending approval. "
                        success += "You will receive an email once your account is approved."
                        success_message(self, success)
                        self.redirect("/login")
                    else:
                        error = "You may have clicked an expired link "
                        error += "or mistyped the address."
                        error_message(self, error)
                        if self.GET("r"):
                            url = "/login/authorize?r="
                            url += urllib.quote(self.GET("r"))
                            self.redirect(url)
                        else:
                            self.redirect("/login")
                else:
                    error = "Sorry, we couldn't process your request. "
                    error += "Please try again."
                    error_message(self, error)
                    self.redirect("/register")
            else:
                self.redirect("/register")