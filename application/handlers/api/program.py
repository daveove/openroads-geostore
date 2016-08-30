import json
import logging
from decorators import login_required
from application.handlers.base import BaseHandler
from google.appengine.datastore.datastore_query import Cursor
from application.models.program import Program


class ProgramAPIHandler(BaseHandler):
    @login_required
    def get(self, agency=None):
        """
            Get all programs stored in the Datastore via an API call.
            n - Number of agencies to be fetched. Can be adjusted
                with the 'n' argument. Defaults to 50 if n is greater than
                100 or less than 1.
            cursor - The next page to be fetched.
            callback - If served via Javascript, this returns a function
                       passing the results as a parameter.
            agency - The agency ID of the specific programs to be fetched.
        """
        response = {}
        self.response.headers['Content-Type'] = 'application/json'
        if not self.user:
            response['message'] = 'You are not logged in.'
            response['code'] = 403
            self.response.set_status(403)
            if self.request.get('callback'):
                callback = self.request.get('callback')
                response = callback + '(' + json.dumps(response) + ')'
                self.response.write(response)
            else:
                self.response.write(json.dumps(response))
            return
        query = Program.query()
        n = 50
        if self.request.get('n'):
            try:
                n = int(self.request.get('n'))
            except Exception as e:
                logging.debug(e)
                response['code'] = 500
                response['message'] = ('Number of results is not a valid'
                                       ' integer.')
                self.response.set_status(500)
                if self.request.get('callback'):
                    callback = self.request.get('callback')
                    response = callback + '(' + json.dumps(response) + ')'
                    self.response.write(response)
                else:
                    self.response.write(json.dumps(response))
                return
        if agency:
            try:
                agency = int(agency)
            except Exception as e:
                logging.debug(e)
                response['code'] = 500
                response['message'] = 'Agency ID is not a valid integer.'
                if self.request.get('callback'):
                    callback = self.request.get('callback')
                    response = callback + '(' + json.dumps(response) + ')'
                    self.response.write(response)
                else:
                    self.response.write(json.dumps(response))
                return
            logging.debug(agency)
            query = query.filter(Program.agency == agency)
        if self.request.get('cursor'):
            try:
                cursor = Cursor(urlsafe=self.request.get('cursor'))
                programs, cursor, more = query.fetch_page(n,
                                                          start_cursor=cursor)
            except Exception as e:
                logging.debug(e)
                response['code'] = 500
                response['message'] = 'Invalid cursor given.'
                self.response.set_status(500)
                if self.request.get('callback'):
                    callback = self.request.get('callback')
                    response = callback + '(' + json.dumps(response) + ')'
                    self.response.write(response)
                else:
                    self.response.write(json.dumps(response))
                return
        else:
            programs, cursor, more = query.fetch_page(n)
        response['code'] = 200
        response['message'] = 'List of Geostore Agency Programs'
        response['data'] = []
        for program in programs:
            response['data'].append(program.to_api_object())
        if self.request.get('callback'):
            callback = self.request.get('callback')
            response = callback + '(' + json.dumps(response) + ')'
            self.response.write(response)
        else:
            self.response.write(json.dumps(response))
        return
