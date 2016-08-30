import time
import logging
from functions import wrap_response
from decorators import allowed_users
from google.appengine.ext import ndb
from application.handlers.base import BaseHandler
from application.models.environment import Environment

class EnvironmentsApiHandler(BaseHandler):
    # @login_required
    def get(self, environment_key_urlsafe=None):
        """
            Returns the list of environments of a logged in user
        """
        n = 50
        response = {
            "code": 200,
            "type": "List of geostore environments.",
            "method": "GET",
            "response": "OK",
            "data": []
        }

        if self.user:
            if environment_key_urlsafe:
                environment = Environment.get_by_id(ndb.Key(urlsafe=environment_key_urlsafe).id())
                if not environment:
                    self.error(404)
                    return

                response['data'] = [environment.to_object()]

            else:
                query = Environment.query()
                query = query.filter(Environment.users == self.user.key)
                if self.GET("cursor"):
                    curs = Cursor(urlsafe=self.GET("cursor"))
                    data, cursor, more = query.fetch_page(n, start_cursor=curs)
                else:
                    data, cursor, more = query.fetch_page(n)

                if data:
                    response["cursor"] = ""
                    for d in data:
                        try:
                            response["data"].append(d.to_object())
                        except Exception as e:
                            logging.exception(e)

                    if more:
                        response["cursor"] = cursor.urlsafe()
        else:
            if self.GET('user'):
                user = ndb.Key('User', int(self.GET('user')))
                if user.get():
                    query = Environment.query()
                    query = query.filter(Environment.users == user)
                    if self.GET("cursor"):
                        curs = Cursor(urlsafe=self.GET("cursor"))
                        data, cursor, more = query.fetch_page(n, start_cursor=curs)
                    else:
                        data, cursor, more = query.fetch_page(n)

                    if data:
                        response["cursor"] = ""
                        for d in data:
                            try:
                                response["data"].append(d.to_object())
                            except Exception as e:
                                logging.exception(e)

                        if more:
                            response["cursor"] = cursor.urlsafe()

        wrap_response(self, response)


    @allowed_users(['SYSADMIN', 'CLUSTERDIRECTOR'])
    def post(self):
        """
            Creates an environment.
        """

        environment = Environment()
        environment.users = [self.user.key]
        environment.title = self.request.get('title').strip().upper()
        environment.put()

        time.sleep(2)  # Sleep to give time for datastore put to propagate

        self.redirect('/api/v1/environments/' + str(environment.key.urlsafe()))