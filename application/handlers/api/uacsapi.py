import json
from functions import wrap_response
from application.handlers.base import BaseHandler

class UACSAPIHandler(BaseHandler):
    def get(self):
        """
            Handles the /api/v1/uacs endpoint.
            Returns list of uacs.
        """
        response = {
            "code": 200,
            "type": "",
            "method": "GET",
            "response": "OK",
            "data": []
        }

        department = ""
        agency = ""
        region = ""
        operating_unit = ""

        if self.request.get('department'):
            department = self.request.get('department').upper().strip()

        if self.request.get('agency'):
            agency = self.request.get('agency').upper().strip()

        if self.request.get('region'):
            region = self.request.get('region').upper().strip()

        if self.request.get('operating_unit'):
            operating_unit = self.request.get('operating_unit').upper().strip()

        uacs_json_file = json.load(open('uacs.json'))
        response_json = []

        if department:
            if department in uacs_json_file:
                if agency:
                    if agency in uacs_json_file[department]:
                        if region:
                            if region in uacs_json_file[department][agency]:
                                response_json = uacs_json_file[department][agency][region]
                            else:
                                response["code"] = 404
                                response["response"] = "NOT FOUND"
                        else:
                            response_json = sorted(uacs_json_file[department][agency].keys())
                    else:
                        response["code"] = 404
                        response["response"] = "NOT FOUND"
                else:
                    response_json = sorted(uacs_json_file[department].keys())
            else:
                response["code"] = 404
                response["response"] = "NOT FOUND"

        else:
            response_json = sorted(uacs_json_file.keys())

        response['data'] = response_json

        if self.GET("callback"):
            callback = self.GET("callback")
            d = json.dumps(response)

            self.response.out.write(callback + "(" + d + ");")
        else:
            wrap_response(self, response)