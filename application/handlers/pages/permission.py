import logging
from decorators import login_required
from functions import normalize_id
from google.appengine.ext import ndb
from application.handlers.base import BaseHandler

# MODELS
from application.models.apidata import APIData

class PermissionHandler(BaseHandler):
    @login_required
    def post(self):
        if self.request.get('target') and self.request.get('id') and self.request.get('permission'):

            if self.request.get('permission') not in ['PUBLIC', 'PRIVATE']:
                logging.error('Permission not valid')
                logging.error(self.request.get('permission'))
                self.response.write('Invalid Permission Value')
                self.error(400)
                return

            target = self.request.get('target')

            if target == 'DATA':
                # edit data permission setting
                data = APIData.get_by_id(normalize_id(self.request.get('id')))
                if data:
                    if data.additional_data['type'] not in ['PROJECT', 'DATASET']:
                        data.permission = self.request.get('permission')
                        data.put()
                        return
                    else:
                        self.response.write('Cannot modify permission for Project or Dataset')
                        self.error(400)
                        return
                else:
                    self.response.write('Data not found')
                    logging.error('data not found')
                    logging.error(self.request.get('id'))
                    self.error(404)
                    return

            elif target == 'DATASET':
                # edit dataset
                if self.user.role in ["CLUSTERDIRECTOR", 'GEOSTOREADMIN']:
                    data = APIData.get_by_id(normalize_id(self.request.get('id')))
                    if data:
                        if data.additional_data['type'] == 'DATASET':
                            # modify environment key
                            if self.request.get('permission') == 'PUBLIC':
                                if ndb.Key('Environment', 'PUBLIC') not in data.environment:
                                    data.environment.append(ndb.Key('Environment', 'PUBLIC'))
                                else:
                                    logging.error('dataset already in a public environment')
                            elif self.request.get('permission') == 'PRIVATE':
                                data.environment.remove(ndb.Key('Environment', 'PUBLIC'))
                            else:
                                logging.error('unknown permission value')
                                logging.error(self.request.get('permission'))
                                self.error(400)
                                return
                            data.put()
                        else:
                            self.response.write('Dataset only allowed')
                            self.error(400)
                            return
                    else:
                        self.response.write('Dataset not found')
                        self.error(404)
                        return
                else:
                    self.response.write('Access Denied')
                    self.error(403)
        else:
            logging.error('Missing Parameters')
            self.response.write('Missing parameters')
            self.error(400)