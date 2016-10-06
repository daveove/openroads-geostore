from google.appengine.ext import ndb
from application.models.syslog import SysLog
from application.models.agency import Agency


class Program(SysLog):
    agency = ndb.IntegerProperty()
    name = ndb.StringProperty()
    slug = ndb.StringProperty()
    description = ndb.StringProperty()
    user = ndb.KeyProperty(kind="User")
    created = ndb.DateTimeProperty(auto_now_add=True)
    updated = ndb.DateTimeProperty(auto_now=True)

    def to_api_object(self):
        data = {}
        data['id'] = self.key.id()
        data['name'] = self.name
        data['slug'] = self.slug
        data['description'] = self.description
        data['created'] = self.created.strftime("%b %d, %Y %I:%M:%S %p")
        data['updated'] = self.updated.strftime("%b %d, %Y %I:%M:%S %p")
        data['agency'] = Agency.get_by_id(self.agency).to_api_object()
        if self.user:
            user = self.user.get()
            if user:
                data['user'] = user.to_api_object()
        return data
