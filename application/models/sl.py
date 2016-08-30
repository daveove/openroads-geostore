import datetime
from google.appengine.ext import ndb
import collections

def flatten(d, parent_key='', sep='_'):
    items = []
    for k, v in d.items():
        new_key = parent_key + sep + k if parent_key else k
        if isinstance(v, collections.MutableMapping):
            items.extend(flatten(v, new_key, sep=sep).items())
        else:
            items.append((new_key, v))
    return dict(items)


# SysLog
class SL(ndb.Model):
    content = ndb.PickleProperty('ct')
    created = ndb.DateTimeProperty('c', auto_now_add=True)
    updated = ndb.DateTimeProperty('u', auto_now=True)
    model_kind = ndb.StringProperty('k')
    parent_entity = ndb.KeyProperty('p')
    user = ndb.KeyProperty("User")
    operation = ndb.StringProperty()
    indexed_data = ndb.StringProperty(repeated=True)

    def to_api_object(self, change_against=None):
        """
            Converts the entity to JSON.
        """

        data = {}
        data["version_id"] = str(self.key.id())
        data["id"] = str(self.content.key.id())
        data["operation"] = self.operation
        data["username"] = self.content.username or ""
        data['details'] = {}

        data["created"] = ""
        if self.created:
            created = self.created
            created += datetime.timedelta(hours=8)
            data["created"] = created.strftime("%b %d, %Y %I:%M:%S %p")
        data["updated"] = ""
        if self.content.updated_time:
            updated = self.content.updated_time
            updated += datetime.timedelta(hours=8)
            data["updated"] = updated.strftime("%b %d, %Y %I:%M:%S %p")

        content = flatten(self.content.additional_data)

        if change_against and change_against.content.key.id() == self.content.key.id():
            # same entity. let's show only the changes
            original_content = flatten(change_against.content.additional_data)

            for key, value in content:
                if key in original_content:
                    if content[key] == original_content[key]:
                        # the same. pass
                        continue
                        
                data['details'][key] = value

        else:
            # new entity. show everything
            data['details'] = content

        return data