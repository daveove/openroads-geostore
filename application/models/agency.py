from google.appengine.ext import ndb
from application.models.syslog import SysLog


class Agency(SysLog):
    """Agency data model the defines the agency fields"""
    name = ndb.StringProperty()
    slug = ndb.StringProperty()
    description = ndb.StringProperty()
    user = ndb.KeyProperty(kind="User")
    programs = ndb.IntegerProperty(repeated=True)
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
        if self.user:
            data['user'] = self.user.get().to_api_object()
        return data
