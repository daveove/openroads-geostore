import json
import logging
from bs4 import BeautifulSoup
from functions import normalize_id, compute_kml_length, get_project_kmls
from application.handlers.base import BaseHandler
from application.models.apidata import APIData


class KMLLengthHandler(BaseHandler):
    def get(self):
        resp = {}
        if self.request.get('kml'):
            resp['data'] = compute_kml_length(self.request.get('kml'))
        if self.request.get('project'):
            if self.request.get('dataset'):
                resp['data'] = get_project_kmls(self.request.get('project'), self.request.get('dataset'))
            else:
                resp['data'] = get_project_kmls(self.request.get('project'))
        if self.request.get('callback'):
            callback = self.request.get('callback')
            self.response.write(callback + '(' + json.dumps(resp, ensure_ascii=False) + ');')
            return
        else:
            self.response.headers['Content-Type'] = 'application/json'
            self.response.write(json.dumps(resp, ensure_ascii=False))
