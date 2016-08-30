import os
from google.appengine.api import app_identity

USER_ROLES = [
    "SYSADMIN",
    "OPENDATAADMIN",
    "AGENCYADMIN",
    "COA",
    "CLUSTERDIRECTOR",
    "USER"
]

USER_TYPES = [
    "GOV",
    "PUBLIC",
    "CONTRACTOR",
]

USER_REGISTER = True
APP_IS_LOCAL = False
APP_IS_TESTING = False
SESSION_EXPIRY = 8  # hours
CURRENT_URL = str(os.environ.get('wsgi.url_scheme'))
CURRENT_URL += "://"+str(os.environ.get('HTTP_HOST'))+"/"
BUCKET_NAME = "/openroads-geostore/uploads/"

if 'staging' in app_identity.get_application_id() \
   or "localhost" in CURRENT_URL:
    APP_IS_STAGING = True
else:
    APP_IS_STAGING = False

if APP_IS_STAGING:
    BUCKET_NAME = "/coageostore-staging.appspot.com/uploads/"

if 'localhost' in CURRENT_URL:
    APP_IS_LOCAL = True
    COOKIE_PARENT_DOMAIN = 'localhost'
elif APP_IS_STAGING:
    COOKIE_PARENT_DOMAIN = '.appspot.com'
else:
    COOKIE_PARENT_DOMAIN = '.appspot.com'

LOGIN_KEY = '<INSERT KEY HERE>'
API_KEY = '<INSERT KEY HERE>'
SYNONYMS_KEY = '<INSERT KEY HERE>'

MANDRILL_API_KEY = "<INSERT KEY HERE>"
MANDRILL_API_BASE_ENDPOINT = "https://mandrillapp.com/api/1.0/"
MANDRILL_SENDER = "geostore@sym.ph"

RESPONSE = {
    "response": "UNKNOWN",
    "description": "",
    "code": 200,
}

RED_FLAGS = {
    'KML_DATE_DIFFERENT': 'KML last known date is different as the images \
                          (more than 14 days difference)',
    'IMAGES_LATE_UPLOAD': 'Images have been uploaded more than 2 weeks after \
                          date of capture',
    'IMAGES_MORE_THAN_50': 'Some images are not 50 meters apart',
    'LESS_THAN_4_PHOTOS': 'There are points that have less than 4 photos',
    'INCONSISTENT_KMLS': 'KMLs have inconsistent tracks',
    'OVERLAPPING_KMLS': 'KMLs of different roads are overlapping or in close  \
                        proximity'
}


GEOSTORE_ADMIN_API_KEY = '<INSERT KEY HERE>'
