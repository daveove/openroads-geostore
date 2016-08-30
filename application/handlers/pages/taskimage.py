import webapp2
import logging
from functions import create_indexed_tag
from google.appengine.api import taskqueue
from google.appengine.ext import ndb
from google.appengine.datastore.datastore_query import Cursor
from application.models.apidata import APIData

class TaskImageHandler(webapp2.RequestHandler):
    def get(self):
        taskqueue.add(url="/tasks/images", method="POST")

    def post(self):
        # query all images
        count = self.request.get('count')
        if count:
            logging.info(str(count))
            count = int(count)
        else:
            count = 0

        query = APIData.query(APIData.indexed_data == 'TYPE->IMAGE').order(-APIData.created_time)
        cursor = None

        if self.request.get('cursor'):
            cursor = Cursor(urlsafe=self.request.get("cursor"))

        if cursor:
            results, cursor2, more = query.fetch_page(50, start_cursor=cursor)
        else:
            results, cursor2, more = query.fetch_page(50)

        images = []
        for result in results:
            project_key = None
            # dataset_id
            if 'dataset_id' not in result.additional_data:
                if 'dataset_code' in result.additional_data:
                    dataset_key = APIData.query(APIData.indexed_data == 'CODE->' + result.additional_data['dataset_code']).get(keys_only=True)
                else:
                    dataset_key = APIData.query(APIData.indexed_data == 'CODE->' + result.additional_data['parent_code']).get(keys_only=True)
                result.additional_data['dataset_id'] = str(dataset_key.id())
                result.indexed_data.append(create_indexed_tag('dataset_id', str(dataset_key.id())))

            # project_id
            if 'project_id' not in result.additional_data:
                project_key = APIData.query(APIData.indexed_data == 'CODE->' + result.additional_data['project_code']).get(keys_only=True)
                result.additional_data['project_id'] = str(project_key.id())
                result.indexed_data.append(create_indexed_tag('project_id', str(project_key.id())))

            # subproject_id
            if 'subproject_code' in result.additional_data:
                if 'subproject_id' not in result.additional_data:
                    if not project_key:
                        project_key = APIData.query(APIData.indexed_data == 'CODE->' + result.additional_data['project_code']).get(keys_only=True)
                    result.additional_data['subproject_id'] = str(project_key.id())
                    result.indexed_data.append(create_indexed_tag('subproject_id', str(project_key.id())))

            # parent_id
            result.additional_data['parent_id'] = result.additional_data['dataset_id']
            result.indexed_data.append(create_indexed_tag('parent_id', result.additional_data['parent_id']))

            images.append(result)

        if images:
            ndb.put_multi(images)

        count += len(images)
        logging.info(str(count))

        if more:
            taskqueue.add(url="/tasks/images", params={'cursor': cursor2.urlsafe(), 'count': count}, method="POST")