import webapp2
from functions import update_api_data, write_to_api

class ClassificationUploadHandler(webapp2.RequestHandler):
    def post(self):

        required_fields = [
            'classification_type',
            'classification',
            'lat',
            'lng',
            'image_serving_url',
            'image_url',
            'parent_code',
            'image_id',
            'project_code',
            'is_road'
        ]

        for required_field in required_fields:
            if not self.request.get(required_field):
                logging.error('missing field: ' + required_field)
                self.response.write('missing field: ' + required_field)
                return

        params = {
            'indexed_type': 'CLASSIFICATION',
            'indexed_classification_type': self.request.get('classification_type'),
            'indexed_classification': self.request.get('classification'),
            'indexed_lat': self.request.get('lat'),
            'indexed_lng': self.request.get('lng'),
            'unindexed_image_serving_url': self.request.get('image_serving_url'),
            'indexed_image_url': self.request.get('image_url'),
            'indexed_parent_code': self.request.get('parent_code'),
            'indexed_image_id': self.request.get('image_id'),
            'indexed_is_road': self.request.get('is_road'),
            'indexed_project_code': self.request.get('project_code')
        }

        write_to_api(params, 'geostore@sym.ph', 'application/json')
        image_attributes = {}
        if self.request.get('classification_type') == 'SURFACE':
            image_attributes['indexed_surface_type'] = self.request.get('classification')
        if self.request.get('classification_type') == 'QUALITY':
            image_attributes['indexed_surface_quality'] = self.request.get('classification')
        update_api_data(data_id=self.request.get('image_id'), items=image_attributes, content_type='application/json')