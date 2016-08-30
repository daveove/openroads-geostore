import webapp2
import logging
import pickle
from google.appengine.api import urlfetch
from models import APIProxy

class APIProxyHandler(webapp2.RequestHandler):
    def get(self):
        url = self.request.get('url')
        try:
            response = urlfetch.fetch(url, deadline=50)
        except:
            logging.exception('error in fetching url: ' + url)

        content_headers = {}

        key = 'GET-' + url

        page = APIProxy.get_by_id(key)
        if page:
            try:
                fetch = pickle.loads(str(page.content))
                content_body = fetch.content
                content_status = fetch.status_code
                content_headers = fetch.headers
            except:
                logging.exception('overide pickle')
        else:
            fetch = urlfetch.fetch(url=url, method=urlfetch.GET, deadline=50)
            content_body = fetch.content
            content_status = fetch.status_code
            content_headers = fetch.headers
            if content_status < 400:
                try:
                    page = APIProxy(id=key)
                    if fetch:
                        content = pickle.dumps(fetch)
                        page.content = content
                        page.put()
                except:
                    logging.exception('error in putting fetched content')
            else:
                logging.error('error message: ' + content_body)
                self.error(content_status)

        for header in content_headers:
            self.response.headers[header] = content_headers[header]
        self.response.out.write(content_body)