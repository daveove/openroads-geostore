import urllib
import time
import datetime
import logging
from models import Nonce, LoginCode, Token
from settings import RESPONSE
from application.handlers.base import BaseHandler

class VerifyLoginCode(BaseHandler):
    def post(self, code=None):
        response = RESPONSE.copy()
        if not code:
            desc = "There is/are missing parameters in the request."
            response["response"] = "MissingParameters"
            response["description"] = desc
            response["code"] = 463

        if "X-Signature" in self.request.headers:
            c_sig = self.request.headers['X-Signature']
            s_data = "&".join([
                "POST",
                urllib.quote(self.request.uri),
                urllib.quote(self.request.body)
            ])
            s_sig = generate_signature(LOGIN_KEY, s_data)
            logging.info("v: " + s_sig)
            if c_sig == s_sig:
                try:
                    body = json.loads(self.request.body)
                except:
                    desc = "The request body is not in a valid JSON format."
                    response["response"] = "InvalidJSONFormat"
                    response["description"] = desc
                    response["code"] = 406
                else:
                    if "nonce" in body and "timestamp" in body:
                        new = False
                        nn = Nonce.get_by_id(body["nonce"])
                        if nn:
                            expiry = datetime.datetime.now()
                            expiry = int(time.mktime(expiry.timetuple()))
                            expiry -= int(nn.timestamp)
                            expiry /= 60
                            expiry /= 60
                            if expiry <= 10:
                                new = True
                            else:
                                desc = "This request seems to be expired already"
                                response["response"] = "RequestExpired"
                                response["description"] = desc
                                response["code"] = 464
                        else:
                            n = Nonce(id=body["nonce"])
                            n.nonce = body["nonce"]
                            n.timestamp = int(body["timestamp"])
                            n.put()
                            new = True

                        if new:
                            logincode = LoginCode.get_by_id(str(code))
                            if logincode:
                                s = logincode.session.get()
                                if s.expires >= datetime.datetime.now():
                                    user = s.owner.get()
                                    if user:
                                        t_id = generate_uuid() + generate_uuid()
                                        token = Token(id=t_id)
                                        token.token = t_id
                                        token.session = s.key
                                        token.token_type = "api"
                                        token.put()
                                        response = user.to_object(token=t_id)
                                        response["response"] = "Successful"
                                        response["expires"] = time.mktime(s.expires.timetuple())
                                        response["code"] = 200
                                    else:
                                        s.status = False
                                        s.put()
                                        response["response"] = "UserUnavailable"
                                        response["description"] = "This user seems to be unavailable"
                                        response["code"] = 404
                                else:
                                    response["response"] = "SessionExpired"
                                    response["description"] = "This session seems to be expired already"
                                    response["code"] = 465
                            else:
                                response["response"] = "LoginCodeDoesNotExist"
                                response["description"] = "This login code does not exist."
                                response["code"] = 404
                    else:
                        response["response"] = "MissingParameters"
                        response["description"] = "There is/are missing parameters in the request."
                        response["code"] = 463
            else:
                response["response"] = "InvalidSignature"
                response["description"] = "The request signature is invalid or has been tampered."
                response["code"] = 460
        else:
            response["response"] = "MissingParameters"
            response["description"] = "There is/are missing parameters in the request."
            response["code"] = 463

        wrap_response(self,response)

    def get(self, code=None):
        response = RESPONSE.copy()
        response["response"] = "UnsupportedMethodError"
        response["description"] = "The GET method is not supported for this endpoint. Use POST instead."
        response["code"] = 405
        wrap_response(self,response)

    def put(self, code=None):
        response = RESPONSE.copy()
        response["response"] = "UnsupportedMethodError"
        response["description"] = "The PUT method is not supported for this endpoint. Use POST instead."
        response["code"] = 405
        wrap_response(self, response)

    def delete(self, code=None):
        response = RESPONSE.copy()
        response["response"] = "UnsupportedMethodError"
        response["description"] = "The DELETE method is not supported for this endpoint. Use POST instead."
        response["code"] = 405
        wrap_response(self, response)