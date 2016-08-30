import os
import logging
from zipfile import ZipFile
from application.handlers.base import BaseHandler
from google.appengine.api import urlfetch, app_identity
from decorators import login_required
try:
    from cStringIO import StringIO
except:
    from StringIO import StringIO


class ViewerHandler(BaseHandler):
    @login_required
    def get(self):
        self.tv['title'] = "Viewer"
        # self.tv['user'] = self.user.to_api_object()
        self.tv['version'] = os.environ['CURRENT_VERSION_ID']
        self.tv['app_url'] = app_identity.get_default_version_hostname()
        if 'localhost' in self.tv['app_url']:
            self.tv['app_url'] = 'openroads-geostore.appspot.com'
        elif 'staging' in self.tv['app_url']:
            self.tv['app_url'] = self.tv['version'].split('.')[0] + '.' + self.tv['app_url']
        if 'staging' in self.tv['app_url']:
            self.tv['app_url'] = 'http://' + self.tv['app_url']
        else:
            self.tv['app_url'] = 'https://' + self.tv['app_url']
        if self.request.get('project_id'):
            self.tv['project_id'] = self.request.get('project_id')
        self.render('2.0/viewer.html')

    @login_required
    def post(self):
        data = 'Error'
        url = self.request.get('url')
        if url.endswith('.kmz'):
            r = urlfetch.fetch(url)
            if r.status_code == 200:
                data = ZipFile(StringIO(r.content)).read('doc.kml')
        else:
            r = urlfetch.fetch(url)
            if r.status_code == 200:
                data = r.content
                logging.debug('CONTENT')
                logging.debug(data)
        self.response.headers['Cache-Control'] = 'public, max-age=360'
        self.response.headers['Pragma'] = 'Public'
        self.response.write(data)
