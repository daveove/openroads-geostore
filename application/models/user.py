import time
import datetime
import hashlib
from google.appengine.api import taskqueue
from google.appengine.ext import ndb
from application.models.syslog import SysLog
from functions import *
from mandrill_email import send_email
from passlib.hash import pbkdf2_sha512


class User(SysLog):
    first_name = ndb.StringProperty(default="")
    middle_name = ndb.StringProperty(default="")
    last_name = ndb.StringProperty(default="")
    name = ndb.StringProperty(default="")
    mobile_number = ndb.StringProperty(default="")
    original_email = ndb.StringProperty(default="")
    current_email = ndb.StringProperty(default="")
    email_list = ndb.StringProperty(repeated=True)
    password = ndb.StringProperty(default="")
    hashed_password = ndb.StringProperty(default="")
    street_address = ndb.StringProperty()
    province = ndb.StringProperty()
    city = ndb.StringProperty()
    salutation = ndb.StringProperty()
    designation = ndb.StringProperty()
    department = ndb.StringProperty()
    teams = ndb.StringProperty(repeated=True)
    agency = ndb.StringProperty()
    region = ndb.StringProperty()
    operating_unit = ndb.StringProperty()
    uacs = ndb.StringProperty()
    org_id = ndb.StringProperty()
    org_name = ndb.StringProperty()
    office_order_number = ndb.StringProperty()
    has_office_order_number = ndb.BooleanProperty(default=False)
    csrf_token = ndb.StringProperty(default="")
    user_groups = ndb.StringProperty(repeated=True)
    confirmation_token = ndb.StringProperty()
    password_token = ndb.StringProperty()
    active = ndb.BooleanProperty(default=True)
    role = ndb.StringProperty(default="USER")
    level = ndb.IntegerProperty(default=1)
    status = ndb.StringProperty(default="PENDING")
    access_key = ndb.StringProperty(repeated=True)
    permissions = ndb.StringProperty(repeated=True)
    approved_by_name = ndb.StringProperty()
    approved_by_key = ndb.KeyProperty(kind="User")
    approved_on = ndb.DateTimeProperty(default=None)
    disapproved_by_name = ndb.StringProperty()
    disapproved_by_key = ndb.KeyProperty(kind="User")
    disapproved_on = ndb.DateTimeProperty(default=None)
    last_login = ndb.DateTimeProperty()
    password_update = ndb.DateTimeProperty(default=None)
    previous_passwords = ndb.StringProperty(repeated=True)
    created_time = ndb.DateTimeProperty(auto_now_add=True)
    updated_time = ndb.DateTimeProperty(auto_now=True)

    def hash_password(self, given_password):
        """
            Returns a hashed password using PBKDF2 (SHA512).
        """
        return pbkdf2_sha512.encrypt(given_password)

    def verify_password(self, given_password):
        """
            Verifies the user password on the database with the give
            password on the form.
        """
        return pbkdf2_sha512.verify(given_password, self.hashed_password)

    def to_object(self, token=None):
        """
            Converts the entity to JSON.
        """
        data = {}
        data["id"] = str(self.key.id())
        data['key'] = self.key.urlsafe()
        data["username"] = ""
        data["first_name"] = self.first_name
        data["middle_name"] = self.middle_name
        data["last_name"] = self.first_name
        data["name"] = " ".join([self.first_name, self.last_name])
        data["mobile_number"] = self.mobile_number
        data["email"] = self.current_email
        data["teams"] = self.teams
        # data["csrf_token"] = self.csrf_token
        data["active"] = self.active
        data["status"] = self.status
        data["level"] = self.level
        data["street_address"] = self.street_address
        data["province"] = self.province
        data["city"] = self.city
        data["salutation"] = self.salutation
        data["designation"] = self.designation
        data["department"] = self.department
        data["agency"] = self.agency
        data["region"] = self.region
        data["operating_unit"] = self.operating_unit
        data["uacs"] = self.uacs
        data["org_id"] = self.org_id
        data["org_name"] = self.org_name
        data["permissions"] = self.permissions
        email_md5 = self.current_email.lower().strip()
        email_md5 = hashlib.md5(email_md5).hexdigest()
        data["email_md5"] = email_md5
        data["access_key"] = self.access_key
        data['has_office_order_number'] = self.has_office_order_number
        data['office_order_number'] = self.office_order_number or 'NONE'
        data['user_groups'] = self.user_groups

        data["last_login"] = ""
        if self.last_login:
            last_login = self.last_login
            last_login += datetime.timedelta(hours=8)
            data["last_login"] = last_login.strftime("%m/%d/%Y %I:%M:%S %p")

        if token:
            data["token"] = token

        data["password_update"] = ""
        if self.password_update:
            update = self.password_update
            update += datetime.timedelta(hours=8)
            if not token:
                update = update.strftime("%m/%d/%Y %I:%M:%S %p")
                data["password_update"] = update

        created = self.created_time
        created += datetime.timedelta(hours=8)
        if token:
            data["created"] = time.mktime(created.timetuple())
        else:
            data["created_time"] = created.strftime("%m/%d/%Y %I:%M:%S %p")

        return data

    def to_api_object(self, user_role=None, level=1):
        """
            Converts the entity to JSON.
        """
        data = {}
        data["id"] = str(self.key.id())
        data["first_name"] = self.first_name
        data["middle_name"] = self.middle_name
        data["last_name"] = self.last_name
        data["name"] = " ".join([self.first_name, self.last_name])
        data["mobile_number"] = self.mobile_number
        email_md5 = self.current_email.lower().strip()
        email_md5 = hashlib.md5(email_md5).hexdigest()
        data["email_md5"] = email_md5
        data["address"] = {}
        data["address"]["street_address"] = self.street_address
        data["address"]["province"] = self.province
        data["address"]["city/municipality"] = self.city
        data['office_order_number'] = self.office_order_number or 'NONE'
        data["email"] = self.current_email
        data["salutation"] = self.salutation
        data["designation"] = self.designation
        data["department"] = self.department
        data["agency"] = self.agency
        data["region"] = self.region
        data["operating_unit"] = self.operating_unit
        data["org_id"] = self.org_id
        data["org_name"] = self.org_name
        data["uacs"] = self.uacs
        if user_role:
            if user_role in ["SYSADMIN", "GEOSTOREADMIN"]:
                data["permissions"] = self.permissions
                data["access_key"] = self.access_key
                data["role"] = self.role
                data["status"] = self.status
                data["level"] = self.level

        return data

    def to_approval_object(self):
        """
            Converts the entity to JSON.
        """
        data = {}
        data["id"] = str(self.key.id())
        data["name"] = " ".join([self.first_name, self.last_name])
        data["mobile_number"] = self.mobile_number or "NA"
        data["email"] = self.current_email
        data["street_address"] = self.street_address
        data["province"] = self.province
        data["city"] = self.city
        email_md5 = self.current_email.lower().strip()
        email_md5 = hashlib.md5(email_md5).hexdigest()
        data["email_md5"] = email_md5
        data["department"] = self.department
        data["agency"] = self.agency
        data["region"] = self.region
        data["operating_unit"] = self.operating_unit
        data["uacs"] = self.uacs
        data["org_name"] = self.org_name
        data['has_office_order_number'] = self.has_office_order_number
        data['office_order_number'] = self.office_order_number or 'NONE'
        data["org_id"] = self.org_id
        data["approved_on"] = ""
        data["approved_by"] = ""
        data["disapproved_on"] = ""
        data["disapproved_by"] = ""

        if self.status == "APPROVED":
            if self.approved_on:
                approved_on = self.approved_on
                approved_on += datetime.timedelta(hours=8)
                approved_on = approved_on.strftime("%b %d, %Y %I:%M:%S %p")
                data["approved_on"] = approved_on
                data["approved_by"] = self.approved_by_name
        elif self.status == "DISAPPROVED":
            if self.disapproved_on:
                disapp_on = self.disapproved_on
                disapp_on += datetime.timedelta(hours=8)
                disapp_on = disapp_on.strftime("%b %d, %Y %I:%M:%S %p")
                data["disapproved_on"] = disapp_on
                data["disapproved_by"] = self.disapproved_by_name

        created = self.created_time
        created += datetime.timedelta(hours=8)
        data["registered"] = created.strftime("%b %d, %Y %I:%M:%S %p")

        return data


    @classmethod
    @ndb.transactional(xg=True)
    def create_new_user(
            cls, first_name, last_name, password, email, role="USER",
            department="", agency="", region="", operating_unit="",
            uacs="", middle_name="", mobile="", designation="",
            salutation="", province="", city="", street_address="",
            org_id="", org_name="", office_order_number="NONE", access_key=None, send=True, redirect=None):
        """
            Creates a new user.
        """
        user = cls()
        user.salutation = salutation
        user.first_name = first_name
        user.last_name = last_name
        user.middle_name = middle_name or ""
        user.name = " ".join([first_name, middle_name or "", last_name])
        user.mobile_number = mobile
        user.original_email = email.lower()
        user.current_email = email.lower()
        user.email_list = [email.lower()]
        user.street_address = street_address
        user.province = province
        if office_order_number:
            user.has_office_order_number = True
            user.office_order_number = office_order_number.strip()
        user.city = city
        user.hashed_password = user.hash_password(password)
        user.previous_passwords = [user.hash_password(password)]
        # user.department = department
        # user.position = position
        user.confirmation_token = generate_token()
        user.access_key = ["PUBLIC"]
        if access_key:
            user.access_key += access_key.upper()

        if uacs:
            user.permissions = ["->".join(["UACS_ID", uacs])]

        if role:
            user.role = role.upper()

        if designation:
            user.designation = designation.upper()

        user.org_id = org_id
        user.org_name = org_name
        user.department = department
        user.agency = agency
        user.region = region
        user.operating_unit = operating_unit
        user.uacs = uacs
        user.put()

        if send:
            content = {
                "token": user.confirmation_token,
                "uid": str(user.key.id()),
                "receiver_name": user.first_name,
                "receiver_email": user.current_email,
                "subject": "Email Verfication",
                "email_type": "verify"
            }

            if redirect:
                content["redirect"] = redirect

            taskqueue.add(
                url="/tasks/email/send",
                params=content,
                method="POST")

        return user

    @classmethod
    @ndb.transactional(xg=True)
    def invite_new_opendata_admin(
            cls, email):
        """
            Creates a new ODTF member.
            Sends invitation to join CKAN Manager via Email.
        """
        user = cls()
        user.original_email = email
        user.current_email = email
        user.email_list = [email]
        user.confirmation_token = generate_token()
        user.role = "OPENDATAADMIN"
        user.status = "INVITE"
        user.put()

        content = {
            "token": user.confirmation_token,
            "uid": str(user.key.id()),
            "receiver_name": "OPEN DATA ADMIN",
            "receiver_email": user.current_email,
            "subject": "Open Data Admin Invitation",
            "email_type": "invite_opendata_admin"
        }

        taskqueue.add(
            url="/tasks/email/send",
            params=content,
            method="POST")

        return user

    @classmethod
    @ndb.transactional(xg=True)
    def complete_opendata_admin_registration(
            cls, user, first_name, last_name,
            password, mobile=""):
        """
            Saves the Agency Admin account details.
        """
        user = user.get()
        user.first_name = first_name
        user.last_name = last_name
        user.name = " ".join([first_name, last_name])
        user.mobile_number = mobile
        user.hashed_password = user.hash_password(password)
        user.previous_passwords = [user.hash_password(password)]
        user.role = "OPENDATAADMIN"
        user.status = "APPROVED"
        user.put()

        # if send:
        #     content = {
        #         "token": user.confirmation_token,
        #         "uid": str(user.key.id())
        #     }

        #     send_email(
        #         receiver_name="OPEN DATA ADMIN",
        #         receiver_email=user.current_email,
        #         subject="Open Data Admin Invitation",
        #         content=content,
        #         email_type="invite_opendata_admin")

        return user

    @classmethod
    def check_user(cls, email):
        """
            Checks if user is already registered.
        """
        query = cls.query()
        query = query.filter(cls.original_email == email)
        user = query.get()

        if user:
            return user

        return False