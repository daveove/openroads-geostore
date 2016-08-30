#!/usr/bin/env python
# -*- coding: utf-8 -*-
import jinja2
import webapp2
import logging
import threading
from mandrill_email import *
from webapp2_extras import routes
from cookie import *
from settings import *
from decorators import *
from functions import *
from google.appengine.api import taskqueue
from google.appengine.datastore.datastore_query import Cursor

# HANDLERS
from application.handlers.pages.geoprocessing \
    import GeoprocessingDashboardHandler
from application.handlers.pages.geoprocessing \
    import GeoprocessingClassificationHandler
from application.handlers.pages.geoprocessing \
    import GeoprocessingToolHandler
from application.handlers.pages.geoprocessing \
    import GeoprocessingToolImagesHandler
from application.handlers.pages.geoprocessing \
    import GeoprocessedPageHandler
from application.handlers.pages.geoprocessing \
    import ForGeoprocessedPageHandler
from application.handlers.pages.statistics import StatisticsDashboard
from application.handlers.pages.statistics import StatisticsDashboard2
from application.handlers.pages.login import LoginHandler
from application.handlers.pages.loginoauth import LoginOauthHandler
from application.handlers.pages.verifylogincode import VerifyLoginCode
from application.handlers.pages.logoutapi import LogoutApiHandler
from application.handlers.pages.projectdashboard import ProjectDashboardHandler
from application.handlers.pages.logout import LogoutHandler
from application.handlers.pages.register import RegisterHandler
from application.handlers.pages.agencyadminregistration \
    import AgencyAdminRegistrationHandler
from application.handlers.pages.dashboard import DashboardHandler
from application.handlers.pages.adminregister import AdminRegisterHandler
from application.handlers.pages.upload import UploadHandler
from application.handlers.pages.viewer import ViewerHandler
from application.handlers.pages.import_ import ImportHandler
from application.handlers.pages.invitedenvironment \
    import InvitedEnvironmentHandler
from application.handlers.pages.scriptuploading import ScriptUploadingHandler
from application.handlers.pages.publicuserregistration \
    import PublicUsersRegistrationHandler
from application.handlers.pages.passwordreset import PasswordResetHandler
from application.handlers.pages.verifyregister import VerifyRegisterHandler
from application.handlers.pages.sendverification import SendVerificationHandler
from application.handlers.pages.usergroups import UserGroupsHandler
from application.handlers.pages.classificationtokml \
    import ClassificationToKMLHandler
from application.handlers.pages.environment import EnvironmentHandler
from application.handlers.pages.permission import PermissionHandler
from application.handlers.pages.taskqueueemails import TaskQueueEmailsHandler
from application.handlers.pages.taskcounter import TaskCounterHandler
from application.handlers.pages.taskimage import TaskImageHandler
from application.handlers.api.psgc import PSGCHandler
from application.handlers.api.redflags import RedFlagsHandler
from application.handlers.api.apiproxy import APIProxyHandler
from application.handlers.api.uacsapi import UACSAPIHandler
from application.handlers.api.uacsapiv2 import UACSAPIV2Handler
from application.handlers.api.usersapi import UsersApiHandler
from application.handlers.api.environmentsapi import EnvironmentsApiHandler
from application.handlers.api.usergroupsapi import UserGroupsApiHandler
from application.handlers.api.dataapi import DataApiHandler
from application.handlers.api.logs import LogsHandler
from application.handlers.api.classificationupload \
    import ClassificationUploadHandler
from application.handlers.api.apikmldownloader import APIKMLDownloader
from application.handlers.api.dataapiupdate import DataApiUpdateHandler
from application.handlers.api.dataapipublish import DataApiPublishHandler
from application.handlers.api.dataapidetails import DataApiDetailsHandler
from application.handlers.api.kmllength import KMLLengthHandler
from application.handlers.api.program import ProgramAPIHandler
from application.handlers.pages.error import ErrorHandler
from application.handlers.pages.logexception import LogExceptionHandler
from application.handlers.pages.main_ import MainHandler
from application.handlers.pages.program import ProgramHandler
from application.handlers.pages.agency import AgencyHandler
from application.handlers.pages.workspace import WorkspaceHandler
from application.handlers.pages.new_statistics import NewStatisticsDashboard
from application.handlers.pages.generate_statistics import GenerateStatisticsHandler

from application.models.apidata import APIData
from google.appengine.ext import ndb


class TaskRePutHandler(webapp2.RequestHandler):
    def post(self):

        # get 50 records
        n = 50
        count = 0
        curs = None
        if self.request.get('cursor'):
            curs = Cursor(urlsafe=self.request.get('cursor'))

        if self.request.get('count'):
            count = int(self.request.get('count'))
        query = APIData.query().order(APIData.created_time)
        data, cursor, more = query.fetch_page(n, start_cursor=curs)

        # reput
        if data:
            ndb.put_multi(data)

        count += len(data)

        logging.debug('count: ' + str(count))

        # pass cursor
        if len(data) == n and cursor:
            taskqueue.add(
                url=('/api/v1/JMKr5roUu0EQyssRVv8mvkgXsmQBt3sgNDbfoBIkwoUi59dz'
                     'zQJnvmQ5jIlNtC4c'),
                params={'cursor': cursor.urlsafe(), 'count': str(count)}
            )


this_thread = threading.local()
jinja_workspace = jinja2.Environment(
    loader=jinja2.FileSystemLoader('application/frontend/'),
    autoescape=True,
    trim_blocks=True)
jinja_workspace.filters['to_date_format_only'] = to_date_format_only

app = webapp2.WSGIApplication([
    routes.DomainRoute(r'<:.*>', [
        webapp2.Route('/', MainHandler),
        webapp2.Route('/dashboard', DashboardHandler),
        webapp2.Route('/dashboard/statistics', StatisticsDashboard),
        webapp2.Route('/dashboard/statistics2', StatisticsDashboard2),
        # webapp2.Route(r'/statistics/generate/<:.*>', GenerateStatisticsHandler),
        webapp2.Route('/statistics/generate', GenerateStatisticsHandler),
        webapp2.Route('/statistics', NewStatisticsDashboard),
        webapp2.Route(r'/projects/<:.*>/<:.*>/<:.*>/<:.*>/<:.*>/<:.*>',
                      ProjectDashboardHandler),
        webapp2.Route(r'/projects/<:.*>/<:.*>/<:.*>/<:.*>/<:.*>',
                      ProjectDashboardHandler),
        webapp2.Route(r'/projects/<:.*>/<:.*>/<:.*>/<:.*>',
                      ProjectDashboardHandler),
        webapp2.Route(r'/projects/<:.*>/<:.*>/<:.*>', ProjectDashboardHandler),
        webapp2.Route(r'/projects/<:.*>/<:.*>', ProjectDashboardHandler),
        webapp2.Route(r'/projects/<:.*>', ProjectDashboardHandler),
        webapp2.Route(r'/upload/<:.*>/<:.*>/<:.*>/<:.*>', UploadHandler),
        webapp2.Route(r'/upload/<:.*>/<:.*>/<:.*>', UploadHandler),
        webapp2.Route(r'/upload/<:.*>/<:.*>', UploadHandler),
        webapp2.Route(r'/upload/<:.*>', UploadHandler),
        webapp2.Route('/projects', ProjectDashboardHandler),
        webapp2.Route(r'/programs/<:.*>/<:.*>', ProgramHandler),
        webapp2.Route(r'/programs/<:.*>', ProgramHandler),
        webapp2.Route('/programs', ProgramHandler),
        webapp2.Route(r'/agencies/<:.*>', AgencyHandler),
        webapp2.Route('/agencies', AgencyHandler),
        webapp2.Route('/viewer', ViewerHandler),
        webapp2.Route('/import', ImportHandler),
        webapp2.Route(r'/import/<:.*>', ImportHandler),
        webapp2.Route(r'/invite/workspace/<:.*>', InvitedEnvironmentHandler),
        webapp2.Route(r'/su/<:.*>', ScriptUploadingHandler),
        webapp2.Route('/login', LoginHandler),
        webapp2.Route('/login/authorize', LoginOauthHandler),
        webapp2.Route(r'/login/verify/<:.*>', VerifyLoginCode),
        webapp2.Route('/logout', LogoutHandler),
        webapp2.Route('/api/logout', LogoutApiHandler),
        webapp2.Route('/register', RegisterHandler),
        webapp2.Route('/admin/register', AdminRegisterHandler),
        webapp2.Route('/register/verify', VerifyRegisterHandler),
        webapp2.Route('/register/verify/send', SendVerificationHandler),
        webapp2.Route('/agency/admins', AgencyAdminRegistrationHandler),
        webapp2.Route('/users/registration', PublicUsersRegistrationHandler),
        webapp2.Route('/password/reset', PasswordResetHandler),
        webapp2.Route('/groups', UserGroupsHandler),
        webapp2.Route(r'/groups/<:.*>', UserGroupsHandler),
        webapp2.Route('/workspace', WorkspaceHandler),
        webapp2.Route(r'/workspace/<:.*>', WorkspaceHandler),
        webapp2.Route('/geoprocessing/dashboard',
                      GeoprocessingDashboardHandler),
        webapp2.Route('/geoprocessing/for_geoprocessing',
                      ForGeoprocessedPageHandler),
        webapp2.Route('/geoprocessing/geoprocessed', GeoprocessedPageHandler),
        webapp2.Route('/geoprocessing/classification',
                      GeoprocessingClassificationHandler),
        webapp2.Route('/geoprocessing/tool', GeoprocessingToolHandler),
        webapp2.Route('/geoprocessing/tool/images',
                      GeoprocessingToolImagesHandler),
        webapp2.Route('/geoprocessing/kml/download',
                      ClassificationToKMLHandler),
        # TASKQUEUE
        webapp2.Route('/tasks/email/send', TaskQueueEmailsHandler),
        webapp2.Route('/tasks/counter', TaskCounterHandler),
        webapp2.Route('/tasks/images', TaskImageHandler),
        # API ENDPOINTS
        webapp2.Route('/api/v1/length', KMLLengthHandler),
        webapp2.Route(r'/api/v1/programs/<:.*>', ProgramAPIHandler),
        webapp2.Route('/api/v1/programs', ProgramAPIHandler),
        webapp2.Route('/api/v1/psgc', PSGCHandler),
        webapp2.Route('/api/v1/redflags', RedFlagsHandler),
        webapp2.Route('/api/v1/proxy', APIProxyHandler),
        webapp2.Route('/api/v1/uacs', UACSAPIHandler),
        webapp2.Route('/api/v2/uacs', UACSAPIV2Handler),
        webapp2.Route('/api/v1/permissions', PermissionHandler),
        webapp2.Route('/api/v1/users', UsersApiHandler),
        webapp2.Route(r'/api/v1/users/<:.*>', UsersApiHandler),
        webapp2.Route('/api/v1/workspaces', EnvironmentsApiHandler),
        webapp2.Route(r'/api/v1/workspaces/<:.*>', EnvironmentsApiHandler),
        webapp2.Route('/api/v1/groups', UserGroupsApiHandler),
        webapp2.Route(r'/api/v1/groups/<:.*>', UserGroupsApiHandler),
        webapp2.Route('/api/v1/classification', ClassificationUploadHandler),
        webapp2.Route('/api/v1/KML', APIKMLDownloader),
        webapp2.Route('/api/v1/data', DataApiHandler),
        webapp2.Route(r'/api/v1/data/<:.*>/update', DataApiUpdateHandler),
        webapp2.Route(r'/api/v1/data/<:.*>/publish', DataApiPublishHandler),
        webapp2.Route(r'/api/v1/data/<:.*>', DataApiDetailsHandler),

        webapp2.Route(r'/api/v1/logs', LogsHandler),

        webapp2.Route(r'/<:.*>', ErrorHandler)
    ])
], debug=True)
app.error_handlers[500] = LogExceptionHandler.log_exception
