import logging

from .version import __version__
from .sendgrid import SendGridClient
from .exceptions import SendGridError, SendGridClientError, SendGridServerError
from .message import Mail
from credentials import *

def send_via_sendgrid(
        receiver, subject, html=None,
        plain_text=None, from_name=FROM_NAME,
        reply_to=FROM_EMAIL):

    sg = SendGridClient(SENDGRID_API_KEY)
    
    if type(receiver) is list:   
        message = Mail() 

        for r in receiver:
            if 'email' in r:
                message.add_to(r['email'])

                if 'name' in r:
                    message.add_to_name(r['name'])
            else:
                logging.debug('missing email address')

        try:
            if plain_text:
                message.set_text(plain_text)

            if html:
                message.set_html(html)

            message.set_replyto(reply_to)
            message.set_subject(subject)
            message.set_from(FROM_EMAIL)
            message.set_from_name(FROM_NAME)

            status, msg = sg.send(message)

            logging.debug(status)
            logging.debug(msg)
        except Exception, e:
            logging.exception('An error occured while sending the email: ' + str(e))