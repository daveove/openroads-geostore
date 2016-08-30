import json
from application.handlers.base import BaseHandler
from google.appengine.datastore.datastore_query import Cursor
from google.appengine.ext import ndb
from application.models.apidata import APIData

class ChangeCOAFlagHandler(BaseHandler):
    def post(self):
        if self.request.get('auth') == 'bd2c952a4b2febc39b81c967cd8556cd':
            response = {}
            response['cursor'] = ''
            query = APIData.query()
            query = query.filter(APIData.indexed_data == 'TYPE->PROJECT')
            query = query.filter(APIData.indexed_data == 'COA->0')
            n = 20
            if self.request.get('n'):
                n = int(self.request.get('n'))
            if self.GET("cursor"):
                curs = Cursor(urlsafe=self.request.get("cursor"))
                data, cursor, more = query.fetch_page(n, start_cursor=curs)
            else:
                data, cursor, more = query.fetch_page(n)
            things_to_put = []
            for d in  data:
                d.additional_data['coa'] = '0'
                things_to_put.append(d)
            if things_to_put:
                ndb.put_multi(things_to_put)
            response['cursor'] = cursor.urlsafe()
            self.response.headers['Content-Type'] = 'application/json'
            self.response.write(json.dumps(response))