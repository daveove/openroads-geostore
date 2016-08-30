import logging
from decorators import login_required
from functions import error_message, success_message, wrap_response
from google.appengine.ext import ndb
from application.handlers.base import BaseHandler

# MODELS
from application.models.user import User
from application.models.teams import Teams
from application.models.usergroup import UserGroup
from application.models.environment import Environment

class UserGroupsHandler(BaseHandler):
    @login_required
    def get(self, group_id=None):
        if self.user.role != 'CLUSTERDIRECTOR':
            self.redirect('/environment')
            return

        self.tv['page_user_groups'] = True
        if group_id:
            group = UserGroup.get_by_id(int(group_id))
            if group:
                if self.GET("ta") == "join":
                    if self.user.current_email in group.invited_users:
                        if self.user.key in group.users:
                            msg = "You are already a member of the "
                            msg += group.title
                            msg += " user group."
                            error_message(self, msg)
                        else:
                            self.user.user_groups.append(str(group.key.id()))
                            self.user.put()

                            group.users.append(self.user.key)
                            group.invited_users.remove(self.user.current_email)
                            group.put()

                            if group.environments:
                                for environment in group.environments:
                                    environment = environment.get()
                                    if environment:
                                        if self.user.key not in environment.users:
                                            environment.users.append(self.user.key)
                                            environment.put()

                            msg = "You have successfully joined the "
                            msg += group.title
                            msg += " user group."
                            success_message(self, msg)
                    else:
                        msg = "Cannot find user group."
                        error_message(self, msg)

                    self.redirect("/groups")
                else:
                    if self.user.role == "CLUSTERDIRECTOR":
                        wrap_response(self, group.to_object())
                    else:
                        self.redirect("/groups")
            else:
                if self.user.role == "CLUSTERDIRECTOR":
                    wrap_response(self, {"error": "cannot find user group"})
                else:
                    self.redirect("/groups")
        else:
            query = UserGroup.query()
            if self.user.role == "CLUSTERDIRECTOR":
                query = query.filter(UserGroup.owner == self.user.key)
            else:
                query = query.filter(ndb.OR(UserGroup.users == self.user.key, UserGroup.invited_users == self.user.current_email))
            groups = query.fetch()

            self.tv["user_groups"] = []

            if groups:
                for g in groups:
                    if self.GET('fetch'):
                        if self.GET('environmentid'):
                            environment = Environment.get_by_id(int(self.GET('environmentid')))
                            if self.GET('addusergroup'):
                                if g.key not in environment.user_groups:
                                    self.tv["user_groups"].append(g.to_object())
                            elif self.GET('removeusergroup'):
                                if g.key in environment.user_groups:
                                    self.tv["user_groups"].append(g.to_object())
                    else:
                        self.tv["user_groups"].append(g.to_object())

            if self.GET('fetch'):
                wrap_response(self, self.tv['user_groups'])
                return

            self.tv["breadcrumb"] = [{
                "name": "User Groups",
                "link": "/groups"
            }]

            if self.user.role == "CLUSTERDIRECTOR":
                self.tv["show_new_group"] = True
                self.render("groups.html")
            else:
                self.render("groups-user.html")


    @login_required
    def post(self, group_id=None):
        if group_id:
            response = {}
            response["code"] = 200
            response["data"] = []
            response["description"] = ""
            response["success"] = True
            group = UserGroup.get_by_id(int(group_id))
            if group:
                if self.POST("action"):
                    if self.POST("action") == "delete_invited_user":
                        if self.POST("email").strip().lower() in group.invited_users:
                            group.invited_users.remove(self.POST("email").strip().lower())
                            group.put()

                            response['description'] = 'Invitation to ' + self.POST('email').strip().lower() + ' has been cancelled.'
                            response["data"] = group.to_object()
                    elif self.POST("action") == "remove_member":
                        user_key = ndb.Key('User', int(self.POST('user_id')))
                        if user_key in group.users:
                            if group.environments:
                                for environment in group.environments:
                                    environment = environment.get()
                                    if environment:
                                        if user_key in environment.users:
                                            environment.users.remove(user_key)
                                            environment.put()

                            group.users.remove(user_key)
                            group.put()

                            response["data"] = group.to_object()
                            response['description'] = 'User has been removed.'
                        else:
                            response['success'] = False
                            response['description'] = 'User is not a member of the user group.'
                    elif self.POST("action") == "invite_users":
                        if self.POST("email"):
                            for email in self.POST("email").strip().split(","):
                                email = email.strip().lower()

                                query = User.query()
                                query = query.filter(User.current_email == email)
                                user = query.get()

                                if user:
                                    user.user_groups.append(str(group.key.id()))
                                    user.put()

                                    group.users.append(user.key)
                                else:
                                    group.invited_users.append(email)

                            group.put()

                            response["data"] = group.to_object()
                    elif self.POST("action") == "leave_group":
                        if self.user.key in group.users:
                            group.users.remove(self.user.key)
                            group.put()

                            response["data"] = group.to_object()
                            response["description"] = "You have successfully left the "+ group.title.upper() +" user group."
                        else:
                            response["success"] = False
                            response["description"] = "User is not part of the team."
                    elif self.POST("action") == "update_group":
                        if self.POST("group_name"):
                            query = Teams.query()
                            query = query.filter(Teams.team_name == self.POST("group_name").strip().upper())
                            group2 = query.get()

                            logging.info(group2)
                            logging.info(group)

                            if group2:
                                if str(group2.key.id()) != str(group.key.id()):
                                    response["success"] = False
                                    response["description"] = "User group already exists."
                                    wrap_response(self, response)
                                    return

                            group.title = self.POST("group_name").strip().upper()

                        if self.POST("group_description"):
                            group.description = self.POST("group_description")

                        group.put()

                        response["data"] = group.to_object()

            wrap_response(self, response)
        else:
            if self.POST("group_name") \
               and self.POST("group_description") \
               and self.POST("group_member_emails"):
                # Create Environment
                # Only CLUSTERDIRECTOR role can create an environment
                if self.user.role != "CLUSTERDIRECTOR":
                    msg = "You have insufficient rights to access this application."
                    error_message(self, msg)
                    self.redirect("/groups")
                    return

                query = UserGroup.query()
                query = query.filter(UserGroup.title == self.POST("group_name").strip().upper())
                group = query.get()

                if group:
                    msg = "Could not create the user group. "
                    msg += self.POST("group_name").strip()
                    msg += " already exists."
                    error_message(self, msg)
                else:
                    group = UserGroup()
                    group.title = self.POST("group_name").strip().upper()
                    group.description = self.POST("group_description").strip()
                    group.owner = self.user.key

                    for email in self.POST("group_member_emails").split(","):
                        email = email.strip().lower()

                        query = User.query()
                        query = query.filter(User.current_email == email)
                        user = query.get()

                        if user:
                            group.users.append(user.key)
                        else:
                            group.invited_users.append(email)

                    group.put()

                    self.user.user_groups.append(str(group.key.id()))
                    self.user.put()

                    msg = "User group has been saved."
                    success_message(self, msg)

            self.redirect("/groups")