import os
import datetime
from google.appengine.ext import ndb
from application.models.syslog import SysLog

class Logs(SysLog):
    user = ndb.KeyProperty(kind="User")
    dataset = ndb.KeyProperty(kind="APIData")
    resource = ndb.KeyProperty(kind="APIData")
    uacs_id = ndb.StringProperty()
    data = ndb.JsonProperty()
    # tags = ndb.StringProperty(repeated=True)
    ip_address = ndb.StringProperty(default=os.environ.get('REMOTE_ADDR'))
    user_agent = ndb.StringProperty(default=os.environ.get('HTTP_USER_AGENT'))
    created_time = ndb.DateTimeProperty(auto_now_add=True)
    created_date = ndb.DateProperty(auto_now_add=True)

    @classmethod
    def add_log(cls, data, uacs_id, user=None, dataset=None, resource=None):
        """
            Creates a new activity log.
        """
        log = cls()
        if user:
            log.user = user

        if dataset:
            log.dataset = dataset

        if resource:
            log.resource

        if uacs_id:
            log.uacs_id = uacs_id

        log.data = data
        log.put()

    def to_object(self):
        """
            Converts log entity to JSON.
        """
        data = {}
        data["dataset"] = ""
        if self.dataset:
            data["dataset"] = self.dataset.urlsafe()
        data["action"] = self.data["action"]
        data["icon"] = self.data["icon"]
        data["color"] = self.data["color"]
        created = self.created_time
        created += datetime.timedelta(hours=8)
        data["created_time"] = created.strftime("%b %d, %Y %I:%M:%S %p")
        data["created_time_timeago"] = created.strftime("%Y-%m-%dT%H:%M:%SZ")
        return data