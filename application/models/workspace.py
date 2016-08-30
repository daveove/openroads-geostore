import time
import datetime
from google.appengine.ext import ndb
from application.models.syslog import SysLog

class Workspace(SysLog):
    created = ndb.DateTimeProperty(auto_now_add=True)
    updated = ndb.DateTimeProperty(auto_now=True)
    owner = ndb.KeyProperty(kind='User')
    users = ndb.KeyProperty(repeated=True)
    description = ndb.TextProperty()
    title = ndb.StringProperty()
    invited_users = ndb.StringProperty(repeated=True)
    user_groups = ndb.KeyProperty(repeated=True)
    users_email = ndb.StringProperty(repeated=True)
    private = ndb.BooleanProperty(default=True)


    def to_object(self):
        data = {}
        created = self.created
        created += datetime.timedelta(hours=8)
        data["created_time"] = created.strftime("%b %d, %Y %I:%M:%S %p")
        data['created'] = time.mktime(created.timetuple())
        data['updated'] = time.mktime(self.updated.timetuple())
        data['users'] = [user.urlsafe() for user in self.users]
        data['title'] = self.title
        data['description'] = self.description
        data['key'] = self.key.urlsafe()
        data['id'] = str(self.key.id())
        data['members'] = []
        data['invited_users'] = self.invited_users
        data['users_email'] = self.users_email
        data['user_groups'] = []
        data['user_groups_list'] = []
        data['private_setting'] = self.private
        data['owner'] = self.owner.get().to_object()

        if self.user_groups:
            for g in self.user_groups:
                if g:
                    data['user_groups'].append(g.id())

                    group = g.get()
                    if group:
                        data['user_groups_list'].append(group.to_object())

        if self.users:
            for u in self.users:
                user = u.get()
                if user:
                    data['members'].append(user.to_object())

        return data


    def to_api_object(self):
        data = {}
        created = self.created
        created += datetime.timedelta(hours=8)
        data["created_time"] = created.strftime("%b %d, %Y %I:%M:%S %p")
        data['created'] = time.mktime(created.timetuple())
        data['updated'] = time.mktime(self.updated.timetuple())
        data['title'] = self.title
        data['description'] = self.description
        data['key'] = self.key.urlsafe()
        data['id'] = str(self.key.id())
        data['users_email'] = self.users_email
        data['private_setting'] = self.private

        return data