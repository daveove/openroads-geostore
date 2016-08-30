import time
import logging
from google.appengine.ext import ndb
from application.models.sl import SL
from request import global_vars


def uniquify(seq, idfun=None):
    """
        Removes duplicate items in the list.
    """
    # order preserving
    if idfun is None:
        def idfun(x): return x
    seen = {}
    result = []

    for item in seq:
        try:
            marker = idfun(item)
            # in old Python versions:
            # if seen.has_key(marker)
            # but in new ones:
            if marker in seen:
                continue
            seen[marker] = 1
            result.append(str(item))
        except Exception as e:
            logging.info(e)
            logging.info(item)

    return result


class SysLog(ndb.Model):
    def _post_put_hook(self, future):
        """
            Automatically creates a version of the APIData model.
        """
        sl = SL(parent=self.key)
        sl.content = self
        sl.model_kind = self.key.kind()
        sl.parent_entity = self.key
        current_user = global_vars.user
        if current_user:
            sl.user = current_user.key
        else:
            if self.key:
                sl.user = self.key

        try:
            created = int(time.mktime(self.created_time.timetuple()))
        except:
            created = int(time.mktime(self.created.timetuple()))
        try:
            updated = int(time.mktime(self.updated_time.timetuple()))
        except:
            updated = int(time.mktime(self.updated.timetuple()))
        if(int(updated - created) > 1):
            sl.operation = "UPDATED"
        else:
            sl.operation = "CREATED"

        if hasattr(self, 'indexed_data'):
            sl.indexed_data = uniquify(self.indexed_data)

        sl.put()
