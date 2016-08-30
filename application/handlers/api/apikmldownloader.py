import json
from application.handlers.base import BaseHandler

class APIKMLDownloader(BaseHandler):
    def get(self):
        if self.request.get('project_code'):
            project_code = self.request.get('project_code')
            self.response.headers['Content-Type'] = 'application/json'
            self.response.write(json.dumps({'project_code': project_code}))