from google.appengine.ext import ndb
from application.models.syslog import SysLog


class Statistics(SysLog):
    statistics = ndb.JsonProperty()
    done = ndb.BooleanProperty(default=False)
    created = ndb.DateTimeProperty(auto_now_add=True)
    updated = ndb.DateTimeProperty(auto_now=True)

    def to_api_object(self):
        data = {}
        data['statistics'] = self.statistics
        data['done'] = self.done
        data['created'] = self.created.strftime("%b %d, %Y %I:%M:%S %p")
        data['updated'] = self.updated.strftime("%b %d, %Y %I:%M:%S %p")
        return data
