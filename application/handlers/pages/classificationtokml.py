import traceback
from settings import BUCKET_NAME
import json
import urllib
import logging
import string
import random
from functions import normalize_id, merge_kml_and_attributes, find_between_r, create_indexed_tag, merge_kml_and_attributes_json
from application.handlers.base import BaseHandler
from application.models.apidata import APIData
from application.models.gcsfile import GCSFile
import cloudstorage as gcs
from google.appengine.ext import deferred


def random_string(n):
    """
        Generates a random string.
    """
    random_str = ""
    for x in range(n):
        rand = string.ascii_letters + string.digits
        random_str += random.choice(rand)

    return random_str


def merge_kml(parent_code, project_code, output, kml):
    # run this
    # get all the attributes
    query = APIData.query(APIData.indexed_data == create_indexed_tag('TYPE', 'CLASSIFICATION'))
    if parent_code:
        query = query.filter(APIData.indexed_data == create_indexed_tag('parent_code', parent_code))
    else:
        query = query.filter(APIData.indexed_data == create_indexed_tag('project_code', project_code))

    cursor = None
    i = 1
    n = 100
    all_classifications = []

    while i < 50:
        # logging.debug('querying...')
        classifications, cursor, more = query.fetch_page(n, start_cursor=cursor)
        i = i + 1

        for classification in classifications:
            try:
                all_classifications.append({
                    'classification_type': classification.additional_data['classification_type'].upper().strip(),
                    'classification': classification.additional_data['classification'].upper().strip(),
                    'latlng': classification.additional_data['lat'] + ',' + classification.additional_data['lng']
                    })
            except KeyError:
                pass

        if len(classifications) < n:
            break

    logging.debug("i: " + str(i))

    # generate new kml

    kml_id = str(kml.key.id())

    try:
        if output:
            if output.lower() == 'json':
                content = merge_kml_and_attributes_json(all_classifications, kml.file_url)
                filename = 'merged_kml_and_attributes.json'
                gcs_filename = BUCKET_NAME
                gcs_filename += random_string(128) + "/"
                gcs_filename += filename

                gcs_options = {'x-goog-acl': 'public-read'}
                gcs_file = gcs.open(gcs_filename, 'w',
                                    options=gcs_options)
                gcs_file.write(json.dumps(content).encode('utf-8'))
                gcs_file.close()

                full_url = "https://storage.googleapis.com" + gcs_filename
                full_url = urllib.quote(full_url, safe="%/:=&?~#+!$,;'@()*[]")

                gcsfile = GCSFile()
                gcsfile.kml_id = kml_id
                gcsfile.link = full_url
                gcsfile.file_type = 'JSON'
                gcsfile.put()
                return
        else:
            content = merge_kml_and_attributes(all_classifications, kml.file_url)
    except Exception as e:
        logging.debug(e)
        return

    filename = find_between_r(kml.file_url + ' ', '/', ' ')
    filename = filename.replace('.kmz', '-kmz') + '.kml'

    # save file to gcs
    gcs_filename = BUCKET_NAME
    gcs_filename += random_string(128) + "/"
    gcs_filename += filename

    gcs_options = {'x-goog-acl': 'public-read'}
    gcs_file = gcs.open(gcs_filename, 'w',
                        options=gcs_options)
    gcs_file.write(content.encode('utf-8'))
    gcs_file.close()

    full_url = "https://storage.googleapis.com" + gcs_filename
    full_url = urllib.quote(full_url, safe="%/:=&?~#+!$,;'@()*[]")

    gcsfile = GCSFile()
    gcsfile.kml_id = kml_id
    gcsfile.link = full_url
    gcsfile.file_type = 'KML'
    gcsfile.put()



class ClassificationToKMLHandler(BaseHandler):
    def get(self):
        if not self.request.get('project_code') and not self.request.get('parent_code'):
            logging.error('missing project code')
            self.error(400)
            return

        project_code = self.request.get('project_code')
        parent_code = self.request.get('parent_code')
        kml_id = self.request.get('kml_id')

        if not kml_id:
            kml = APIData.query()
            kml = kml.filter(APIData.indexed_data == 'TYPE->KML')
            kml = kml.filter(APIData.indexed_data == 'PROJECT_CODE->' + project_code.upper())
            kml = kml.get()
            kml_id = str(kml.key.id())
        else:
            kml = APIData.get_by_id(normalize_id(kml_id))

        if not kml:
            logging.error('cannot find kml_id: ' + kml_id)
            self.error(404)
            return

        # check if has GCSFile
        if self.request.get('output') and self.request.get('output') == 'json':
            file_type = 'JSON'
        else:
            file_type = 'KML'
        gcs_file = GCSFile.query(GCSFile.kml_id == kml_id, GCSFile.file_type == file_type).order(-GCSFile.created_time).get()
        if gcs_file:
            # check if classification
            classification_check = APIData.query(APIData.indexed_data == create_indexed_tag('TYPE', 'CLASSIFICATION')).order(-APIData.created_time).get()
            if classification_check and classification_check.created_time < gcs_file.created_time:
                # has file and still updated
                self.redirect(gcs_file.link.encode('utf-8'))
                return
        output = self.request.get('output')
        deferred.defer(merge_kml, parent_code, project_code, output, kml)
        self.tv['project_code'] = project_code
        self.render('kml-download.html')
        return




