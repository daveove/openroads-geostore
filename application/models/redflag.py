import time
from google.appengine.ext import ndb

class RedFlag(ndb.Model):
    created = ndb.DateTimeProperty(auto_now_add=True)
    updated = ndb.DateTimeProperty(auto_now=True)
    links = ndb.KeyProperty(repeated=True)
    redflag = ndb.StringProperty(required=True)

    def to_object(self, full=False):
        data = {}
        data['created'] = time.mktime(self.created.timetuple())
        data['updated'] = time.mktime(self.updated.timetuple())
        data['redflag'] = self.redflag
        data['redflag_description'] = RED_FLAGS[self.redflag]

        if full:
            data['links'] = []

            if self.links:
                links = ndb.get_multi(self.links)
                for link in self.links:
                    data_object = link.to_api_object()
                    data['links'].append(data_object)

        return data