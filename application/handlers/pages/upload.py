import logging
import datetime
import traceback
from settings import API_KEY
from functions import write_to_api, update_api_data
from application.handlers.base import BaseHandler
from application.models.apidata import APIData
from pexif import JpegFile
try:
    from cStringIO import StringIO
except:
    from StringIO import StringIO

class UploadHandler(BaseHandler):
    def post(self, program=None, code=None, report=None, dataset=None):
        headers = {}
        params = {
            'file_image': self.request.POST['file'],
            'indexed_program': program.upper(),
            'indexed_project_code': code,
            'indexed_project_id': self.request.POST['project-id'],
            'indexed_dataset_code': report,
            'indexed_dataset_id': self.request.POST['dataset-id'],
            'indexed_parent_code': report,
            'unindexed_data_collectors': self.request.POST['data-collectors'],
            'unindexed_last_modified_date': self.request.POST['last_modified_date']
        }
        if self.request.get('subproject'):
            params['indexed_subproject_code'] = report
            params['indexed_subproject_id'] = self.request.POST['subproject-id']
            params['indexed_dataset_code'] = dataset
            params['indexed_parent_code'] = dataset
        if self.request.get('special'):
            logging.debug('FILE RECEIVED')
            params['file_file'] = params.pop('file_image')
            params['indexed_type'] = 'FILE'
            if self.request.POST['file'].filename.lower().endswith(tuple(['.jpg', '.jpeg'])):
                image = JpegFile.fromString(params['file_file'].file.read())
                try:
                    lat, lng = image.get_geo()
                    params['unindexed_latlng'] = str(lat) + ',' + str(lng)
                    logging.debug('FILE HAS GPS')
                except:
                    logging.debug('FILE HAS NO GPS')
                params['file_file'].file.seek(0)
        else:
            if self.request.POST['file'].filename.endswith(tuple(['.kml', '.kmz'])):
                logging.debug('KML RECEIVED')
                params['file_kml'] = params.pop('file_image')
                params['indexed_type'] = 'KML'
                kml_type = 'PROJECT'
                if params['file_kml'].filename.startswith('ACCESS-'):
                    kml_type = 'ACCESS'
                ext = params['file_kml'].filename.split('.')[-1]
                params['file_kml'].filename = kml_type + '-' + code + '-'
                params['file_kml'].filename += self.request.get('kml')
                params['file_kml'].filename += '.' + ext
                query = APIData.query()
                query = query.filter(APIData.indexed_data == 'TYPE->PROJECT')
                query = query.filter(APIData.indexed_data == 'CODE->' + code)
                query = query.filter(APIData.indexed_data == 'HAS_KML->1')
                project = query.get(keys_only=True)
                logging.debug('PROJECT QUERIED AND HAS KML')
                logging.debug(project)
                if not project:
                    params = {}
                    params['indexed_has_kml'] = '1'
                    update_api_data(self.request.POST['project-id'], params, self.user, 'application/json')
            elif self.request.POST['file'].filename.lower().endswith(tuple(['.jpg', '.jpeg'])):
                logging.debug('IMAGE RECEIVED')
                try:
                    image = JpegFile.fromString(params['file_image'].file.read())
                except Exception as e:
                    logging.debug(e)
                    params['file_image'].file.seek(0)
                    try:
                        image = JpegFile.fromString(StringIO(params['file_image'].file.read()).read())
                    except Exception as e:
                        logging.debug('Using StringIO')
                        traceback.print_exc()
                        self.response.set_status(500)
                        self.response.write('Image has invalid metadata')
                        return
                try:
                    lat, lng = image.get_geo()
                except Exception as e:
                    logging.debug('Image does not a have GPS data')
                    traceback.print_exc()
                    self.response.set_status(500)
                    self.response.write('Image does not a have GPS data')
                    return
                params['unindexed_latlng'] = str(lat) + ',' + str(lng)
                params['unindexed_date'] = ''
                if image.exif.primary.GPS[0x7]:
                    logging.debug(image.exif.primary.GPS[0x7])
                    gps_time = ''
                    for a in image.exif.primary.GPS[0x7]:
                        if a.num < 10:
                            gps_time += '0' + str(a.num)
                        else:
                            gps_time += str(a.num)
                        gps_time += ':'
                    gps_time = gps_time[:-1]
                    logging.debug(gps_time)
                    params['unindexed_date'] = image.exif.primary.GPS[0x1d] + ' ' + gps_time
                    logging.debug(params['unindexed_date'])
                else:
                    try:
                        params['unindexed_date'] = image.exif.primary.ExtendedEXIF.DateTimeOriginal
                    except:
                        params['unindexed_date'] = datetime.datetime.now().strftime('%Y:%m:%d %H:%M:%S')
                params['file_image'].file.seek(0)
                params['indexed_type'] = 'IMAGE'
                query = APIData.query()
                query = query.filter(APIData.indexed_data == 'TYPE->PROJECT')
                query = query.filter(APIData.indexed_data == 'CODE->' + code)
                query = query.filter(APIData.indexed_data == 'HAS_IMAGE->1')
                project = query.get(keys_only=True)
                logging.debug('PROJECT QUERIED AND HAS IMAGE')
                logging.debug(project)
                if not project:
                    params = {}
                    params['indexed_has_image'] = '1'
                    update_api_data(self.request.POST['project-id'], params, self.user, 'application/json')
            else:
                self.response.set_status(500)
                self.response.write('File is invalid')
                return
        headers['Authorization'] = API_KEY
        headers['Content-Type'] = 'multipart/form-data'
        logging.debug(params)
        write_to_api(params, self.user, headers['Content-Type'])
