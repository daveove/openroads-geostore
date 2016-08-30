import json
import webapp2
from geostore_dashboard_statistics_counter import run_counter
from google.appengine.api import taskqueue

class TaskCounterHandler(webapp2.RequestHandler):
    def get(self):
        if self.request.get('set_classification_flags'):
            taskqueue.add(url="/tasks/counter", payload=json.dumps({'set_classification_flags': True}), method="POST")
        else:
            taskqueue.add(url="/tasks/counter", payload=json.dumps({}), method="POST")

    def post(self):
        cursor = None
        counter_id = None
        set_classification_flags = False

        if self.request.body:
            body = json.loads(self.request.body)
            if 'cursor' in body:
                cursor = body['cursor']
            if 'counter_id' in body:
                counter_id = body['counter_id']
            if 'set_classification_flags' in body:
                set_classification_flags = True

        counter_object = run_counter(counter_id=counter_id, cursor_urlsafe=cursor, set_classification_flags=set_classification_flags)

        if counter_object['cursor']:
            # run again
            if set_classification_flags:
                counter_object['set_classification_flags'] = True
            taskqueue.add(url="/tasks/counter", payload=json.dumps(counter_object), method="POST", countdown=2)