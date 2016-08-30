from application.handlers.base import BaseHandler

# MODELS
from application.models.user import User

class InvitedEnvironmentHandler(BaseHandler):
    def get(self, environment=None):
        if environment:
            query = User.query()
            query = query.filter(User.current_email == self.request.get('email'))
            user = query.get()
            if not user:
                self.redirect('/register?invite=' + environment)
            else:
                self.redirect('/workspace/' + environment + '?ta=join')