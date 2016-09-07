import urllib
import logging
from sessions import SessionHandler
from settings import *
from cookie import *
from functions import hp, error_message, generate_token
from application.handlers.base import BaseHandler
from application.models.user import User


class LoginHandler(BaseHandler):
    def get(self):
        """
            Handles the /login endpoint
        """
        if self.user:
            self.redirect("/viewer")
        else:
            self.tv['page_login'] = True
            if self.GET("redirect"):
                self.tv["redirect"] = self.GET("redirect")

            if not get_cookie(self, name="_erm_") and not get_cookie(self, name="_scm_"):
                self.tv['info'] = 'Welcome to the Geostore! If you already have an approved account, please login to your account below. Otherwise, please Register for an account.'

            self.render("login.html")

    def post(self):
        """
            Handles the /login endpoint.
            Logs in users.
        """
        if self.POST("email") and self.POST("password"):
            url = "/login"
            redirect = None
            email = self.POST("email").strip().lower()
            query = User.query()
            query = query.filter(User.current_email == email)
            user = query.get()

            if self.POST("redirect"):
                redirect = urllib.quote(self.POST("redirect"))
                url += "?redirect=" + str(redirect)

            if not user:
                error = "Invalid email or password."
                error_message(self, error)
                self.redirect(url)
                return

            if user.hashed_password:
                if not user.verify_password(self.POST("password")):
                    error = "Invalid email or password."
                    error_message(self, error)
                    self.redirect(url)
                    return
            else:
                password = hp(email=email, password=self.POST("password"))
                if user.password != password:
                    error = "Invalid email or password."
                    error_message(self, error)
                    self.redirect(url)
                    return
                else:
                    user.hashed_password = user.hash_password(self.POST("password"))
                    user.put()

            if user.status == "PENDING":
                error = "Your account has not been verified. "
                error += "Please verify your account by opening the "
                error += "verification email we sent you. "
                error_message(self, error)
                self.redirect(url)
                return

            if user.status == "DISABLED":
                error = "Your account has been disabled. "
                error += "Please contact the Geostore Admin."
                error_message(self, error)
                self.redirect(url)
                return

            if user.role in ["AGENCYADMIN", "USER"]:
                if user.status == "VERIFIED":
                    error = "Your account is still pending approval. "
                    error += "Once your account is approved, you will be able "
                    error += "to login. You will receive an email once your "
                    error += "account is approved."
                    error_message(self, error)
                    self.redirect(url)
                    return

                if user.status == "DISAPPROVED":
                    error = "Your account has been disapproved. "
                    error += "Please contact the Geostore Admin."
                    error_message(self, error)
                    self.redirect(url)
                    return

            user.csrf_token = generate_token()
            session = SessionHandler(user)
            session.login()
            code = session.generate_login_code()
            if self.POST("redirect"):
                self.redirect(urllib.unquote(str(self.POST("redirect"))))
            else:
                self.redirect("/dashboard")
            return

        error = "Please enter your email and password."
        error_message(self, error)
        self.redirect("/login")