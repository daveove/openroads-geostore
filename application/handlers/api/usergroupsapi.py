import logging
from functions import wrap_response
from google.appengine.datastore.datastore_query import Cursor
from application.handlers.base import BaseHandler
from application.models.usergroup import UserGroup


class UserGroupsApiHandler(BaseHandler):
    def get(self, user_group_id=None):
        """
            Returns the list of environments of a logged in user
        """
        n = 50
        response = {
            "code": 200,
            "type": "List of geostore environments.",
            "method": "GET",
            "response": "OK",
            "data": [],
            'cursor': ''
        }

        if self.user:
            if user_group_id:
                user_group = UserGroup.get_by_id(int(user_group_id))
                if not user_group:
                    self.error(404)
                    return

                response['data'] = [user_group.to_object()]

            else:
                query = UserGroup.query()
                query = query.filter(UserGroup.owner == self.user.key)
                if self.GET("cursor"):
                    curs = Cursor(urlsafe=self.GET("cursor"))
                    data, cursor, more = query.fetch_page(n, start_cursor=curs)
                else:
                    data, cursor, more = query.fetch_page(n)

                if data:
                    for d in data:
                        try:
                            response["data"].append(d.to_object())
                        except Exception as e:
                            logging.exception(e)

                    if more:
                        response["cursor"] = cursor.urlsafe()

        wrap_response(self, response)
