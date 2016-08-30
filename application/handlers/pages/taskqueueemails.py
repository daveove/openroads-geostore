import logging
import urllib
from mandrill_email import send_email
from application.handlers.base import BaseHandler

class TaskQueueEmailsHandler(BaseHandler):
    def post(self):
        if self.POST("subject") and self.POST("email_type"):
            logging.info("prepping email")

            content = {}
            for arg in self.request.arguments():
                values = self.request.get(arg)
                content[arg] = values

            logging.info(content)

            send_email(
                receiver_name=self.POST("receiver_name"),
                receiver_email=urllib.unquote(self.POST("receiver_email")),
                subject=self.POST("subject"),
                content=content,
                email_type=self.POST("email_type"))