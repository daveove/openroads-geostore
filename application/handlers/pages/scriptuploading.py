import json
import uuid
import logging
from pexif import JpegFile
from functions import write_to_api, update_api_data
from application.handlers.base import BaseHandler
from application.models.apidata import APIData


class ScriptUploadingHandler(BaseHandler):
    def get(self):
        self.response.set_status(403)
        self.response.headers['Content-Type'] = 'application/json'
        response = '{"message": "You are not allowed here.", "code": 403}'
        self.response.write(response)
        return

    def post(self, p=None):
        auth = self.request.get('auth')
        if not auth or auth != '9dd38786-a909-4db2-b2d2-489aad5893f8':
            self.response.set_status(403)
            self.response.headers['Content-Type'] = 'application/json'
            response = '{"message": "You are not allowed here.", "code": 403}'
            self.response.write(response)
            return
        if p:
            logging.debug(self.request.headers['Content-Type'])
            if p == 'dataset':
                logging.debug('NEW DATASET')
                params = {}
                params['indexed_program'] = self.request.get('program').upper()
                params['indexed_agency'] = self.request.get('agency')
                params['indexed_parent_code'] = self.request.get('code')
                params['indexed_code'] = str(uuid.uuid4()).upper()
                params['indexed_type'] = 'DATASET'
                params['unindexed_title'] = self.request.get('title')
                if self.request.get('project_code'):
                    params['indexed_project_code'] = self.request.get('project_code')
                    params['indexed_subproject_code'] = params['indexed_parent_code']
                dataset_query = APIData.query(APIData.indexed_data == 'TYPE->DATASET',
                    APIData.indexed_data == 'PARENT_CODE->' + params['indexed_parent_code'].upper(),
                    APIData.indexed_data == 'AGENCY->' + params['indexed_agency'].upper(),
                    APIData.indexed_data == 'PROGRAM->' + params['indexed_program'].upper(),
                ).get()
                if dataset_query:
                    data = dataset_query
                else:
                    data = write_to_api(params, 'geostore@sym.ph', 'application/json')
                self.response.headers['Content-Type'] = 'application/json'
                self.response.write(json.dumps(data.to_api_object()))
            elif p == 'upload':
                logging.debug(self.request.POST)
                params = {
                    'indexed_program': self.request.get('program').upper(),
                    'indexed_agency': self.request.get('agency').upper(),
                    'indexed_project_code': self.request.get('code'),
                    'indexed_parent_code': self.request.get('dataset'),
                }
                if self.request.get('project_code'):
                    params['indexed_subproject_code'] = params['indexed_project_code']
                    params['indexed_project_code'] = self.request.get('project_code')
                    params['indexed_dataset_code'] = params['indexed_parent_code']
                if self.request.get('special'):
                    logging.debug('FILE RECEIVED')
                    params['indexed_type'] = 'FILE'
                    params['file_file'] = self.request.POST['file']
                else:
                    if self.request.POST['file'].filename.endswith(tuple(['.kml', '.kmz'])):
                        logging.debug('KML RECEIVED')
                        params['indexed_type'] = 'KML'
                        params['file_kml'] = self.request.POST['file']
                    elif self.request.POST['file'].filename.lower().endswith(tuple(['.jpg', '.jpeg', '.JPG', '.JPEG'])):
                        logging.debug('IMAGE RECEIVED')
                        params['indexed_type'] = 'IMAGE'
                        params['file_image'] = self.request.POST['file']
                        ef = JpegFile.fromString(params['file_image'].file.read())
                        try:
                            lat, lng = ef.get_geo()
                            params['unindexed_latlng'] = str(lat) + ',' + str(lng)
                            params['unindexed_date'] = ef.exif.primary.ExtendedEXIF.DateTimeOriginal
                        except Exception as e:
                            logging.exception('Image has no GPS Data')
                            logging.exception(e)
                            self.response.set_status(500)
                            self.response.write('Image has no GPS Data')
                            return
                        params['file_image'].file.seek(0)
                    else:
                        self.response.set_status(500)
                        self.response.write('File is invalid')
                        return
                w = write_to_api(params, 'geostore@sym.ph', 'asdf', user_request=self)
                if w:
                    self.response.write(json.dumps(w.to_api_object()))
            elif p == 'update-image':
                params = {}
                params['unindexed_date'] = self.request.get('date')
                update_api_data(data_id=self.request.get('id'), items=params, user='geostore@sym.ph', content_type='application/json')
            elif p == 'update-coa-has-data':
                response = []
                query = APIData.query()
                query = query.filter(APIData.indexed_data == 'TYPE->PROJECT')
                query = query.filter(APIData.indexed_data == 'COA->1')
                projects, cursor, more = query.fetch_page(1000)
                for project in projects:
                    if 'code' not in project.additional_data:
                        continue
                    params = {}
                    query = APIData.query()
                    query = query.filter(APIData.indexed_data == 'TYPE->IMAGE')
                    query = query.filter(APIData.indexed_data == 'PROJECT_CODE->' + project.additional_data['code'])
                    image = query.get(keys_only=True)
                    if image:
                        params['indexed_has_image'] = '1'
                    query = APIData.query()
                    query = query.filter(APIData.indexed_data == 'TYPE->KML')
                    query = query.filter(APIData.indexed_data == 'PROJECT_CODE->' + project.additional_data['code'])
                    kml = query.get(keys_only=True)
                    if kml:
                        params['indexed_has_kml'] = '1'
                    update_api_data(data_id=project.key.id(), items=params, user='geostore@sym.ph', content_type='application/json')
                    response.append(project.additional_data['code'])
                self.response.headers['Content-Type'] = 'application/json'
                self.response.write(json.dumps(response))
