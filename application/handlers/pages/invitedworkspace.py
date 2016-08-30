from application.handlers.base import BaseHandler

# MODELS
from application.models.user import User

class InvitedWorkspaceHandler(BaseHandler):
    def get(self, workspace=None):
        if workspace:
            query = User.query()
            query = query.filter(User.current_email == self.request.get('email'))
            user = query.get()
            if not user:
                self.redirect('/register?invite=' + workspace)
            else:
                self.redirect('/workspace/' + workspace + '?ta=join')