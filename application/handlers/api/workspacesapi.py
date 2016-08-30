import time
import logging
from functions import wrap_response
from decorators import allowed_users
from google.appengine.ext import ndb
from application.handlers.base import BaseHandler
from application.models.workspace import Workspace

class WorkspacesApiHandler(BaseHandler):
    # @login_required
    def get(self, workspace_key_urlsafe=None):
        """
            Returns the list of workspaces of a logged in user
        """
        n = 50
        response = {
            "code": 200,
            "type": "List of geostore workspaces.",
            "method": "GET",
            "response": "OK",
            "data": []
        }

        if self.user:
            if workspace_key_urlsafe:
                workspace = Workspace.get_by_id(ndb.Key(urlsafe=workspace_key_urlsafe).id())
                if not workspace:
                    self.error(404)
                    return

                response['data'] = [workspace.to_object()]

            else:
                query = Workspace.query()
                query = query.filter(Workspace.users == self.user.key)
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
                    query = Workspace.query()
                    query = query.filter(Workspace.users == user)
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
            Creates an workspace.
        """

        workspace = Workspace()
        workspace.users = [self.user.key]
        workspace.title = self.request.get('title').strip().upper()
        workspace.put()

        time.sleep(2)  # Sleep to give time for datastore put to propagate

        self.redirect('/api/v1/workspaces/' + str(workspace.key.urlsafe()))