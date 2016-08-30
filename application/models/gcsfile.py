from google.appengine.ext import ndb
from application.models.syslog import SysLog

class GCSFile(SysLog):
    link = ndb.StringProperty()
    kml_id = ndb.StringProperty()
    file_type = ndb.StringProperty()
    created_time = ndb.DateTimeProperty(auto_now_add=True)
    updated_time = ndb.DateTimeProperty(auto_now=True)