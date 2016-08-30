from functions import wrap_response, normalize_id, uniquify
from decorators import api_logged_in_required
from application.handlers.base import BaseHandler
from application.models.apidata import APIData

class DataApiPublishHandler(BaseHandler):
    def get(self, data_id=None):
        desc = "The GET method is not supported "
        desc += "for this endpoint."

        response = {}
        response["response"] = "UnsupportedMethodError"
        response["description"] = desc
        response["code"] = 405
        wrap_response(self, response)

    @api_logged_in_required
    def post(self, data_id=None):
        # TODO: Rewrite this for environments
        if not data_id:
            desc = "ID is missing from the request."
            response["success"] = False
            response["response"] = "MissingParametersError"
            response["description"] = desc
            response["code"] = 400
            wrap_response(self, response)
            return

        data = APIData.get_by_id(normalize_id(data_id))
        if not data:
            desc = "Cannot find the package."
            response["success"] = False
            response["response"] = "InvalidIDError"
            response["description"] = desc
            response["code"] = 400
            wrap_response(self, response)
            return

        if self.user.key != data.user:
            if not self.user.teams:
                msg = "You have insufficient rights to access this application."
                response["success"] = False
                response["response"] = "InvalidIDError"
                response["description"] = msg
                response["code"] = 400
                wrap_response(self, response)
                return

            has_access = False
            for team in self.user.teams:
                if team in data.access_lock:
                    has_access = True

            if not has_access:
                msg = "You have insufficient rights to access this application."
                response["success"] = False
                response["response"] = "InvalidIDError"
                response["description"] = msg
                response["code"] = 400
            else:
                data.access_lock.remove("PRIVATE")
                data.access_lock.append("PUBLIC")
                data.access_lock = uniquify(data.access_lock)
                data.put()

                msg = "The data has been published and is now public."
                response["success"] = True
                response["response"] = "Success"
                response["description"] = msg
                response["code"] = 200

        wrap_response(self, response)