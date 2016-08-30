from functions import *
from cookie import clear_cookie, set_cookie, get_cookie
from application.handlers.base import BaseHandler

# MODELS
from application.models.user import User

class AdminRegisterHandler(BaseHandler):
    def get(self):
        """
            Currently using one registration form.
        """
        self.render('error404.html')
        """
        if self.user:
            self.redirect("/dashboard")
        else:
            self.tv["data"] = {}

            if self.GET("r"):
                self.tv["redirect"] = self.GET("r")

            if get_cookie(self, name="_rm_"):
                self.tv["data"] = json.loads(base64.b64decode(get_cookie(self, name="_rm_")))
                clear_cookie(self, name="_rm_")

            self.render("register-admin.html")
        """

    def post(self):
        """
        Currently using one registration form.

        json_data = {}
        for arg in self.request.arguments():
            json_data[arg] = self.POST(arg)

        if self.POST("salutation") and self.POST("first_name") \
           and self.POST("last_name") and self.POST("email") \
           and self.POST("email") and self.POST("department") \
           and self.POST("agency") and self.POST("region") \
           and self.POST("operating_unit") and self.POST("designation") \
           and self.POST("street_address") and self.POST("province") \
           and self.POST("city"):
            user_exist = User.check_user(email=self.POST("email"))
            if user_exist:
                if user_exist.role == "OPENDATAADMIN" \
                   and user_exist.status == "INVITE":
                    user = User.complete_opendata_admin_registration(
                        user=user_exist.key,
                        first_name=self.POST("first_name"),
                        last_name=self.POST("last_name"),
                        password=self.POST("password"),
                        mobile=self.POST("mobile_number"))

                    success = "Thank you for your registration. "
                    success += "You can now login."
                    success_message(self, success)
                    self.redirect("/login")
                    return
                else:
                    message = "Sorry, it looks like "
                    message += self.POST("email")
                    message += " belongs to an existing account."
                    error_message(self, message)
            else:
                try:
                    user = User.create_new_user(
                        salutation=self.POST("salutation"),  # REQUIRED
                        first_name=self.POST("first_name"),  # REQUIRED
                        last_name=self.POST("last_name"),  # REQUIRED
                        password=self.POST("password"),  # REQUIRED
                        email=self.POST("email"),  # REQUIRED
                        office_order_number=self.POST("office_order_number"),
                        department=self.POST("department"),
                        agency=self.POST("agency"),
                        region=self.POST("region"),
                        operating_unit=self.POST("operating_unit").split("->")[0],
                        uacs=self.POST("operating_unit").split("->")[1],
                        role="AGENCYADMIN",
                        middle_name=self.POST("middle_name"),
                        mobile=self.POST("mobile_number"),
                        designation=self.POST("designation"),
                        redirect=self.POST("redirect"))

                    success = "Thank you for your registration. "
                    success += "We sent you a verification email, "
                    success += "please open the email and verify your account "
                    success += "to complete the registration."
                    success_message(self, success)

                    if self.POST("redirect"):
                        url = "/login/authorize?r="
                        url += urllib.quote(self.POST("redirect"))
                        self.redirect(str(url))
                        return
                except Exception, e:
                    data = base64.b64encode(json.dumps(json_data))
                    set_cookie(self, name="_rm_", value=data)

                    error = "Sorry, we could not process your request."
                    error_message(self, error)
            # data = base64.b64encode(json.dumps(json_data))
            # set_cookie(self, name="_rm_", value=data)

            # error = "Sorry, we could not process your request."
            # error_message(self, error)
        elif self.POST("f_name") and self.POST("l_name") and self.POST("password") and self.POST("token") and self.POST("uid"):
            user = User.get_by_id(int(self.POST("uid")))
            if user:
                password = hp(user.original_email, self.POST("password"))
                user.first_name = self.POST("f_name").strip()
                user.last_name = self.POST("l_name").strip()
                user.name = " ".join([user.first_name, user.last_name])
                user.mobile_number = self.POST("mobile_number")
                user.previous_passwords.append(password)
                user.password = password
                user.status = "VERIFIED"
                user.put()

                session = SessionHandler(user)
                session.login()

                # find teams and add it
                teams = Teams.query(Teams.invited_users == user.current_email).fetch(10)
                for team in teams:
                    user.access_key.append(str(team.key.id()))
                    user.teams.append(str(team.key.id()))
                    user.put()

                    team.members.append(str(user.key.id()))
                    team.invited_users.remove(user.current_email)
                    team.put()

                success = "Your account has been saved."
                success_message(self, success)
                self.redirect("/dashboard")
                return
            else:
                data = base64.b64encode(json.dumps(json_data))
                set_cookie(self, name="_rm_", value=data)

                error = "Sorry, we could not process your request."
                error_message(self, error)
        else:
            data = base64.b64encode(json.dumps(json_data))
            set_cookie(self, name="_rm_", value=data)

            error = "Please fill all required fields."
            success_message(self, error)

        self.redirect("/admin/register")
        """