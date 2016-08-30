import datetime
from functions import wrap_response, success_message, uniquify
from decorators import api_logged_in_required
from google.appengine.datastore.datastore_query import Cursor
from application.handlers.base import BaseHandler
from application.models.user import User


class UsersApiHandler(BaseHandler):
    @api_logged_in_required(["SYSADMIN", "GEOSTOREADMIN"])
    def get(self, user_id=None):
        response = {
            "code": 200,
            "type": "List of users",
            "method": "GET",
            "response": "OK",
            "data": []
        }
        if self.request.get('check_email'):
            resp = {}
            resp['exist'] = False
            email = self.request.get('check_email').replace(' ', '+')
            resp['email'] = email
            user = User.query(User.current_email == email).get(keys_only=True)
            if user:
                resp['exist'] = True
            self.response.headers['Content-Type'] = 'application/json'
            self.response.write(json.dumps(resp))
        else:
            if user_id:
                response["type"] = "Get user data."
                user = User.get_by_id(int(user_id))
                if user:
                    response["data"] = {}
                    response["data"] = user.to_api_object(user_role=self.user.role,
                                                          level=self.user.level)
            else:
                query = User.query()
                query = query.order(User.last_name)
                if self.GET("cursor"):
                    curs = Cursor(urlsafe=self.GET("cursor"))
                    users, cursor, more = query.fetch_page(50, start_cursor=curs)
                else:
                    users, cursor, more = query.fetch_page(50)

                if users:
                    for user in users:
                        response["data"].append(
                            user.to_api_object(
                                user_role=self.user.role, level=self.user.level
                            )
                        )

                    if more:
                        response["cursor"] = cursor.urlsafe()

            wrap_response(self, response)

    @api_logged_in_required(["SYSADMIN", "GEOSTOREADMIN"])
    def post(self, data_id=None):
        response = {
            "code": 200,
            "type": "List of users",
            "method": "POST",
            "response": "OK",
            "data": []
        }
        if data_id:
            user = User.get_by_id(int(data_id))
            if self.POST("action") == "disable":
                response["type"] = "Disable user account."
                if user:
                    user.status = "DISABLED"
                    user.put()

                    response["data"] = user.to_api_object(
                        user_role=self.user.role, level=self.user.level)
                else:
                    response["code"] = 400
                    response["response"] = "ERROR"

                wrap_response(self, response)
                return

            if self.POST("action") == "approve":
                response["type"] = "Enable user account."
                if user:
                    user.status = "APPROVED"
                    user.approved_by_key = self.user.key
                    user.approved_by_name = self.user.name
                    user.approved_on = datetime.datetime.utcnow()
                    user.put()

                    response["data"] = user.to_api_object(
                        user_role=self.user.role, level=self.user.level)
                else:
                    response["code"] = 400
                    response["response"] = "ERROR"

                wrap_response(self, response)
                return

            if self.POST("action") == "enable":
                response["type"] = "Enable user account."
                if user:
                    user.status = "APPROVED"
                    user.put()

                    response["data"] = user.to_api_object(
                        user_role=self.user.role, level=self.user.level)
                else:
                    response["code"] = 400
                    response["response"] = "ERROR"

                wrap_response(self, response)
                return
            elif self.POST("action") == "update":
                if user:
                    if self.POST("first_name"):
                        user.first_name = self.POST("first_name")

                    if self.POST("middle_name"):
                        user.middle_name = self.POST("middle_name")

                    if self.POST("last_name"):
                        user.last_name = self.POST("last_name")

                    if self.POST("role"):
                        user.level = int(self.POST("role"))
                        if user.level == 2:
                            user.role = 'CLUSTERDIRECTOR'
                        elif user.level == 3:
                            user.role = 'AGENCYADMIN'
                        elif user.level == 4:
                            user.role = 'GEOSTOREADMIN'
                        else:
                            user.role = 'USER'

                    if self.POST("email"):
                        user.current_email = self.POST("email").strip().lower()
                        user.email_list.append(user.current_email)

                    if self.POST("access_key"):
                        access_key = ["PUBLIC"]
                        for key in self.POST("access_key").split(","):
                            if key:
                                access_key.append(key.upper().strip())

                        user.access_key = uniquify(access_key)

                    user.put()
                    msg = "User has been updated."
                    success_message(self, msg)

        self.redirect("/dashboard")
