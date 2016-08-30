import json
import base64
from settings import *
from cookie import get_cookie, clear_cookie, set_cookie
from functions import error_message, success_message
from application.handlers.base import BaseHandler

# MODELS
from application.models.user import User
from application.models.usergroup import UserGroup
from application.models.agency import Agency

class RegisterHandler(BaseHandler):
    def get(self):
        """
            Handles the /register endpoint and PUBLIC
            user registration.
        """
        if self.user:
            self.redirect("/dashboard")
        else:
            self.tv['page_register'] = True
            self.tv["data"] = {}
            if get_cookie(self, name="_rm_"):
                self.tv["data"] = json.loads(base64.b64decode(get_cookie(self, name="_rm_")))
                clear_cookie(self, name="_rm_")

            if USER_REGISTER:
                if self.GET('ea'):
                    self.tv['user_email'] = base64.b64decode(self.GET('ea'))

                self.tv['agencies'] = Agency.query().fetch(100)

                self.render("register.html")
            else:
                url = "/admin/register"
                if self.GET("redirect"):
                    url += "?redirect="
                    url += self.GET("redirect")

                self.redirect(url)

    def post(self):
        """
            Handles the /register endpoint.
            ODTF registration.
        """
        json_data = {}
        for arg in self.request.arguments():
            json_data[arg] = self.POST(arg)

        if self.POST("first_name") and self.POST("last_name") \
           and self.POST("email") and self.POST("street_address") \
           and self.POST("province") and self.POST("city") \
           and self.POST("password") and self.POST("confirm_password"):
            user_exist = User.check_user(email=self.POST("email"))
            if user_exist:
                message = "Sorry, it looks like "
                message += self.POST("email")
                message += " belongs to an existing account. If this is yours, please login using your account."
                error_message(self, message)

                data = base64.b64encode(json.dumps(json_data))
                set_cookie(self, name="_rm_", value=data)
            else:
                user = User.create_new_user(
                    first_name=self.POST("first_name"),
                    middle_name=self.POST("middle_name"),
                    last_name=self.POST("last_name"),
                    street_address=self.POST("street_address"),
                    province=self.POST("province"),
                    city=self.POST("city"),
                    password=self.POST("password"),
                    mobile=self.POST("mobile_number"),
                    email=self.POST("email"),
                    office_order_number=self.POST('office_order_number'),
                    redirect=self.POST("redirect"))

                query = UserGroup.query()
                query = query.filter(UserGroup.invited_users == user.current_email)
                user_groups = query.fetch()

                if user_groups:
                    for group in user_groups:
                        if user.key not in group.users:
                            group.users.append(user.key)
                        if user.current_email in group.invited_users:
                            group.invited_users.remove(user.current_email)
                        group.put()

                        if group.key in user.user_groups:
                            user.user_groups.append(str(group.key.id()))
                            user.put()

                success = "Thank you for your registration. "
                success += "We sent you a verification email, "
                success += "please open the email and verify your account "
                success += "to complete the registration."
                success_message(self, success)
        else:
            message = "We were unable to create your account. "
            message += "Please fill in all required fields."
            error_message(self, message)

            data = base64.b64encode(json.dumps(json_data))
            set_cookie(self, name="_rm_", value=data)

        url = "/register"
        if self.POST("redirect"):
            url += "?redirect="
            url += self.POST("redirect")

        self.redirect(url)