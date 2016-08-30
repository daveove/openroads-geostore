import logging
from functions import *
from decorators import login_required, csrf_protect
from mandrill_email import *
from google.appengine.api import taskqueue
from google.appengine.ext import ndb
from google.appengine.datastore.datastore_query import Cursor
from application.handlers.base import BaseHandler

# MODELS
from application.models.environment import Environment
from application.models.apidata import APIData
from application.models.usergroup import UserGroup
from application.models.user import User

class EnvironmentHandler(BaseHandler):
    @login_required
    def get(self, environment_id=None):
        self.tv['page_environments'] = True
        if environment_id:
            team = Environment.get_by_id(int(environment_id))
            if team:
                if self.GET("ta") == "join":
                    try:
                        if self.user.current_email in team.invited_users:
                            if self.user.key in team.users:
                                msg = "You are already a member of the "
                                msg += team.title
                                msg += " team."
                                error_message(self, msg)
                            else:
                                team.users.append(self.user.key)
                                team.invited_users.remove(self.user.current_email)
                                team.put()

                                msg = "You have successfully joined the "
                                msg += team.title
                                msg += " team."
                                success_message(self, msg)
                        else:
                            msg = "Cannot find environment. You may have already joined the environment or the invitation has been cancelled."
                            error_message(self, msg)

                        self.redirect("/environment")
                    except Exception, e:
                        logging.exception(e)
                else:
                    if self.user.role == "CLUSTERDIRECTOR" \
                       or self.user.key in team.users \
                       or self.user.current_email.lower() in team.invited_users:
                        wrap_response(self, team.to_object())
                    else:
                        self.redirect("/dashboard")
            else:
                if self.user.role == "CLUSTERDIRECTOR":
                    wrap_response(self, {"error": "cannot find team"})
                else:
                    self.redirect("/dashboard")
        else:
            query = Environment.query()

            response = {}
            response["environments"] = []

            if self.GET("fetch"):
                query = query.filter(ndb.OR(Environment.users == self.user.key, Environment.invited_users == self.user.current_email.lower()))
                query = query.order(Environment.key)

                if self.GET("cursor"):
                    curs = Cursor(urlsafe=self.GET("cursor"))
                    environments, cursor, more = query.fetch_page(30, start_cursor=curs)
                else:
                    environments, cursor, more = query.fetch_page(30)

                if environments:
                    for environment in environments:
                        response["environments"].append(environment.to_object())

                    if more:
                        response["cursor"] = cursor.urlsafe()

                wrap_response(self, response)
                return

            if self.user.role != 'CLUSTERDIRECTOR':
                query = query.filter(Environment.invited_users == self.user.current_email)
                environments = query.fetch()

                if environments:
                    for environment in environments:
                        if self.user.current_email in environment.invited_users:
                            environment.invited_users.remove(self.user.current_email)
                            environment.users.append(self.user.key)
                            environment.users_email.append(self.user.current_email)
                            environment.put()

                query = Environment.query()

            query = query.filter(Environment.users == self.user.key)
            if self.user.role in ["CLUSTERDIRECTOR", 'GEOSTOREADMIN', 'USER']:
                if not self.GET("current_environment"):
                    environment = query.get()
                    if environment:
                        self.redirect("/environment?current_environment=" + str(environment.key.id()))
                        return
                    else:
                        self.tv["datasets"] = []
                        self.tv["environments"] = []
                        self.render("environments.html")
                        return
                elif self.GET("current_environment").lower() == 'all':
                    environment = query.get()
                    if environment:
                        self.redirect("/environment?current_environment=" + str(environment.key.id()))
                        return
                    else:
                        self.tv["datasets"] = []
                        self.tv["environments"] = []
                        self.render("environments.html")
                        return

                self.tv["current_environment"] = self.GET("current_environment").lower()

                if self.GET("cursor"):
                    curs = Cursor(urlsafe=self.GET("cursor"))
                    environments, cursor, more = query.fetch_page(30, start_cursor=curs)
                else:
                    environments, cursor, more = query.fetch_page(30)

                self.tv["datasets"] = []
                self.tv["environments"] = []
                if environments:
                    for environment in environments:
                        self.tv["environments"].append(environment.to_object())

                tag = create_indexed_tag("type", "DATASET")

                query = APIData.query()
                query = query.filter(APIData.indexed_data == tag)

                if self.GET("current_environment").lower() != "all":
                    key = ndb.Key("Environment", int(self.GET("current_environment")))
                    query = query.filter(APIData.environment == key)

                if self.GET("cursor"):
                    curs = Cursor(urlsafe=self.GET("cursor"))
                    datasets, cursor, more = query.fetch_page(50, start_cursor=curs)
                else:
                    datasets, cursor, more = query.fetch_page(50)

                if datasets:
                    for d in datasets:
                        self.tv["datasets"].append(d.to_api_object())

                self.tv["show_new_team"] = True
                self.render("environments.html")
            else:
                self.render("user-environment.html")

    @login_required
    @csrf_protect
    def post(self, team_id=None):
        if team_id:
            response = {}
            response["code"] = 200
            response["data"] = []
            response["description"] = ""
            response["success"] = True
            team = Environment.get_by_id(int(team_id))
            if team:
                if self.POST("action"):
                    if self.POST("action") == "delete_invited_user":
                        if self.POST("email").strip().lower() in team.invited_users:
                            team.invited_users.remove(self.POST("email"))
                            team.put()

                            response["data"] = team.to_object()
                            response['description'] = 'Invitation to ' + self.POST('email').strip().lower() + ' has been cancelled.'
                    elif self.POST("action") == "remove_member":
                        user = User.get_by_id(int(self.POST("user_id")))

                        if user.key in team.users:
                            team.users.remove(user.key)
                            team.put()

                        if str(team.key.id()) in user.access_key:
                            user.access_key.remove(str(team.key.id()))

                        if str(team.key.id()) in user.teams:
                            user.teams.remove(str(team.key.id()))

                        user.put()
                        response["data"] = team.to_object()
                    elif self.POST("action") == "invite_users":
                        existing_invite = []
                        flag = True
                        if self.POST("email"):
                            for email in self.POST("email").strip().split(","):
                                email = email.strip().lower()

                                query = User.query()
                                query = query.filter(User.current_email == email)
                                user = query.get()

                                if user:
                                    team.users.append(user.key)
                                    team.users_email.append(user.current_email)
                                    team.put()

                                    content = {
                                        "sender": self.user.name,
                                        "team_name": team.title,
                                        "team_id": str(team.key.id()),
                                        "receiver_name": "",
                                        "receiver_email": email,
                                        "subject": "You have been added to an environment",
                                        "email_type": "environment_add"
                                    }
                                else:
                                    team.invited_users.append(email)
                                    team.put()

                                    content = {
                                        "sender": self.user.name,
                                        "team_name": team.title,
                                        "team_id": str(team.key.id()),
                                        'user_email': base64.b64encode(email),
                                        "receiver_name": "",
                                        "receiver_email": email,
                                        "subject": "You have been invited to join an environment",
                                        "email_type": "environment_invite"
                                    }

                                taskqueue.add(
                                    url="/tasks/email/send",
                                    params=content,
                                    method="POST")

                            response["data"] = team.to_object()
                    elif self.POST("action") == "leave_team":
                        if str(self.user.key.id()) in team.users:
                            team.users.remove(str(self.user.key.id()))
                            team.put()

                            self.user.teams.remove(str(team.key.id()))
                            self.user.put()

                            response["data"] = team.to_object()
                        else:
                            response["success"] = False
                            response["description"] = "User is not part of the environment."
                    elif self.POST("action") == "join_environment":
                        if self.user.current_email.lower() in team.invited_users:
                            if self.user.key not in team.users:
                                team.users.append(self.user.key)
                                team.users_email.append(self.user.current_email)
                            try:
                                team.invited_users.remove(self.user.current_email.lower())
                            except:
                                logging.info("Email is not in invited users")
                                pass

                            team.put()

                            response["data"] = team.to_object()
                        else:
                            response['success'] = False
                            if self.user.key in team.users:
                                response['description'] = "You are already a member of "+ team.title.upper() +" environment."
                            else:
                                response['description'] = "You have insufficient rights to join the environment."
                    elif self.POST("action") == "update_team":
                        if self.POST("environment_name"):
                            query = Environment.query()
                            query = query.filter(Environment.title == self.POST("environment_name").strip().upper())
                            team2 = query.get()

                            logging.info(team2)
                            logging.info(team)

                            if team2:
                                if str(team2.key.id()) != str(team.key.id()):
                                    response["success"] = False
                                    response["description"] = "Environment name "+self.POST("environment_name").strip().upper()+" already exists."
                                    wrap_response(self, response)
                                    return

                            team.title = self.POST("environment_name")

                        if self.POST("environment_description"):
                            team.description = self.POST("environment_description")


                        if self.POST("visibility") == 'PUBLIC' and team.private:
                            # get all datasets in this environment, and add public environment
                            datasets = APIData.query(APIData.environment == team.key).fetch(5000)
                            modified_datasets = []
                            for dataset in datasets:
                                has_public = False
                                for environment in dataset.environment:
                                    if environment.id() == 'PUBLIC':
                                        has_public = True
                                if not has_public:
                                    dataset.environment.append(ndb.Key('Environment', 'PUBLIC'))
                                    modified_datasets.append(dataset)

                            if modified_datasets:
                                ndb.put_multi(modified_datasets)

                            team.private = False
                            team.put()

                            response['success'] = True
                            response['description'] = 'Environment Visibility Updated'

                        elif self.POST("visibility") == 'PRIVATE' and not team.private:
                            # get all datasets in this environment, and remove public environment
                            datasets = APIData.query(APIData.environment == team.key).fetch(5000)
                            modified_datasets = []
                            for dataset in datasets:
                                has_public = False
                                new_dataset_environments = []
                                for environment in dataset.environment:
                                    if environment.id() != 'PUBLIC':
                                        new_dataset_environments.append(environment)
                                    else:
                                        has_public = True
                                if has_public:
                                    dataset.environment = new_dataset_environments
                                    modified_datasets.append(dataset)

                            if modified_datasets:
                                ndb.put_multi(modified_datasets)

                            team.private = True
                            team.put()

                            response['success'] = True
                            response['description'] = 'Environment Visibility Updated'

                        team.put()

                        response["data"] = team.to_object()
                    elif self.POST('action') == 'add_user_group':
                        response["user_groups"] = []
                        if self.POST('user_groups'):
                            user_groups = json.loads(self.POST('user_groups'))

                            for g in user_groups:
                                group = UserGroup.get_by_id(int(g))
                                if group:
                                    if group.key not in team.user_groups:
                                        if group.users:
                                            for u in group.users:
                                                if u not in team.users:
                                                    user = u.get()
                                                    if user:
                                                        if user.current_email in team.invited_users:
                                                            team.invited_users.remove(user.current_email.lower())

                                                        team.users_email.append(user.current_email)
                                                        team.users.append(u)

                                        group.environments.append(team.key)
                                        group.put()

                                        response["user_groups"].append(group.to_object())

                                        team.user_groups.append(group.key)
                            team.put()
                            response['description'] = 'User group(s) has been added to '+team.title.upper()+' environment.'
                        else:
                            response['success'] = False
                            response['description'] = 'Invalid user group.'

                        response['environment'] = team.to_object()
                    elif self.POST('action') == 'remove_user_group':
                        if self.POST('group_id'):
                            group = UserGroup.get_by_id(int(self.POST('group_id')))
                            if group:
                                if group.key in team.user_groups:
                                    if group.users:
                                        for u in group.users:
                                            if u in team.users:
                                                if u != team.owner:
                                                    team.users.remove(u)

                                if team.key in group.environments:
                                    group.environments.remove(team.key)
                                    group.put()

                                team.user_groups.remove(group.key)
                                team.put()
                            response['description'] = 'User group(s) has been removed from '+team.title.upper()+' environment.'
                            response['environment'] = team.to_object()
                            response['user_group'] = group.to_object()
                        else:
                            response['success'] = False
                            response['description'] = 'Invalid user group.'

            wrap_response(self, response)
        else:
            if self.POST("environment_name") \
               and self.POST("environment_description"):
                # Create Environment
                # Only CLUSTERDIRECTOR role can create an environment
                if self.user.role != "CLUSTERDIRECTOR":
                    msg = "You have insufficient rights to access this application."
                    error_message(self, msg)
                    self.redirect("/environment")
                    return

                query = Environment.query()
                query = query.filter(Environment.title == self.POST("environment_name").strip().upper())
                environment = query.get()

                if environment:
                    msg = "Could not create the environment. "
                    msg += self.POST("environment_name").strip()
                    msg += " already exists."
                    error_message(self, msg)
                else:
                    environment = Environment()
                    environment.title = self.POST("environment_name").strip().upper()
                    environment.description = self.POST("environment_description").strip()
                    environment.owner = self.user.key
                    environment.users.append(self.user.key)
                    environment.users_email.append(self.user.current_email)
                    environment.put()

                    if self.request.get_all('user_group'):
                        for group_id in self.request.get_all('user_group'):
                            user_group = UserGroup.get_by_id(int(group_id))
                            if user_group:
                                if user_group.users:
                                    for u in user_group.users:
                                        user = u.get()
                                        if user:
                                            user.user_groups.append(str(user_group.key.id()))
                                            environment.users.append(user.key)
                                            environment.users_email.append(user.current_email)

                                environment.user_groups.append(user_group.key)
                                user_group.environments.append(environment.key)
                                user_group.put()

                    if self.POST("environment_member_emails"):
                        for email in self.POST("environment_member_emails").split(","):
                            query = User.query()
                            query = query.filter(User.current_email == email.strip().lower())
                            user = query.get()

                            if user:
                                environment.users.append(user.key)
                                environment.users_email.append(user.current_email)
                                environment.put()

                                content = {
                                    "sender": self.user.name,
                                    "team_name": environment.title,
                                    "team_id": str(environment.key.id()),
                                    "receiver_name": "",
                                    "receiver_email": email,
                                    "subject": "You have been added to an environment",
                                    "email_type": "environment_add"
                                }
                            else:
                                environment.invited_users.append(email.strip().lower())
                                environment.put()

                                content = {
                                    "sender": self.user.name,
                                    "team_name": environment.title,
                                    "team_id": str(environment.key.id()),
                                    "receiver_name": "",
                                    "receiver_email": email,
                                    "subject": "You have been invited to join an environment",
                                    "email_type": "environment_invite"
                                }

                            taskqueue.add(
                                url="/tasks/email/send",
                                params=content,
                                method="POST")

                    msg = "Environment has been saved."
                    success_message(self, msg)
                    self.redirect('/environment?current_environment=' + str(environment.key.id()))
                    return

            self.redirect("/environment")