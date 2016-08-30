import json
from functions import normalize_id, wrap_response
from google.appengine.ext import ndb
from application.handlers.base import BaseHandler
from models import RedFlag

class RedFlagsHandler(BaseHandler):
    def get(self):
        response = {
            "code": 200,
            "type": "List of Red Flags.",
            "method": "GET",
            "response": "OK",
            "data": []
        }

        if not self.request.get('dataset_id'):
            self.error(400)
            return

        dataset_key = ndb.Key('APIData', normalize_id(self.request.get('dataset_id')))

        redflags = RedFlag.query(RedFlag.links == dataset_key).fetch(50)

        redflag_objects = []

        for redflag in redflags:
            redflag_objects.append(redflag.to_object())

        response['data'] = redflag_objects

        if self.GET("callback"):
            callback = self.GET("callback")
            d = json.dumps(response)

            self.response.out.write(callback + "(" + d + ");")
        else:
            wrap_response(self, response)