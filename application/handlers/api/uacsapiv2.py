import json
from functions import wrap_response
from application.handlers.base import BaseHandler

class UACSAPIV2Handler(BaseHandler):
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
            "description": "",
            "data": []
        }

        if not self.GET("uacs_type"):
            response["response"] = "ERROR"
            response["desc"] = "Parameter uacs_type is required."
            wrap_response(self, response)
            return

        uacs_type = self.GET("uacs_type")
        if uacs_type.lower() not in ["funding source", "organization", "location", "pap", "object code"]:
            response["response"] = "ERROR"
            response["desc"] = "Invalid uacs_type: "+uacs_type+"."
            wrap_response(self, response)
            return

        if self.GET("uacs_code"):
            if uacs_type.lower() == "organization":
                if len(self.GET("uacs_code")) > 12 or len(self.GET("uacs_code")) == 0:
                    response["response"] = "ERROR"
                    response["desc"] = "Invalid uacs_code: "+self.GET("uacs_code")+"."
                    wrap_response(self, response)
                    return

        if uacs_type.lower() == "organization":
            uacs_json_file = json.load(open('uacs_organization.json'))


        uacs_code = self.GET("uacs_code")
        if uacs_type.lower() == "organization" and uacs_code:
            if len(uacs_code) == 2:
                if uacs_code in uacs_json_file:
                    response_json = uacs_json_file[uacs_code]
                    response["type"] = "Department"
                    response["description"] = "List of department agencies."
                    response["data"] = response_json
                else:
                    response["code"] = 404
                    response["response"] = "NOT FOUND"
            elif len(uacs_code) == 5:
                department_uacs = uacs_code[:2]
                if department_uacs in uacs_json_file:
                    if uacs_code in uacs_json_file[department_uacs]["AGENCY"]:
                        response_json = uacs_json_file[department_uacs]["AGENCY"][uacs_code]
                        response["type"] = "Agency"
                        response["description"] = "List of regions in a department agency."
                        response["data"] = response_json
                    else:
                        response["code"] = 404
                        response["response"] = "NOT FOUND"
                else:
                    response["code"] = 404
                    response["response"] = "NOT FOUND"
            elif len(uacs_code) == 7:
                department_uacs = uacs_code[:2]
                agency_uacs = uacs_code[:5]
                region_uacs = uacs_code
                if department_uacs in uacs_json_file:
                    if agency_uacs in uacs_json_file[department_uacs]["AGENCY"]:
                        if region_uacs in uacs_json_file[department_uacs]["AGENCY"][agency_uacs]["REGION"]:
                            response_json = uacs_json_file[department_uacs]["AGENCY"][agency_uacs]["REGION"][region_uacs]
                            response["type"] = "Region"
                            response["description"] = "Low level operating unit in a department agency region."
                            response["data"] = response_json
                        else:
                            response["code"] = 404
                            response["response"] = "NOT FOUND"
                    else:
                        response["code"] = 404
                        response["response"] = "NOT FOUND"
                else:
                    response["code"] = 404
                    response["response"] = "NOT FOUND"
            elif len(uacs_code) == 12:
                department_uacs = uacs_code[:2]
                agency_uacs = uacs_code[:5]
                region_uacs = uacs_code[:7]
                lower_lvl_op_unit_uacs = uacs_code
                if department_uacs in uacs_json_file:
                    if agency_uacs in uacs_json_file[department_uacs]["AGENCY"]:
                        if region_uacs in uacs_json_file[department_uacs]["AGENCY"][agency_uacs]["REGION"]:
                            if lower_lvl_op_unit_uacs in uacs_json_file[department_uacs]["AGENCY"][agency_uacs]["REGION"][region_uacs]["LOWER LEVEL OPERATING UNIT"]:
                                response_json = uacs_json_file[department_uacs]["AGENCY"][agency_uacs]["REGION"][region_uacs]["LOWER LEVEL OPERATING UNIT"][uacs_code]
                                response["type"] = "Lower Level Operating Unit"
                                response["description"] = "List of low level operating unit in a department agency region."
                                response["data"] = response_json
                            else:
                                response["code"] = 404
                                response["response"] = "NOT FOUND"
                        else:
                            response["code"] = 404
                            response["response"] = "NOT FOUND"
                    else:
                        response["code"] = 404
                        response["response"] = "NOT FOUND"
                else:
                    response["code"] = 404
                    response["response"] = "NOT FOUND"
            else:
                response["code"] = 404
                response["response"] = "NOT FOUND"
        else:
            department = ""
            agency = ""
            region = ""
            operating_unit = ""

            if self.GET('department'):
                department = self.GET('department').upper().strip()

            if self.GET('agency'):
                agency = self.GET('agency').upper().strip()

            if self.GET('region'):
                region = self.GET('region').upper().strip()

            if self.GET('operating_unit'):
                operating_unit = self.GET('operating_unit').upper().strip()

            response_json = []

            if department:
                if department in uacs_json_file:
                    if agency:
                        if agency in uacs_json_file[department]["AGENCY"]:
                            if region:
                                if region in uacs_json_file[department][agency]:
                                    response_json = uacs_json_file[department][agency][region]
                                else:
                                    response["code"] = 404
                                    response["response"] = "NOT FOUND"
                            else:
                                response_json = uacs_json_file[department]["AGENCY"][agency]
                        else:
                            response["code"] = 404
                            response["response"] = "NOT FOUND"
                    else:
                        response_json = uacs_json_file[department]
                else:
                    response["code"] = 404
                    response["response"] = "NOT FOUND"

            else:
                response_json = uacs_json_file

            response['data'] = response_json

        if self.GET("callback"):
            callback = self.GET("callback")
            d = json.dumps(response)

            self.response.out.write(callback + "(" + d + ");")
        else:
            wrap_response(self, response)