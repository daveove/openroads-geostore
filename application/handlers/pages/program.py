import logging
import urllib
from decorators import login_required
from google.appengine.ext import ndb
from application.handlers.base import BaseHandler
from application.models.program import Program
from application.models.agency import Agency


class ProgramHandler(BaseHandler):
    @login_required
    def get(self, agency=None, program=None):
        if program or agency == 'new':
            self.tv['error'] = self.request.get('error')
            if agency == 'new':
                program = agency
            if program.lower() != 'new':
                agency = Agency.query(Agency.slug == agency).get()
                query = Program.query()
                query = query.filter(Program.agency == agency.key.id())
                program = query.filter(Program.slug == program).get()
                self.tv['program'] = program
                self.tv['agency'] = agency
            agencies = Agency.query().fetch(100)
            self.tv['agencies'] = agencies
            self.render('program-details.html')
        else:
            query = Program.query()
            if agency:
                agency = Agency.query(Agency.slug == agency).get()
                query = query.filter(Program.agency == agency.key.id())
                self.tv['agency'] = agency
            query = query.fetch(100)
            agency_keys = []
            for program in query:
                key = ndb.Key('Agency', program.agency)
                if key not in agency_keys:
                    agency_keys.append(key)
            agencies = ndb.get_multi(agency_keys)
            self.tv['programs'] = query
            self.tv['agencies'] = {}
            for agency in agencies:
                self.tv['agencies'][agency.key.id()] = {}
                self.tv['agencies'][agency.key.id()]['name'] = agency.name
                self.tv['agencies'][agency.key.id()]['slug'] = agency.slug
            self.render('programs.html')

    @login_required
    def post(self, program=None):
        agency = int(self.request.get('agency'))
        name = self.request.get('name')
        slug = self.request.get('slug')
        description = self.request.get('description')
        if program:
            query = Program.query()
            query = query.filter(Program.agency == int(agency))
            query = query.filter(Program.slug == slug)
            query = query.get()
            if not query:
                program = Program()
                program.name = name
                program.agency = agency
                program.slug = slug
                program.description = description
                program.user = self.user.key
                program.put()
                agency = ndb.Key('Agency', agency).get()
                params = {}
                params['success'] = ('The program has been successfully '
                                     'added.')
                params = urllib.urlencode(params)
                self.redirect('/programs/' + agency.slug + '/' + slug + '?' +
                              params)
            else:
                query.name = name
                query.agency = agency
                query.description = description
                query.put()
                agency = ndb.Key('Agency', agency).get()
                params = {}
                params['success'] = ('The program has been successfully '
                                     'updated.')
                params = urllib.urlencode(params)
                self.redirect('/programs/' + agency.slug + '/' + slug + '?' +
                              params)
        else:
            self.redirect('/programs')
