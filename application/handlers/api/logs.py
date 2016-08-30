import json
import csv
import urllib
import logging
import datetime
from decorators import login_required
from functions import wrap_response, create_indexed_tag
from google.appengine.ext import ndb
from google.appengine.datastore.datastore_query import Cursor
from application.handlers.base import BaseHandler
from application.models.sl import SL


class LogsHandler(BaseHandler):
    @login_required
    def get(self):
        """
            Handles the /api/v1/logs endpoint.
            Returns list of logs.
        """
        response = {
            "code": 200,
            "type": "List of geostore logs.",
            "method": "GET",
            "response": "OK",
            "data": []
        }

        # Default number of entities to be retrieved is 50.
        n = 150
        if self.GET("n"):
            n = int(self.GET("n"))
            # if the number of entities to be retrieved given is
            # greater than 100. Switch back to default which is 100
            if n > 500:
                n = 500

        query = SL.query()

        for arg in self.request.arguments():
            if arg.lower() == "callback" \
               or arg.lower() == "_" \
               or arg.lower() == "order" \
               or arg.lower() == "cursor" \
               or arg.lower() == "n" \
               or arg.lower() == "_search_" \
               or arg.lower() == "show_image_dates" \
               or arg.lower() == "start_updated_from" \
               or arg.lower() == "csv" \
               or arg.lower() == "start_created_from":
                continue

            ad_value = self.GET(arg)
            tag = create_indexed_tag(arg, ad_value)
            query = query.filter(SL.indexed_data == tag)

        query = query.order(-SL.created)

        logging.info(query)

        
        if self.GET("cursor"):
            curs = Cursor(urlsafe=self.GET("cursor"))
            data, cursor, more = query.fetch_page(n, start_cursor=curs)
        else:
            data, cursor, more = query.fetch_page(n)

        if data:
            response["cursor"] = ""

            data.reverse()
            previous = None
            for d in data:
                try:
                    response["data"].append(d.to_api_object(change_against=previous))
                    previous = d
                except Exception as e:
                    logging.debug(e)

            response["data"].reverse()

            if more:
                response["cursor"] = cursor.urlsafe()

        if self.GET("callback"):
            callback = self.GET("callback")
            d = json.dumps(response)

            self.response.out.write(callback + "(" + d + ");")
        else:
            wrap_response(self, response)

