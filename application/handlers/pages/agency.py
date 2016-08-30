import logging
import urllib
from decorators import login_required
from application.handlers.base import BaseHandler
from application.models.agency import Agency
from application.models.program import Program


class AgencyHandler(BaseHandler):
    @login_required
    def get(self, agency=None):
        if agency:
            if self.request.get('success'):
                self.tv['success'] = self.request.get('success')
            if agency != 'new':
                agency = Agency.query(Agency.slug == agency).get()
                self.tv['agency'] = agency
                query = Program.query(Program.agency == agency.key.id())
                programs = query.fetch(100)
                self.tv['programs'] = programs
            self.render('agency-details.html')
        else:
            agencies = Agency.query().fetch(100)
            self.tv['agencies'] = agencies
            self.render('agencies.html')

    @login_required
    def post(self, agency=None):
        name = self.request.get('name')
        slug = self.request.get('slug')
        description = self.request.get('description')
        if agency:
            query = Agency.query(Agency.slug == slug).get()
            logging.debug(query)
            if not query:
                agency = Agency()
                agency.name = name
                agency.slug = slug
                agency.description = description
                agency.user = self.user.key
                agency.put()
                params = {}
                params['success'] = 'You have successfully added a new agency.'
                params = urllib.urlencode(params)
                self.redirect('/agencies/' + slug + '?' + params)
            else:
                params = {}
                params['error'] = 'The agency is already in the database.'
                params = urllib.urlencode(params)
                self.redirect('/agencies/new?' + params)
        else:
            self.redirect('/agencies/' + slug)
