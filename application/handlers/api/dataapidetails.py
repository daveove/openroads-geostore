import json
import urllib
import logging
import datetime
import cloudstorage as gcs
from settings import API_KEY, BUCKET_NAME
from functions import normalize_id, wrap_response, create_tags, \
    create_indexed_tag, uniquify
from google.appengine.ext import blobstore
from google.appengine.api import taskqueue
from application.handlers.base import BaseHandler
from application.models.apidata import APIData
from application.models.user import User
from models import Token

class DataApiDetailsHandler(BaseHandler):
    def get(self, data_id=None):
        """
            Handles the /api/v1/data/[data_id] endpoint.
            Returns the details of the data_id provided.
        """
        response = {
            "code": 200,
            "type": "Data details.",
            "method": "GET",
            "response": "OK",
            "data": {}
        }

        try:
            data_id = int(data_id)
        except ValueError:
            data_id = str(data_id)
        except Exception as e:
            logging.exception(e)
            wrap_response(self, response)
            return

        data = APIData.get_by_id(normalize_id(data_id))
        if data:

            # TODO: Add check for authorization

            response["data"] = data.to_api_object()

            if self.request.get('show_environments'):
                public = False
                for environment_key in data.environment:
                    logging.debug(str(data.environment))
                    if environment_key.id() == 'PUBLIC':
                        public = True
                    else:
                        environment = environment_key.get()
                        if environment:
                            response["data"]["environment_object"] = environment.to_api_object()

                if public:
                    response["data"]["public"] = True
                else:
                    response["data"]["public"] = False

        if self.GET("callback"):
            callback = self.GET("callback")
            d = json.dumps(response)

            self.response.out.write(callback + "(" + d + ");")
        else:
            wrap_response(self, response)

    def post(self, data_id=None):
        response = {}
        response["success"] = True

        logging.info(self.request.headers)

        content_type = self.request.headers["Content_Type"]

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
            else:
                desc = "You must be logged in to use the API."
                if self.POST("r"):
                    url = urllib.unquote(str(self.POST("r")))
                else:
                    url = self.request.referer

                if url:
                    if "?" in url:
                        url = url.split("?")[0]

                    url += "?error=" + urllib.quote(desc)
                    self.redirect(url)

        if not data_id:
            desc = "ID is missing from the request."
            if content_type == "application/json":
                response["success"] = False
                response["response"] = "MissingParametersError"
                response["description"] = desc
                response["code"] = 400
                wrap_response(self, response)
            else:
                if self.POST("r"):
                    url = urllib.unquote(str(self.POST("r")))
                else:
                    url = self.request.referer

                if url:
                    if "?" in url:
                        url = url.split("?")[0]

                    url += "?error=" + urllib.quote(desc)
                    self.redirect(url)
            return

        data = APIData.get_by_id(normalize_id(data_id))
        if not data:
            desc = "Cannot find the package."
            if content_type == "application/json":
                response["success"] = False
                response["response"] = "InvalidIDError"
                response["description"] = desc
                response["code"] = 400
                wrap_response(self, response)
            else:
                if self.POST("r"):
                    url = urllib.unquote(str(self.POST("r")))
                else:
                    url = self.request.referer

                if url:
                    if "?" in url:
                        url = url.split("?")[0]

                    url += "?error=" + urllib.quote(desc)
                    self.redirect(url)
            return

        if data.archived:
            desc = "Cannot find the package."
            if content_type == "application/json":
                response["success"] = False
                response["response"] = "InvalidIDError"
                response["description"] = desc
                response["code"] = 400
                wrap_response(self, response)
            else:
                if self.POST("r"):
                    url = urllib.unquote(str(self.POST("r")))
                else:
                    url = self.request.referer

                if url:
                    if "?" in url:
                        url = url.split("?")[0]

                    url += "?error=" + urllib.quote(desc)
                    self.redirect(url)
            return

        desc = "There are missing parameters in your request."
        if content_type == "application/json":
            if not self.request.body:
                response["success"] = False
                response["response"] = "MissingParametersError"
                response["description"] = desc
                response["code"] = 400
                wrap_response(self, response)
                return

            try:
                body = json.loads(self.request.body)
            except Exception as e:
                logging.info(e)
                desc = "Invalid JSON format."
                response["success"] = False
                response["response"] = "InvalidJSONError"
                response["description"] = desc
                response["code"] = 400
                wrap_response(self, response)
                return

            tags = []

            try:
                for key, value in body.items():
                    try:
                        tags += create_tags(value)
                    except Exception as e:
                        logging.info("Cannot create tag from: ")
                        logging.info(e)
                    if key.startswith('unindexed_'):  # unindexed_
                        ad_key = key.replace("unindexed_", "")
                        data.additional_data[ad_key] = value.strip()

                    if key.startswith('indexed_'):
                        ad_key = key.replace("indexed_", "")
                        data.additional_data[ad_key] = value

                        for d in data.indexed_data:
                            ad_key = key.replace("indexed_", "")
                            if d.startswith(ad_key.upper()):
                                try:
                                    data.indexed_data.remove(d)
                                except Exception as e:
                                    logging.exception(e)
                                    logging.info("Cannot remove from list")

                        data.indexed_data.append(
                            create_indexed_tag(
                                key, value))
                if self.user:
                    data.username = self.user.name
                    data.user = self.user.key

                data.indexed_data = uniquify(data.indexed_data)
                data.tags = uniquify(tags)
                data.put()

                desc = "Data has been saved."
                response["success"] = True
                response["response"] = "Success"
                response["description"] = desc
                response["code"] = 200
                response["data"] = data.to_api_object()
                wrap_response(self, response)
            except Exception as e:
                logging.exception(e)
                desc = "A server error occured. Please try again later."
                response["success"] = False
                response["response"] = "ServerError"
                response["description"] = desc
                response["code"] = 500
                wrap_response(self, response)
        else:
            if not self.request.arguments():
                if self.POST("r"):
                    url = urllib.unquote(str(self.POST("r")))
                else:
                    url = self.request.referer

                if url:
                    if "?" in url:
                        url = url.split("?")[0]

                    url += "?error=" + urllib.quote(desc)
                    self.redirect(url)
                return

            tags = []

            try:
                for arg in self.request.arguments():
                    for d in data.indexed_data:
                        ad_key = arg.replace("indexed_", "")
                        if d.startswith(ad_key.upper()):
                            try:
                                data.indexed_data.remove(d)
                            except Exception as e:
                                logging.exception(e)
                                logging.info("Cannot remove from list")


                    if arg.startswith('unindexed_'):
                        ad_key = arg.replace("unindexed_", "")
                        ad_value = self.request.POST.get(arg)
                        data.additional_data[ad_key] = ad_value.strip()
                        try:
                            tags += create_tags(ad_value)
                        except Exception as e:
                            logging.info("Cannot create tag from: ")
                            logging.info(e)

                    if arg.startswith('indexed_'):
                        ad_key = arg.replace("indexed_", "")
                        ad_value = self.request.POST.get(arg)
                        data.additional_data[ad_key] = ad_value
                        try:
                            tags += create_tags(ad_value)
                        except Exception as e:
                            logging.info("Cannot create tag from: ")
                            logging.info(e)

                        data.indexed_data.append(
                            create_indexed_tag(
                                arg, self.request.POST.get(arg)))

                    if arg.startswith('file_'):
                        filename = BUCKET_NAME
                        filename += random_string(20) + "/"
                        ad_key = arg.replace("file_", "")
                        data.additional_data[ad_key] = {}
                        try:
                            # try:
                            file_name = self.request.POST.get(arg).filename
                            filename += file_name

                            gcs_file = gcs.open(
                                filename, 'w',
                                options={'x-goog-acl': 'public-read'})
                            gcs_file.write(self.request.get(arg))
                            gcs_file.close()

                            full_url = "https://storage.googleapis.com" + filename
                            # data.additional_data["file"]["file_url"] = full_url

                            data.file_url = full_url
                            data.additional_data[ad_key]["file_url"] = full_url

                            try:
                                blob_key = blobstore.create_gs_key("/gs" + filename)
                                data.serving_url = images.get_serving_url(blob_key)
                                data.additional_data[ad_key]["serving_url"] = data.serving_url
                                data.gcs_key = blobstore.BlobKey(blob_key)
                            except Exception as e:
                                logging.exception(e)
                                logging.error("not an image??")
                                data.additional_data[ad_key]["serving_url"] = full_url
                        except AttributeError, e:
                            logging.exception(e)
                            logging.exception("NO FILE ATTACHED")

                if self.user:
                    data.username = self.user.name
                    data.user = self.user.key

                data.indexed_data = uniquify(data.indexed_data)
                data.tags = uniquify(tags)
                data.put()

                desc = "Data has been updated."

                if self.POST("r"):
                    url = urllib.unquote(str(self.POST("r")))
                else:
                    url = self.request.referer

                if url:
                    if "?" in url:
                        url = url.split("?")[0]

                    url += "?success=" + urllib.quote(desc)
                    self.redirect(url)
                else:
                    response["success"] = True
                    response["response"] = "Success"
                    response["description"] = desc
                    response["code"] = 200
                    response["data"] = data.to_api_object()
                    wrap_response(self, response)
            except Exception as e:
                logging.exception(e)
                desc = "A server error occured. Please try again later."
                if self.POST("r"):
                    url = urllib.unquote(str(self.POST("r")))
                else:
                    url = self.request.referer

                if url:
                    if "?" in url:
                        url = url.split("?")[0]

                    url += "?error=" + urllib.quote(desc)
                    self.redirect(url)
                else:
                    response["success"] = False
                    response["response"] = "ServerError"
                    response["description"] = desc
                    response["code"] = 500
                    wrap_response(self, response)