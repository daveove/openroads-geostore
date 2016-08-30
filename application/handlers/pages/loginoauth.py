import logging
import urllib
import datetime
from cookie import *
from functions import *
from models import LoginCode
from sessions import SessionHandler
from application.handlers.base import BaseHandler

# MODELS
from application.models.user import User

class LoginOauthHandler(BaseHandler):
    def get(self):
        self.tv["show_breadcrumb"] = False
        if self.user:
            session = SessionHandler().session
            query = LoginCode.query()
            query = query.filter(LoginCode.session == session.key)
            code = query.get()

            logging.info(query)
            logging.info(code)

            if self.GET("r"):
                if get_cookie(self, name="_lt_"):
                    self.tv["logged_in"] = True
                    url = urllib.unquote(self.GET("r"))
                    url_split = url.split("?")
                    logging.info(url_split)
                    base_url = url_split[0]
                    logging.info(base_url)
                    base_url += "?code=" + get_cookie(self, name="_lt_")
                    logging.info(base_url)

                    if len(url_split) > 1:
                        parameters = url_split[1]
                        logging.info(parameters)
                        # if "?" in parameters:
                        #     parameters.replace("?", "&")
                        #     logging.info(parameters)

                        # base_url += "&" + parameters
                        # logging.info(base_url)
                        for i in parameters.split("&"):
                            i = "=".join([i.split("=")[0], urllib.quote(i.split("=")[1])])

                            if "?" not in base_url:
                                base_url += "?" + i
                            else:
                                base_url += "&" + i

                    self.tv["verify_url"] = base_url
                    clear_cookie(self, name="_lt_")
                    self.tv["hide_footer"] = True
                    self.render("login-api.html")
                else:
                    if self.GET("w"):
                        self.tv["logged_in"] = True
                        self.tv["hide_footer"] = True
                        url = urllib.unquote(self.GET("r"))
                        url_split = url.split("?")
                        logging.info(url_split)
                        base_url = url_split[0]
                        logging.info(base_url)
                        base_url += "?code=" + code.login_code
                        logging.info(base_url)

                        if len(url_split) > 1:
                            parameters = url_split[1]
                            logging.info(parameters)
                            # if "?" in parameters:
                            #     parameters.replace("?", "&")
                            #     logging.info(parameters)

                            # base_url += "&" + parameters
                            # logging.info(base_url)
                            for i in parameters.split("&"):
                                i = "=".join([i.split("=")[0], urllib.quote(i.split("=")[1])])

                                if "?" not in base_url:
                                    base_url += "?" + i
                                else:
                                    base_url += "&" + i

                        self.tv["verify_url"] = base_url
                        self.render("login-api.html")
                    else:
                        url = urllib.unquote(self.GET("r"))
                        if code:
                            url += "?code=" + code.login_code

                        if len(url.split("?")) > 1:
                            if code:
                                url += "&" + urllib.quote(str(url.split("?")[1]))
                            else:
                                url += "?" + urllib.quote(str(url.split("?")[1]))

                        self.redirect(str(url))
            else:
                url = self.request.referer
                if code:
                    url += "?code=" + code.login_code

                if len(url.split("?")) > 1:
                    if code:
                        url += "&" + urllib.quote(str(url.split("?")[1]))
                    else:
                        url += "?" + urllib.quote(str(url.split("?")[1]))

                self.redirect(url)
            return
        else:
            if self.GET("admin"):
                self.tv["admin"] = True

            # Redirect URL from the login geostore button
            if self.GET("r"):
                self.tv["redirect"] = self.GET("r")
            else:
                self.tv["redirect"] = self.request.referer

            if self.GET("w"):
                self.tv["hide_footer"] = True
                self.render("login-api.html")
            else:
                self.render("login.html")

    def post(self):
        """
            Handles the /login endpoint.
            Logs in users.
        """
        url = "/login/authorize"

        if self.POST("email") and self.POST("password"):
            redirect = None
            email = self.POST("email").strip().lower()
            query = User.query()
            query = query.filter(User.current_email == email)
            user = query.get()

            if self.POST("redirect"):
                redirect = urllib.quote(self.POST("redirect"))
                if redirect:
                    url += "?r=" + str(redirect)

            if self.POST("login_window"):
                url += "?r=" + urllib.quote(self.POST("url"))
                url += "&w=popup"

            if not user:
                error = "Invalid email or password."
                error_message(self, error)
                self.redirect(url)
                return

            if user.verify_password(self.POST("password")):
                error = "Invalid email or password."
                error_message(self, error)
                self.redirect(url)
                return

            if user.status == "PENDING":
                error = "Your account has not been verified. "
                error += "Please verify your account by opening the "
                error += "verification email we sent you. "
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

            session = SessionHandler(user)
            session.login()

            code = session.generate_login_code()

            expires = datetime.datetime.now()
            expires += datetime.timedelta(hours=8)

            if not self.POST("login_window"):
                set_cookie(self, name="_ut_", value=code, expires=expires)

            if self.POST("redirect"):
                url = str(urllib.unquote(self.POST("redirect")))
            elif self.POST("login_window"):
                url = urllib.quote(self.POST("url"))
                url = "/login/authorize?r=" + url
                set_cookie(self, name="_lt_", value=code, expires=expires)
                self.redirect(url)
                return
            else:
                url = self.request.referer

            logging.info(url)

            if len(url.split("?")) > 1:
                url += "&code" + code
            else:
                url += "?code=" + code

            self.redirect(url)
            return

        error = "Please enter your email and password."
        error_message(self, error)
        self.redirect(url)