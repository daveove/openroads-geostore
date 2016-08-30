import json
import urllib
import logging
import datetime
from settings import API_KEY
from functions import wrap_response, create_indexed_tag, write_to_api, \
    write_to_api_params
from google.appengine.ext import ndb
from google.appengine.datastore.datastore_query import Cursor
from application.handlers.base import BaseHandler
from application.models.apidata import APIData
from application.models.workspace import Workspace
from application.models.environment import Environment
from models import Token


class DataApiHandler(BaseHandler):
    def get(self):
        """
            Handles the /api/v1/data endpoint.
            Returns list of datasets.
        """
        response = {
            "code": 200,
            "type": "List of geostore saved data.",
            "method": "GET",
            "response": "OK",
            "data": []
        }

        # Default number of entities to be retrieved is 50.
        n = 50
        if self.GET("n"):
            n = int(self.GET("n"))
            # if the number of entities to be retrieved given is
            # greater than 100. Switch back to default which is 100
            if n > 100:
                n = 100

        query = APIData.query()
        query = query.filter(APIData.archived == False)

        if not self.user:
            if "Authorization" in self.request.headers:
                token = Token.get_by_id(self.request.headers["Authorization"])
                if not token:
                    logging.info("Cannot find token: " + str(self.request.headers["Authorization"]))
                    desc = "The token you provided is invalid."
                    response["success"] = False
                    response["response"] = "InvalidTokenError"
                    response["description"] = desc
                    response["code"] = 400
                    wrap_response(self, response)
                    return

                logging.info(token)
                session = token.session.get()
                if not session:
                    logging.info("Cannot find session")
                    desc = "The token has already expired."
                    response["error"] = False
                    response["response"] = "InvalidTokenError"
                    response["description"] = desc
                    response["code"] = 400
                    wrap_response(self, response)
                    return

                logging.info(session)
                if session.expires < datetime.datetime.now() or session.status is False:
                    logging.info("token has expired or not active")
                    desc = "The token has already expired."
                    response["success"] = False
                    response["response"] = "InvalidTokenError"
                    response["description"] = desc
                    response["code"] = 400
                    wrap_response(self, response)
                    return

                owner = session.owner.get()
                if not owner:
                    logging.info("Cannot find user")
                    desc = "Cannot find user."
                    response["success"] = False
                    response["response"] = "InvalidUserError"
                    response["description"] = desc
                    response["code"] = 400
                    wrap_response(self, response)
                    return

                self.user = owner
        if self.user and self.GET('workspace'):
            environment = ndb.Key(urlsafe=self.GET('workspace')).get()
            if environment:
                if self.user.key in environment.users:
                    environment_key = environment.key
                    query = query.filter(APIData.environment == environment_key)

        elif self.user and not self.GET('workspace') and (not self.GET('type') or not self.GET('type') in ['PROJECT', 'SUBPROJECT']):
            environments_user = Environment.query(Environment.users == self.user.key).fetch(keys_only=True)
            environments_user.append(ndb.Key('Environment', 'PUBLIC'))
            query = query.filter(APIData.environment.IN(environments_user)).order(APIData._key)

        else:
            query = query.filter(APIData.environment == ndb.Key('Environment', 'PUBLIC'))

        if self.GET("_search_"):
            response["type"] = "Search geostore saved data."
            response["query"] = self.GET("_search_")
            search = self.GET("_search_").strip().upper()
            query = query.filter(APIData.tags >= search)
            query = query.order(APIData.tags)
        else:
            for arg in self.request.arguments():
                if arg.lower() == "callback" \
                   or arg.lower() == "_" \
                   or arg.lower() == "order" \
                   or arg.lower() == "cursor" \
                   or arg.lower() == "n" \
                   or arg.lower() == "_search_" \
                   or arg.lower() == "show_image_dates" \
                   or arg.lower() == "start_updated_from" \
                   or arg.lower() == "start_created_from":
                    continue

                ad_value = self.GET(arg)
                tag = create_indexed_tag(arg, ad_value)
                query = query.filter(APIData.indexed_data == tag)

            if self.GET("order"):
                if self.GET("order").lower() in ["asc", "ascending"]:
                    query = query.order(APIData.updated_time)
                elif self.GET("order").lower() in ["desc", "descending"]:
                    query = query.order(-APIData.updated_time)
                elif self.GET("order").lower() == "created_asc":
                    query = query.order(APIData.created_time)
                elif self.GET("order").lower() == "created_desc":
                    query = query.order(-APIData.created_time)
                elif self.GET("order").lower() == "modified":
                    query = query.order(APIData.updated_time)
            else:
                query = query.order(-APIData.created_time)

            if self.GET("start_updated_from"):
                logging.debug(self.GET("start_updated_from"))
                if self.GET("order").lower() in ["desc", "descending"]:
                    query = query.filter(APIData.updated_time <= datetime.datetime.fromtimestamp(int(self.GET("start_updated_from"))))
                else:
                    query = query.filter(APIData.updated_time >= datetime.datetime.fromtimestamp(int(self.GET("start_updated_from"))))
            elif self.GET('start_created_from'):
                logging.debug(self.GET("start_created_from"))
                if self.GET("order").lower() in ["desc", "descending"]:
                    query = query.filter(APIData.created_time <= datetime.datetime.fromtimestamp(int(self.GET("start_created_from"))))
                else:
                    query = query.filter(APIData.created_time >= datetime.datetime.fromtimestamp(int(self.GET("start_created_from"))))

        logging.info(query)

        if self.GET("cursor"):
            curs = Cursor(urlsafe=self.GET("cursor"))
            data, cursor, more = query.fetch_page(n, start_cursor=curs)
        else:
            data, cursor, more = query.fetch_page(n)

        if data:
            response["cursor"] = ""

            for d in data:
                try:
                    response["data"].append(d.to_api_object())
                except Exception as e:
                    logging.exception(e)

            if more:
                response["cursor"] = cursor.urlsafe()

        if self.GET('show_image_dates'):
            if self.GET('type'):
                if self.GET('type').upper() == 'CLASSIFICATION':
                    if 'data' in response:
                        image_ids = []
                        for classification in response['data']:
                            image_ids.append(ndb.Key('APIData', int(classification['image_id'])))
                        images = ndb.get_multi(image_ids)
                        for image in images:
                            date = ''
                            image_latlng = image.additional_data['latlng']
                            if 'date' in image.additional_data:
                                date = image.additional_data['date']
                            else:
                                date = image.created_time.strftime('%Y:%m:%d %H:%M:%S')
                            for i in range(0, len(response['data'])):
                                if response['data'][i]['image_id'] == str(image.key.id()):
                                    response['data'][i]['image_date'] = date
                                    response['data'][i]['image_latlng'] = image_latlng

        if self.GET("callback"):
            callback = self.GET("callback")
            d = json.dumps(response)

            self.response.out.write(callback + "(" + d + ");")
        else:
            wrap_response(self, response)

    def post(self):
        """
            Handles the /api/v1/data endpoint.
            Creates a dataset.
        """
        owner = None

        response = {}
        response["success"] = True

        content_type = self.request.headers["Content_Type"] or self.request.headers["Content-Type"]
        if not self.user:
            if content_type == "application/json":
                if "Authorization" not in self.request.headers:
                    logging.info("No Authorization in headers")
                    desc = "You must be logged in to use the API."
                    response["success"] = False
                    response["response"] = "AuthorizationError"
                    response["description"] = desc
                    response["code"] = 400
                    wrap_response(self, response)
                    return

                if self.request.headers["Authorization"] == API_KEY:
                    if not self.request.headers["From"]:
                        logging.info("No email defined")
                        desc = "Cannot find user."
                        response["success"] = False
                        response["response"] = "InvalidUserError"
                        response["description"] = desc
                        response["code"] = 400
                        wrap_response(self, response)
                        return

                    user_email = self.request.headers["From"].lower()
                    query = User.query()
                    owner = query.filter(User.current_email == user_email).get()
                    if not owner:
                        logging.info("Cannot find user")
                        desc = "Cannot find user."
                        response["success"] = False
                        response["response"] = "InvalidUserError"
                        response["description"] = desc
                        response["code"] = 400
                        wrap_response(self, response)
                        return
                else:
                    token = Token.get_by_id(self.request.headers["Authorization"])
                    if not token:
                        logging.info("Cannot find token: " + str(self.request.headers["Authorization"]))
                        desc = "The token you provided is invalid."
                        response["success"] = False
                        response["response"] = "InvalidTokenError"
                        response["description"] = desc
                        response["code"] = 400
                        wrap_response(self, response)
                        return

                    logging.info(token)
                    session = token.session.get()
                    if not session:
                        logging.info("Cannot find session")
                        desc = "The token has already expired."
                        response["error"] = False
                        response["response"] = "InvalidTokenError"
                        response["description"] = desc
                        response["code"] = 400
                        wrap_response(self, response)
                        return

                    logging.info(session)
                    if session.expires < datetime.datetime.now() or session.status is False:
                        logging.info("token has expired or not active")
                        desc = "The token has already expired."
                        response["success"] = False
                        response["response"] = "InvalidTokenError"
                        response["description"] = desc
                        response["code"] = 400
                        wrap_response(self, response)
                        return

                    owner = session.owner.get()
                    if not owner:
                        logging.info("Cannot find user")
                        desc = "Cannot find user."
                        response["success"] = False
                        response["response"] = "InvalidUserError"
                        response["description"] = desc
                        response["code"] = 400
                        wrap_response(self, response)
                        return
            else:
                if "Authorization" in self.request.headers:
                    token = Token.get_by_id(self.request.headers["Authorization"])
                    if not token:
                        logging.info("Cannot find token: " + str(self.request.headers["Authorization"]))
                        desc = "The token you provided is invalid."
                        response["success"] = False
                        response["response"] = "InvalidTokenError"
                        response["description"] = desc
                        response["code"] = 400
                        wrap_response(self, response)
                        return

                    logging.info(token)
                    session = token.session.get()
                    if not session:
                        logging.info("Cannot find session")
                        desc = "The token has already expired."
                        response["error"] = False
                        response["response"] = "InvalidTokenError"
                        response["description"] = desc
                        response["code"] = 400
                        wrap_response(self, response)
                        return

                    logging.info(session)
                    if session.expires < datetime.datetime.now() or session.status is False:
                        logging.info("token has expired or not active")
                        desc = "The token has already expired."
                        response["success"] = False
                        response["response"] = "InvalidTokenError"
                        response["description"] = desc
                        response["code"] = 400
                        wrap_response(self, response)
                        return

                    owner = session.owner.get()
                    if not owner:
                        logging.info("Cannot find user")
                        desc = "Cannot find user."
                        response["success"] = False
                        response["response"] = "InvalidUserError"
                        response["description"] = desc
                        response["code"] = 400
                        wrap_response(self, response)
                        return
                else:
                    desc = "You must be logged in to use the API."
                    if self.POST("r"):
                        url = urllib.unquote(str(self.POST("r")))
                        if "?" in url:
                            url = url.split("?")[0]

                            url += "?error=" + urllib.quote(desc)
                            self.redirect(url)
                    else:
                        logging.info("User is not logged in")
                        desc = "You must be logged in to use the api."
                        response["success"] = False
                        response["response"] = "InvalidRequestError"
                        response["description"] = desc
                        response["code"] = 400
                        wrap_response(self, response)
                    return
        else:
            owner = self.user

        logging.debug(content_type)

        if content_type == 'application/json':
            # d = write_to_api(json.loads(self.request.body), owner, content_type)
            d = write_to_api(json.loads(self.request.body), owner)
        else:
            d = write_to_api_params(self.request.arguments(), owner, content_type, False, self)

        wrap_response(self, d.to_api_object())