#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os
import webapp2
from settings import *
from functions import *
from sessions import SessionHandler, force_logout
from request import global_vars
import datetime
import time
import base64
from cookie import clear_cookie
import urllib
import json as simplejson
import jinja2
from google.appengine.ext import ndb


jinja_environment = jinja2.Environment(
    loader=jinja2.FileSystemLoader('application/frontend/'), autoescape=True, trim_blocks=True)
jinja_environment.filters['to_date_format_only'] = to_date_format_only
jinja_environment.filters['format_add_comma'] = format_add_comma
jinja_environment.filters['format_add_comma_float'] = format_add_comma_float
jinja_environment.filters['format_percentage'] = format_percentage


class BaseHandler(webapp2.RequestHandler):
    def __init__(self, request=None, response=None):
        self.initialize(request, response)
        self.tv = {}
        self.tv["user"] = None
        self.tv["local"] = APP_IS_LOCAL
        self.tv["show_breadcrumb"] = True
        self.tv["show_add_dataset"] = True

        self.tv["v"] = os.environ.get('CURRENT_VERSION_ID')

        self.user = None
        self.GET = self.request.get
        self.POST = self.request.POST.get

        try:
            self.user = SessionHandler().owner
            global_vars.user = self.user
        except Exception, e:
            self.user = None

        if not self.user:
            if self.request.get('api_key') and self.request.get('api_key') == GEOSTORE_ADMIN_API_KEY:
                self.user = ndb.Key(urlsafe='ahRzfm9wZW5yb2Fkcy1nZW9zdG9yZXIRCxIEVXNlchiAgICAgICACgw').get()

        if self.user:
            self.tv["user"] = self.user.to_object()
            self.tv["role"] = 'User'
            if self.tv["user"]['level'] == 4:
                self.tv["role"] = 'Geostore Administrator'
            elif self.tv["user"]['level'] == 2:
                self.tv["role"] = 'Cluster/Regional Director'
            elif self.tv["user"]['level'] == 3:
                self.tv["role"] = 'Agency Administrator'


        # self.response.write('Hello world!')

    def render(self, template_path=None, force=False):
        self.tv["current_timestamp"] = time.mktime(
            datetime.datetime.now().timetuple())
        current_time = global_vars.datetime_now_adjusted
        self.tv["current_time"] = current_time
        self.tv["footer_year"] = current_time.strftime("%Y")
        self.response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        self.response.headers['Pragma'] = 'no-cache'
        self.response.headers['Expires'] = '0'

        if get_cookie(self, name="_erm_"):
            self.tv["error"] = base64.b64decode(get_cookie(self, name="_erm_"))
            clear_cookie(self, name="_erm_")

        if get_cookie(self, name="_scm_"):
            success = base64.b64decode(get_cookie(self, name="_scm_"))
            self.tv["success"] = success
            clear_cookie(self, name="_scm_")

        if not self.user:
            self.tv["csrf_token"] = generate_token()

            expires = datetime.datetime.now()
            expires += datetime.timedelta(minutes=5)
            set_cookie(
                self, name="_csrf_",
                value=str(self.tv["csrf_token"]),
                expires=expires)

        if self.request.get('json') or not template_path:
            self.tv['current_time'] = str(self.tv['current_time'])
            if self.request.get('callback'):
                callback = self.request.get('callback')
                self.response.out.write(callback + '(' + simplejson.dumps(self.tv) + ')')
                return
            self.response.out.write(simplejson.dumps(self.tv))
            return

        if self.GET("redirect"):
            self.tv["redirect"] = urllib.quote(urllib.unquote(self.GET("redirect")))

        template = jinja_environment.get_template(template_path)
        self.response.out.write(template.render(self.tv))