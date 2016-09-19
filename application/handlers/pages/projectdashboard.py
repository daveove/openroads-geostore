import os
import uuid
import json
import logging
from decorators import login_required
from google.appengine.api import app_identity
from functions import (code_to_project_id, generate_parameter_tags,
                       write_to_api, update_api_data)
from application.handlers.base import BaseHandler
from application.models.environment import Environment
from application.models.agency import Agency
from application.models.program import Program


class ProjectDashboardHandler(BaseHandler):
    @login_required
    def get(self, program=None, code=None, subentity=None, subentity_code=None,
            dataset=None, dataset_code=None):
        self.tv['title'] = 'Dashboard'
        self.tv['page_dashboard'] = True
        self.tv['version'] = os.environ['CURRENT_VERSION_ID']
        self.tv['app_url'] = app_identity.get_default_version_hostname()
        if 'localhost' in self.tv['app_url']:
            self.tv['app_url'] = 'openroads-geostore.appspot.com'
        elif 'staging' in self.tv['app_url']:
            self.tv['app_url'] = self.tv['version'].split('.')[0] + '.'
            self.tv['app_url'] += self.tv['app_url']

        if 'staging' in self.tv['app_url']:
            self.tv['app_url'] = 'http://' + self.tv['app_url']
        else:
            self.tv['app_url'] = 'https://' + self.tv['app_url']

        if self.request.get('new'):
            if self.request.get('new') == '1':
                self.tv['new'] = True

        if program:
            query = Environment.query()
            query = query.filter(Environment.users == self.user.key)
            user_environment = query.get(keys_only=True)
            query = Agency.query()
            self.tv['agencies'] = query.fetch(500)
            self.tv['has_environment'] = user_environment
            self.tv['updated'] = self.request.get('updated')
            self.tv['program'] = program
            if program == 'new':
                code = 'new'
            if code:
                self.tv['code'] = None
                if code != 'new':
                    self.tv['project_id'] = code_to_project_id(code)
                    self.tv['code'] = code
                    if subentity:
                        self.tv['report'] = None
                        if subentity == 'dataset':
                            self.tv['dataset'] = str(uuid.uuid4()).upper()
                            if subentity_code != 'new':
                                self.tv['report'] = subentity_code
                                self.tv['dataset'] = subentity_code
                                self.tv['existing_dataset'] = True
                            else:
                                if not user_environment:
                                    self.redirect('/workspace')
                                    return
                            self.render('2.0/dataset.html')
                        elif subentity == 'subproject':
                            if dataset:
                                self.tv['report2'] = False
                                self.tv['subproject'] = subentity_code
                                self.tv['dataset'] = str(uuid.uuid4()).upper()
                                if dataset_code != 'new':
                                    self.tv['report2'] = dataset_code
                                    self.tv['dataset'] = dataset_code
                                    self.tv['existing_dataset'] = True
                                else:
                                    if not user_environment:
                                        self.redirect('/workspace')
                                        return
                                self.render('2.0/dataset.html')
                                return
                            if subentity_code != 'new':
                                self.tv['subproject'] = subentity_code
                            self.render('2.0/subproject.html')
                        return
                self.render('2.0/list-item.html')
                return
            with open('projects-new-dict.json', 'rb') as f:
                self.tv['projects'] = json.dumps(json.loads(f.read()))
            query = Program.query()
            results = query.fetch()
            self.tv['programs'] = []
            for result in results:
                self.tv['programs'].append(result.to_api_object())
            self.tv['programs'] = json.dumps(self.tv['programs'])
            self.render('2.0/list.html')
        else:
            self.redirect('/projects/all')

    @login_required
    def post(self,
             program=None,
             code=None,
             subentity=None,
             subentity_code=None,
             dataset=None,
             dataset_code=None):
        if program:
            params = {}
            if program in 'da':
                params['indexed_agency'] = 'DA'
                params['indexed_program'] = 'PRDP'
            elif program == 'trip':
                params['indexed_agency'] = 'DOT'
                params['indexed_program'] = 'TRIP'
            elif program == 'bub':
                params['indexed_agency'] = 'DPWH'
                params['indexed_program'] = 'BUB'
            elif program == 'gaa':
                params['indexed_agency'] = 'DPWH'
                params['indexed_program'] = 'GAA'
            elif program == 'local':
                params['indexed_agency'] = 'LOCAL'
                params['indexed_program'] = 'LOCAL'
            elif program == 'coa':
                params['indexed_coa'] = '1'
                params['indexed_agency'] = self.request.get('agency')
                params['indexed_program'] = self.request.get('program')
                program = self.request.get('program').lower()
                if program == 'prdp':
                    program = 'da'
                elif program == 'cpa':
                    program = 'coa'
            elif program == 'new':
                code = 'new'
                agency = Agency.get_by_id(int(self.request.get('agency')))
                params['indexed_agency'] = agency.slug
                params['indexed_program'] = self.request.get('program')
            headers = {
                'Authorization': uuid.uuid4(),
                'Content-Type': 'application/json',
            }
            if code:
                if code == 'new':
                    logging.debug('NEW PROJECT')
                    params = generate_parameter_tags(params, self.request.POST)
                    params['indexed_type'] = 'PROJECT'
                    write_to_api(params, self.user, headers['Content-Type'])
                    redirect = '/projects/' + params['indexed_program'] + '/'
                    redirect += self.request.get('code') + '?new=1'
                    self.redirect(redirect)
                else:
                    if subentity:
                        if subentity == 'dataset':
                            if subentity_code == 'new':
                                logging.debug('NEW DATASET')
                                params = generate_parameter_tags(params, self.request.POST)
                                params['indexed_parent_code'] = code
                                params['indexed_type'] = 'DATASET'
                                if self.user:
                                    write_to_api(params, self.user, headers['Content-Type'])
                                    redirect = '/projects/' + program + '/' + code + '/dataset/' + self.request.get('code')
                                    self.redirect(redirect)
                                    return
                            else:
                                logging.debug('EXISTING DATASET')
                                params = \
                                    generate_parameter_tags(params,
                                                            self.request.POST)
                                update_api_data(self.request.POST['data'],
                                                params,
                                                self.user,
                                                headers['Content-Type'])
                                redirect = '/projects/' + program + '/' + code + '/dataset/' + subentity_code + '?updated=1'
                                self.redirect(redirect)
                                return
                            redirect = '/projects/' + program + '/' + code + '/dataset/' + self.request.get('code')
                            self.redirect(redirect)
                            return
                        elif subentity == 'subproject':
                            if subentity_code == 'new':
                                logging.debug('NEW SUBPROJECT')
                                params = generate_parameter_tags(params, self.request.POST)
                                params['indexed_parent_code'] = code
                                params['indexed_type'] = 'SUBPROJECT'
                                if self.user:
                                    write_to_api(params, self.user, headers['Content-Type'])
                                    redirect = '/projects/' + program + '/' + code + '/subproject/' + self.request.get('code')
                                    self.redirect(redirect)
                                    return
                            else:
                                if dataset:
                                    if dataset_code == 'new':
                                        logging.debug('NEW SUBPROJECT DATASET')
                                        params = generate_parameter_tags(params, self.request.POST)
                                        params['indexed_parent_code'] = subentity_code
                                        params['indexed_type'] = 'DATASET'
                                        if self.user:
                                            write_to_api(params, self.user, headers['Content-Type'])
                                            redirect = '/projects/' + program + '/' + code + '/subproject/' + subentity_code + '/dataset/' + self.request.get('code')
                                            self.redirect(redirect)
                                            return
                                    else:
                                        logging.debug('EXISTING SUBPROJECT DATASET')
                                        params = generate_parameter_tags(params, self.request.POST)
                                        update_api_data(self.request.POST['data'], params, self.user, headers['Content-Type'])
                                        redirect = '/projects/' + program + '/' + code + '/subproject/' + subentity_code + '/dataset/' + self.request.get('code') + '?updated=1'
                                        self.redirect(redirect)
                                        return
                                logging.debug('EXISTING SUBPROJECT')
                                params = generate_parameter_tags(params, self.request.POST)
                                update_api_data(self.request.POST['data'], params, self.user, headers['Content-Type'])
                                redirect = '/projects/' + program + '/' + code + '/subproject/' + subentity_code + '?updated=1'
                                self.redirect(redirect)
                                return
                            redirect = '/projects/' + program + '/' + code + '/subproject/' + self.request.get('code')
                            self.redirect(redirect)
                            return
                    logging.debug('EXISTING PROJECT')
                    logging.debug(params)
                    params = generate_parameter_tags(params, self.request.POST)
                    update_api_data(self.request.POST['data'], params, self.user, headers['Content-Type'])
                    redirect = '/projects/' + program + '/' + self.request.get('code') + '?updated=1'
                    self.redirect(redirect)
