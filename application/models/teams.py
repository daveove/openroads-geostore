import time
import datetime
from google.appengine.ext import ndb
from application.models.syslog import SysLog

class Teams(SysLog):
    owner = ndb.KeyProperty(kind="User")
    team_name = ndb.StringProperty()
    team_description = ndb.StringProperty()
    members = ndb.StringProperty(repeated=True)
    invited_users = ndb.StringProperty(repeated=True)
    created_time = ndb.DateTimeProperty(auto_now_add=True)
    updated_time = ndb.DateTimeProperty(auto_now=True)

    def to_object(self):
        data = {}
        data["id"] = str(self.key.id())
        data["team_name"] = self.team_name
        data["team_description"] = self.team_description
        data["members"] = []
        if self.members:
            keys = []
            for user_id in self.members:
                keys.append(ndb.Key("User", int(user_id)))

            members = ndb.get_multi(keys)
            if members:
                for member in members:
                    data["members"].append(member.to_object())

        data["member_count"] = len(self.members)

        data["invited_users"] = []
        if self.invited_users:
            data["invited_users"] = self.invited_users

        data["invited_users_count"] = len(self.invited_users)

        created = self.created_time
        created += datetime.timedelta(hours=8)
        data["created_time"] = created.strftime("%b %d, %Y %I:%M:%S %p")
        data["created_time_timestamp"] = time.mktime(created.timetuple())

        return data