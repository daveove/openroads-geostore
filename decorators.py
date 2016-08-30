from functions import *
from settings import *
from cookie import *
import urllib
import logging


def api_logged_in_required(permissions=[], level=1):
    def decorator(fn):
        '''So we can decorate any RequestHandler with #@admin_required'''
        def wrapper(self, *args, **kwargs):
            response = {
                "code": 200,
                "method": "GET",
                "response": "OK",
                "data": []
            }

            if not self.user:
                if "Authorization" not in self.request.headers:
                    logging.info("No Authorization in headers")
                    desc = "You must be logged in to use the API."
                    response["success"] = False
                    response["response"] = "AuthorizationError"
                    response["description"] = desc
                    response["code"] = 400
                    wrap_response(self, response)
                    return

                token = Token.get_by_id(self.request.headers["Authorization"])
                if not token:
                    logging.info("Cannot find token: " +
                                 str(self.request.headers["Authorization"]))
                    desc = "The token you provided is invalid."
                    response["success"] = False
                    response["response"] = "InvalidTokenError"
                    response["description"] = desc
                    response["code"] = 400
                    wrap_response(self, response)
                    return

                logging.info(token)
                session = token.session.get()
                if not session:
                    logging.info("Cannot find session")
                    desc = "The token has already expired."
                    response["error"] = False
                    response["response"] = "InvalidTokenError"
                    response["description"] = desc
                    response["code"] = 400
                    wrap_response(self, response)
                    return

                logging.info(session)
                if session.expires < datetime.datetime.now() \
                        or session.status is False:
                    logging.info("token has expired or not active")
                    desc = "The token has already expired."
                    response["success"] = False
                    response["response"] = "InvalidTokenError"
                    response["description"] = desc
                    response["code"] = 400
                    wrap_response(self, response)
                    return

                owner = session.owner.get()
                self.user = owner
                if not owner:
                    logging.info("Cannot find user")
                    desc = "Cannot find user."
                    response["success"] = False
                    response["response"] = "InvalidUserError"
                    response["description"] = desc
                    response["code"] = 400
                    wrap_response(self, response)
                    return
            else:
                if level:
                    if self.user.level < level:
                        logging.info("User level has no access")
                        desc = "You have no access."
                        response["success"] = False
                        response["response"] = "NoAccessError"
                        response["description"] = desc
                        response["code"] = 400
                        wrap_response(self, response)
                        return

            return fn(self, *args, **kwargs)

        return wrapper
    return decorator


def csrf_protect(fn):
    '''So we can decorate any RequestHandler with #@csrf_protect'''
    def wrapper(self, *args, **kwargs):
        if not self.user:
            if get_cookie(self, "_csrf_") == self.request.POST.get("token"):
                return fn(self, *args, **kwargs)
            else:
                msg = 'We were unable to process your request.'
                msg += 'Please refresh the page and try again.'
                error_message(self, msg)
                self.redirect('/')
        else:
            if self.user:
                if self.user.csrf_token == self.request.POST.get('token'):
                    return fn(self, *args, **kwargs)
            logging.info('wrong token')
            self.error(400)
            return
    return wrapper


def login_required(fn):
    '''So we can decorate any RequestHandler with #@admin_required'''
    def wrapper(self, *args, **kwargs):
        if not self.user:
            if self.request.get('redirect'):
                self.redirect(get_login_url(
                    self.request.uri[0:(self.request.uri.find('?'))]))
                msg = "Please login."
                error_message(self, msg)
                return
            else:
                self.redirect(get_login_url(self.request.uri))
                msg = "Please login."
                error_message(self, msg)
                return
        else:
            return fn(self, *args, **kwargs)

    return wrapper


def allowed_users(permissions=[], level=1):  # this is a handler level decorator
    def decorator(fn):
        def wrapper(self, *args, **kwargs):
            if self.user:
                if self.user.level >= level:
                    return fn(self, *args, **kwargs)

                self.tv["error_PAGE"] = True
                self.error(404)
                self.render('error404.html')
                return
            else:
                if self.request.get('redirect'):
                    uri = self.request.uri.find('?')
                    self.redirect(get_login_url(
                        self.request.uri[0:(uri)], "Please Log In"))
                else:
                    self.redirect(get_login_url(
                        self.request.uri, "Please Log In"))

        return wrapper
    return decorator
