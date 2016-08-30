import time
from google.appengine.ext import ndb

class UserGroup(ndb.Model):
    users = ndb.KeyProperty(repeated=True)
    title = ndb.StringProperty()
    description = ndb.TextProperty()
    environments = ndb.KeyProperty(repeated=True)
    owner = ndb.KeyProperty(kind='User')
    invited_users = ndb.StringProperty(repeated=True)
    created = ndb.DateTimeProperty(auto_now_add=True)
    updated = ndb.DateTimeProperty(auto_now=True)

    def to_object(self):
        data = {}
        data['created'] = time.mktime(self.created.timetuple())
        data['updated'] = time.mktime(self.updated.timetuple())
        data['users'] = [user.urlsafe() for user in self.users]
        data['title'] = self.title
        data['description'] = self.description
        data['key'] = self.key.urlsafe()
        data['id'] = str(self.key.id())
        data['members'] = []
        data['members_length'] = len(self.users)
        data['invited_users'] = self.invited_users
        data['owner'] = self.owner.get().to_object()

        if self.users:
            for u in self.users:
                user = u.get()
                if user:
                    data['members'].append(user.to_object())

        return data