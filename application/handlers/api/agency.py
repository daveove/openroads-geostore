import json
from google.appengine.datastore.datastore_query import Cursor
from application.handlers.base import BaseHandler
from application.models.agency import Agency
from decorators import login_required


class AgencyAPIHandler(BaseHandler):
    @login_required
    def get(self):
        """
            Get all agencies stored in the Datastore via an API call.
            User must be Geostore Admin to retrieve results.
            n - Number of agencies to be fetched. Can be adjusted
                with the 'n' argument. Defaults to 50 if n is greater than
                100 or less than 1.
            cursor - The next page to be fetched.
            callback - If served via Javascript, this returns a function
                       passing the results as a parameter.
        """
        response = {}
        self.response.headers['Content-Type'] = 'application/json'
        if self.user:
            if self.user.level < 4:
                if self.request.get('callback'):
                    callback = self.request.get('callback')
                    response = callback + '(' + json.dumps(response) + ')'
                    self.response.write(response)
                else:
                    self.response.write(json.dumps(response))
                return
        query = Agency.query()
        n = 50
        if self.request.get('n'):
            try:
                n = int(self.request.get('n'))
            except:
                response['code'] = 500
                response['message'] = ('Number of results is not a valid'
                                       ' integer.')
                if self.request.get('callback'):
                    callback = self.request.get('callback')
                    response = callback + '(' + json.dumps(response) + ')'
                    self.response.write(response)
                else:
                    self.response.write(json.dumps(response))
                    return
        if self.request.get('cursor'):
            try:
                cursor = Cursor(urlsafe=self.request.get('cursor'))
                agencies, cursor, more = query.fetch_page(n,
                                                          start_cursor=cursor)
            except:
                response['code'] = 500
                response['message'] = 'Invalid cursor given.'
                if self.request.get('callback'):
                    callback = self.request.get('callback')
                    response = callback + '(' + json.dumps(response) + ')'
                    self.response.write(response)
                else:
                    self.response.write(json.dumps(response))
                return
        else:
            agencies, cursor, more = query.fetch_page(n)
        response['code'] = 200
        response['message'] = 'List of Geostore Agencies'
        response['data'] = []
        for agency in agencies:
            response['data'].append(agency.to_api_object())
        if self.request.get('callback'):
            callback = self.request.get('callback')
            response = callback + '(' + json.dumps(response) + ')'
            self.response.write(response)
        else:
            self.response.write(json.dumps(response))
        return
