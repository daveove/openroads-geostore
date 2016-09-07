import os
import json
import uuid
import hmac
import base64
import urllib
import string
import base64
import hashlib
import logging
import random
import datetime
from cookie import *
from settings import BUCKET_NAME
from google.appengine.ext import blobstore
from google.appengine.api import images
from math import radians, cos, sin, asin, sqrt
from bs4 import BeautifulSoup
import cloudstorage as gcs
from zipfile import ZipFile
from application.models.apidata import APIData
try:
    from cStringIO import StringIO
except:
    from StringIO import StringIO


def hp(email, password):
    """
        Returns a hashed password.
    """
    i = email + password + base64.b64decode("IGxldHMgbWFrZSBtb25leSA=")
    return base64.b64encode(hashlib.sha1(i).digest())


def generate_token():
    """
        Generates a random token.
    """
    token = ""
    for x in range(128):
        random_str = string.ascii_uppercase + string.digits
        random_str += string.lowercase
        token += random.choice(random_str)

    return token


def random_string(n):
    """
        Generates a random string.
    """
    random_str = ""
    for x in range(n):
        rand = string.ascii_letters + string.digits
        random_str += random.choice(rand)

    return random_str


def get_login_url(url, error=None):
    """
        Creates the login url with redirect.
    """
    login_url = "/login"
    if url:
        login_url = login_url + "?redirect=" + urllib.quote(url.strip())

    if error:
        if url:
            login_url = login_url + "&error=" + urllib.quote(error)
        else:
            login_url = login_url + "?error=" + urllib.quote(error)

    return login_url


def error_message(self, message):
    """
        Creates an error message.
    """
    error = base64.b64encode(message)
    set_cookie(self, name="_erm_", value=error)


def success_message(self, message):
    """
        Creates a success message.
    """
    success = base64.b64encode(message)
    set_cookie(self, name="_scm_", value=success)


def wrap_response(res, response):
    if "code" in response:
        try:
            response_code = int(response['code'])
            if response_code >= 400 and response_code <= 499:
                if response_code == 404:
                    res.response.set_status(404, response["response"])
                else:
                    res.response.set_status(400, response["response"])

            elif response_code >= 500 and response_code <= 599:
                res.response.set_status(500, response["response"])
            else:
                if 'response' in response:
                    res.response.set_status(response_code,
                                            response["response"])
                else:
                    logging.debug(response)
        except:
            logging.exception("Cannot set Status Code Header")

    res.response.headers['Content-Type'] = "application/json"
    response_text = json.dumps(response, False, False)
    res.response.out.write(response_text)
    logging.debug("RESPONSE:")
    logging.debug(response_text)
    return


def create_indexed_tag(key, value):
    """
        Creates a tag for the api.
    """
    key = key.upper()
    key = key.replace("INDEXED_", "")
    key = key.replace("UNINDEXED_", "")
    return "->".join([key, value]).upper()


def split_indexed_tag(tag):
    """
        Splits the created tag for the api.
    """
    tag = tag.lower()
    tag = tag.split("->")
    return tag


def uniquify(seq, idfun=None):
    """
        Removes duplicate items in the list.
    """
    # order preserving
    if idfun is None:
        def idfun(x): return x
    seen = {}
    result = []

    for item in seq:
        try:
            marker = idfun(item)
            # in old Python versions:
            # if seen.has_key(marker)
            # but in new ones:
            if marker in seen:
                continue
            seen[marker] = 1
            result.append(str(item))
        except Exception as e:
            logging.info(e)
            logging.info(item)

    return result


def to_date_format_only(date, format):
    """
        Converts date to a desired format.
    """
    date = datetime.datetime.strptime(date, "%b %d, %Y %I:%M:%S %p")
    return date.strftime(format)


def create_tags(title):
    """
        Creates a tags used for search.
    """
    tags = []
    try:
        title = title.strip().upper()
        title_list = title.split()

        title_length = len(title_list) + 1

        words_max_length = 3
        if title_length < words_max_length:
            words_max_length = title_length

        for x in range(0, title_length):
            for i in range(0, words_max_length):
                tags.append(" ".join(title_list[x:i]))
    except Exception as e:
        logging.info(e)
        if type(title) is not dict and type(title) is not list:
            tags.append(title)

    return uniquify(tags)


def hexto62(x):
    x = int(x, 16)
    base = 62
    digs = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    if x < 0:
        sign = -1
    elif x == 0:
        return '0'
    else:
        sign = 1
    x *= sign
    digits = []
    while x:
        digits.append(digs[x % base])
        x /= base
    if sign < 0:
        digits.append('-')
    digits.reverse()
    return ''.join(digits)


def generate_uuid():
    uu_id = str(uuid.uuid4()).replace("-", "")
    uu_id += str(uuid.uuid4()).replace("-", "")
    return hexto62(uu_id)


def generate_signature(secret_key, data):
    try:
        signature = hmac.new(secret_key, msg=data,
                             digestmod=hashlib.sha256).digest()
        signature = base64.b64encode(signature).decode()
        return signature
    except Exception as e:
        logging.exception(e)
        raise CannotGenerateSignature()


def format_add_comma(value):
    return "{:,d}".format(value)


def format_add_comma_float(value):
    return "{0:,.2f}".format(value)


def format_percentage(value):
    if(value == 0):
        return "0%"
    value = value * 100
    return "{0:,.1f}%".format(value)


def normalize_id(given_id):
    try:
        new_id = int(given_id)

        '''
        Hack! Some ID's are integers, but were created, so they
        end up as strings. They are usually smaller than 1,000,000,000,000.
        '''
        if new_id < 1000000000000:
            return str(given_id)
    except ValueError:
        new_id = given_id
    return new_id


def get_distance_in_km(latlon1, latlon2):
    """
        Converts latlong to a distance in KM.
    """
    latlon1 = latlon1.strip().split(',')
    latlon2 = latlon2.strip().split(',')

    try:
        lon1 = float(latlon1[1].strip())
        lat1 = float(latlon1[0].strip())
        lon2 = float(latlon2[1].strip())
        lat2 = float(latlon2[0].strip())
    except:
        logging.exception('error in getting latlon')
        return -1

    return haversine(lon1, lat1, lon2, lat2)


def get_distance_in_meters(latlon1, latlon2):
    """
        Converts latlong to a distance in METERS.
    """
    return get_distance_in_km(latlon1, latlon2) * 1000


def haversine(lon1, lat1, lon2, lat2):
    """
        Calculate the great circle distance between two points
        on the earth (specified in decimal degrees)
    """
    # convert decimal degrees to radians
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
    # haversine formula
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    km = 6367 * c
    return km


def get_kml_file_contents(url):
    """
        Extracts the contents of the KML file.
    """
    filename = url.replace('http://storage.googleapis.com', '').replace(
                            'https://storage.googleapis.com', '')
    with gcs.open(filename, 'r') as gcs_file:
        if filename.endswith('.kmz'):
            with ZipFile(gcs_file, 'r') as zip_file:
                return zip_file.read('doc.kml')
        return gcs_file.read()


def get_kml_points(xml_data):
    """
        Extracts the points of the KML file.
    """
    xml_data = xml_data.replace('<gx:', '<gx_').replace('</gx:', '</gx_')
    paths = []

    # logging.debug("XML DATA")
    # logging.debug(xml_data)

    soup = BeautifulSoup(xml_data, 'xml')
    for pm in soup.find_all('LineString'):
        path = []
        if pm.find('coordinates'):
            try:
                name = pm.parent.find('name').string
            except:
                name = 'No Placemark name found'
            logging.debug(name)
            for point in pm.find('coordinates').string.strip().split(' '):
                coords = point.split(',')
                lat = coords[1].strip()
                lng = coords[0].strip()

                path.append(lat + ',' + lng)
        paths.append(path)

    for pm in soup.find_all('gx_MultiTrack'):
        path = []
        if pm.find('gx_coord'):
            for point in pm.find_all('gx_coord'):
                coords = point.string.strip().split(' ')
                lat = coords[1].strip()
                lng = coords[0].strip()

                path.append(lat + ',' + lng)
        paths.append(path)

    # logging.debug(paths)

    return paths


def merge_kml_and_attributes(classifications, kml_url):
    tracks = get_kml_points(get_kml_file_contents(kml_url))
    new_tracks = []

    for track in tracks:
        mid = track[len(track) / 2]
        points_and_attributes = []
        for point in track:
            closest_distance_s = 10000000000
            closest_distance_q = 10000000000
            current_quality_classification = None
            current_surface_classification = None
            for i in range(0, len(classifications)):
                classification = classifications[i]
                distance = get_distance_in_meters(point,
                                                  classification['latlng'])
                if distance < 0:
                    distance = distance * -1

                classification_value = classification['classification']
                classification_value = classification_value.lower().strip()

                if classification['classification_type'] == 'SURFACE':
                    if distance < closest_distance_s:
                        if classification_value != 'na':
                            current_surface_classification = classification
                        closest_distance_s = distance
                elif classification['classification_type'] == 'QUALITY':
                    if distance < closest_distance_q:
                        if classification_value != 'na':
                            current_quality_classification = classification
                        closest_distance_q = distance

            if closest_distance_s > 75:
                # disregard
                current_surface_classification = None

            if closest_distance_q > 75:
                # disregard
                current_quality_classification = None

            try:
                latlon1 = point.strip().split(',')
                lng = float(latlon1[1].strip())
                lat = float(latlon1[0].strip())

                if current_surface_classification:
                    surface = current_surface_classification['classification']
                    surface = surface.lower().strip()
                else:
                    surface = 'na'

                if current_quality_classification:
                    quality = current_quality_classification['classification']
                    quality = quality.lower().strip()
                else:
                    quality = 'na'

                points_and_attributes.append({
                    'lat': lat,
                    'lng': lng,
                    'surface': surface,
                    'quality': quality
                    })
            except:
                logging.exception('error in getting latlon')
        new_tracks.append(points_and_attributes)
    # logging.debug(new_tracks)
    return generate_kml(new_tracks)

def merge_kml_and_attributes_json(classifications, kml_url):
    tracks = get_kml_points(get_kml_file_contents(kml_url))
    new_tracks = []

    for track in tracks:
        mid = track[len(track) / 2]
        points_and_attributes = []
        for point in track:
            closest_distance_s = 10000000000
            closest_distance_q = 10000000000
            current_quality_classification = None
            current_surface_classification = None
            for i in range(0, len(classifications)):
                classification = classifications[i]
                distance = get_distance_in_meters(point,
                                                  classification['latlng'])
                if distance < 0:
                    distance = distance * -1

                classification_value = classification['classification']
                classification_value = classification_value.lower().strip()

                if classification['classification_type'] == 'SURFACE':
                    if distance < closest_distance_s:
                        if classification_value != 'na':
                            current_surface_classification = classification
                        closest_distance_s = distance
                elif classification['classification_type'] == 'QUALITY':
                    if distance < closest_distance_q:
                        if classification_value != 'na':
                            current_quality_classification = classification
                        closest_distance_q = distance

            if closest_distance_s > 75:
                # disregard
                current_surface_classification = None

            if closest_distance_q > 75:
                # disregard
                current_quality_classification = None

            try:
                latlon1 = point.strip().split(',')
                lng = float(latlon1[1].strip())
                lat = float(latlon1[0].strip())

                if current_surface_classification:
                    surface = current_surface_classification['classification']
                    surface = surface.lower().strip()
                else:
                    surface = 'na'

                if current_quality_classification:
                    quality = current_quality_classification['classification']
                    quality = quality.lower().strip()
                else:
                    quality = 'na'

                points_and_attributes.append({
                    'lat': lat,
                    'lng': lng,
                    'surface': surface,
                    'quality': quality
                    })
            except:
                logging.exception('error in getting latlon')
        new_tracks.append(points_and_attributes)
    # logging.debug(new_tracks)
    return new_tracks


def generate_kml(tracks):
    kml_text = """<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/\
kml/ext/2.2" xmlns:kml="http://www.opengis.net/kml/2.2" xmlns:atom="http://\
www.w3.org/2005/Atom">
<Document>
  <name>Geoprocessed Road</name>
  <Style id="concretegood">
    <LineStyle>
      <gx:outerColor>ffcbcbc7</gx:outerColor>
      <gx:physicalWidth>7</gx:physicalWidth>
      <color>ff25df59</color>
      <gx:outerWidth>0.7</gx:outerWidth>
    </LineStyle>
  </Style>
  <Style id="asphaltgood">
    <LineStyle>
      <gx:outerColor>ff474743</gx:outerColor>
      <gx:physicalWidth>7</gx:physicalWidth>
      <color>ff25df59</color>
      <gx:outerWidth>0.7</gx:outerWidth>
    </LineStyle>
  </Style>
  <Style id="gravelgood">
    <LineStyle>
      <gx:outerColor>ff3f678c</gx:outerColor>
      <gx:physicalWidth>7</gx:physicalWidth>
      <color>ff25df59</color>
      <gx:outerWidth>0.7</gx:outerWidth>
    </LineStyle>
  </Style>
  <Style id="earthgood">
    <LineStyle>
      <gx:outerColor>ff08447b</gx:outerColor>
      <gx:physicalWidth>7</gx:physicalWidth>
      <color>ff25df59</color>
      <gx:outerWidth>0.7</gx:outerWidth>
    </LineStyle>
  </Style>

  <Style id="concretefair">
    <LineStyle>
      <gx:outerColor>ffcbcbc7</gx:outerColor>
      <gx:physicalWidth>7</gx:physicalWidth>
      <color>ff23dec6</color>
      <gx:outerWidth>0.7</gx:outerWidth>
    </LineStyle>
  </Style>
  <Style id="asphaltfair">
    <LineStyle>
      <gx:outerColor>ff474743</gx:outerColor>
      <gx:physicalWidth>7</gx:physicalWidth>
      <color>ff23dec6</color>
      <gx:outerWidth>0.7</gx:outerWidth>
    </LineStyle>
  </Style>
  <Style id="gravelfair">
    <LineStyle>
      <gx:outerColor>ff3f678c</gx:outerColor>
      <gx:physicalWidth>7</gx:physicalWidth>
      <color>ff23dec6</color>
      <gx:outerWidth>0.7</gx:outerWidth>
    </LineStyle>
  </Style>
  <Style id="earthfair">
    <LineStyle>
      <gx:outerColor>ff08447b</gx:outerColor>
      <gx:physicalWidth>7</gx:physicalWidth>
      <color>ff23dec6</color>
      <gx:outerWidth>0.7</gx:outerWidth>
    </LineStyle>
  </Style>

  <Style id="concretepoor">
    <LineStyle>
      <gx:outerColor>ffcbcbc7</gx:outerColor>
      <gx:physicalWidth>7</gx:physicalWidth>
      <color>ff0992e0</color>
      <gx:outerWidth>0.7</gx:outerWidth>
    </LineStyle>
  </Style>
  <Style id="asphaltpoor">
    <LineStyle>
      <gx:outerColor>ff474743</gx:outerColor>
      <gx:physicalWidth>7</gx:physicalWidth>
      <color>ff0992e0</color>
      <gx:outerWidth>0.7</gx:outerWidth>
    </LineStyle>
  </Style>
  <Style id="gravelpoor">
    <LineStyle>
      <gx:outerColor>ff3f678c</gx:outerColor>
      <gx:physicalWidth>7</gx:physicalWidth>
      <color>ff0992e0</color>
      <gx:outerWidth>0.7</gx:outerWidth>
    </LineStyle>
  </Style>
  <Style id="earthpoor">
    <LineStyle>
      <gx:outerColor>ff08447b</gx:outerColor>
      <gx:physicalWidth>7</gx:physicalWidth>
      <color>ff0992e0</color>
      <gx:outerWidth>0.7</gx:outerWidth>
    </LineStyle>
  </Style>

  <Style id="concretebad">
    <LineStyle>
      <gx:outerColor>ffcbcbc7</gx:outerColor>
      <gx:physicalWidth>7</gx:physicalWidth>
      <color>ff1218ee</color>
      <gx:outerWidth>0.7</gx:outerWidth>
    </LineStyle>
  </Style>
  <Style id="asphaltbad">
    <LineStyle>
      <gx:outerColor>ff474743</gx:outerColor>
      <gx:physicalWidth>7</gx:physicalWidth>
      <color>ff1218ee</color>
      <gx:outerWidth>0.7</gx:outerWidth>
    </LineStyle>
  </Style>
  <Style id="gravelbad">
    <LineStyle>
      <gx:outerColor>ff3f678c</gx:outerColor>
      <gx:physicalWidth>7</gx:physicalWidth>
      <color>ff1218ee</color>
      <gx:outerWidth>0.7</gx:outerWidth>
    </LineStyle>
  </Style>
  <Style id="earthbad">
    <LineStyle>
      <gx:outerColor>ff08447b</gx:outerColor>
      <gx:physicalWidth>7</gx:physicalWidth>
      <color>ff1218ee</color>
      <gx:outerWidth>0.7</gx:outerWidth>
    </LineStyle>
  </Style>

  <Style id="concretena">
    <LineStyle>
      <gx:outerColor>ffcbcbc7</gx:outerColor>
      <gx:physicalWidth>7</gx:physicalWidth>
      <color>ff515151</color>
      <gx:outerWidth>0.7</gx:outerWidth>
    </LineStyle>
  </Style>
  <Style id="asphaltna">
    <LineStyle>
      <gx:outerColor>ff474743</gx:outerColor>
      <gx:physicalWidth>7</gx:physicalWidth>
      <color>ff515151</color>
      <gx:outerWidth>0.7</gx:outerWidth>
    </LineStyle>
  </Style>
  <Style id="gravelna">
    <LineStyle>
      <gx:outerColor>ff3f678c</gx:outerColor>
      <gx:physicalWidth>7</gx:physicalWidth>
      <color>ff515151</color>
      <gx:outerWidth>0.7</gx:outerWidth>
    </LineStyle>
  </Style>
  <Style id="earthna">
    <LineStyle>
      <gx:outerColor>ff08447b</gx:outerColor>
      <gx:physicalWidth>7</gx:physicalWidth>
      <color>ff515151</color>
      <gx:outerWidth>0.7</gx:outerWidth>
    </LineStyle>
  </Style>

  <Style id="nagood">
    <LineStyle>
      <gx:outerColor>ff515151</gx:outerColor>
      <gx:physicalWidth>7</gx:physicalWidth>
      <color>ff25df59</color>
      <gx:outerWidth>0.7</gx:outerWidth>
    </LineStyle>
  </Style>
  <Style id="nafair">
    <LineStyle>
      <gx:outerColor>ff515151</gx:outerColor>
      <gx:physicalWidth>7</gx:physicalWidth>
      <color>ff23dec6</color>
      <gx:outerWidth>0.7</gx:outerWidth>
    </LineStyle>
  </Style>
  <Style id="napoor">
    <LineStyle>
      <gx:outerColor>ff515151</gx:outerColor>
      <gx:physicalWidth>7</gx:physicalWidth>
      <color>ff0992e0</color>
      <gx:outerWidth>0.7</gx:outerWidth>
    </LineStyle>
  </Style>
  <Style id="nabad">
    <LineStyle>
      <gx:outerColor>ff515151</gx:outerColor>
      <gx:physicalWidth>7</gx:physicalWidth>
      <color>ff1218ee</color>
      <gx:outerWidth>0.7</gx:outerWidth>
    </LineStyle>
  </Style>

  <Style id="nana">
    <LineStyle>
      <gx:outerColor>ff515151</gx:outerColor>
      <gx:physicalWidth>7</gx:physicalWidth>
      <color>ff515151</color>
      <gx:outerWidth>0.7</gx:outerWidth>
    </LineStyle>
  </Style>
    """
    for points_and_attributes in tracks:
        current_quality = ""
        current_surface = ""
        coordinates = ''
        for point in points_and_attributes:

            coordinates += ' ' + str(point['lng']) + ',' + str(point['lat'])
            coordinates += ',1'
            if not point['quality'] == current_quality \
                    and point['surface'] == current_surface:
                if coordinates:
                    kml_text += add_placemark(current_surface, current_quality,
                                              coordinates)
                    logging.debug('changed')
                coordinates = ' ' + str(point['lng']) + ',' + str(point['lat'])
                coordinates += ',0'

            current_quality = point['quality']
            current_surface = point['surface']
            kml_text += add_placemark(current_surface, current_quality, coordinates)

    kml_text += """
    </Document>
</kml>
    """

    return kml_text


def add_placemark(surface, quality, coordinates):
    placemark = """
        <Placemark>
        <styleUrl>#{{surface}}{{quality}}</styleUrl>
        <LineString>
          <coordinates>
            {{coordinates}}
          </coordinates>
        </LineString>
      </Placemark>
            """.replace('{{surface}}', surface).replace('{{quality}}', quality)
    placemark = placemark.replace('{{coordinates}}', coordinates)
    return placemark


def code_to_project_id(code):
    response = APIData.query(APIData.indexed_data == 'TYPE->PROJECT',
                             APIData.indexed_data == 'CODE->' +
                             code.upper().strip()).get(keys_only=True)
    if response:
        return response.id()
    else:
        return None


def generate_parameter_tags(params, data):
    for arg in data:
        new_arg = 'unindexed_' + arg.replace('-', '_')
        if any(x in arg for x in ['code', 'tag']):
            new_arg = new_arg.replace('unindexed_', 'indexed_')
            if 'tag' in arg:
                new_arg += '_array'
        params[new_arg] = data[arg]
    return params


def write_to_api(items=None, user=None, content_type=None, imported=False,
                 user_request=None):
    logging.debug(items)
    logging.debug(user)
    logging.debug(content_type)
    logging.debug(imported)
    logging.debug(user_request)
    if imported:
        data = APIData(id=str(items['indexed_code']))
    else:
        data = APIData()

    if user == 'geostore@sym.ph':
        user = User.query(User.current_email == 'geostore@sym.ph').get()

    data.additional_data = {}
    if content_type == "application/json":
        tags = []
        logging.debug(items)
        try:
            for key, value in items.items():
                if key.startswith('unindexed_'):
                    ad_key = key.replace("unindexed_", "")
                    data.additional_data[ad_key] = value.strip()

                if key.startswith('indexed_'):
                    ad_key = key.replace('indexed_', '').replace('_array', '')
                    if key.endswith('_array'):
                        value_arr = json.loads(value)
                        for v_arr in value_arr:
                            data.indexed_data.append(create_indexed_tag(key,
                                                     v_arr))
                    else:
                        data.indexed_data.append(create_indexed_tag(key,
                                                 value))
                    data.additional_data[ad_key] = value
                    try:
                        tags += create_tags(value)
                    except Exception as e:
                        logging.exception("Cannot create tag from: ")
            if user:
                data.username = user.name
                data.user = user.key
                data.indexed_data.append(create_indexed_tag("USER_ID",
                                         str(user.key.id())))

            data.indexed_data = uniquify(data.indexed_data)
            data.tags = uniquify(tags)
            data.put()
            return data
        except Exception as e:
            logging.exception(e)
    else:
        tags = []
        try:
            for arg in items:
                if arg.startswith('unindexed_'):  # unindexed_
                    ad_key = arg.replace("unindexed_", "")
                    ad_value = items.get(arg)
                    data.additional_data[ad_key] = ad_value.strip()
                if arg.startswith('indexed_'):
                    ad_key = arg.replace("indexed_", "")
                    ad_value = items.get(arg)
                    data.additional_data[ad_key] = ad_value
                    try:
                        tags += create_tags(ad_value)
                    except Exception as e:
                        logging.exception("Cannot create tag from: ")
                    data.indexed_data.append(create_indexed_tag(arg,
                                             items.get(arg)))
                if arg.startswith('file_'):
                    logging.debug(arg)
                    filename = BUCKET_NAME
                    filename += random_string(128) + "/"
                    ad_key = arg.replace("file_", "")
                    data.additional_data[ad_key] = {}
                    try:
                        if not user_request:
                            if 'file_image' in items:
                                file_field = 'file_image'
                            if 'file_file' in items:
                                file_field = 'file_file'
                            if 'file_kml' in items:
                                file_field = 'file_kml'
                            file_name = items[file_field].filename
                            filename += file_name
                            gcs_options = {'x-goog-acl': 'public-read'}
                            gcs_file = gcs.open(filename, 'w',
                                                options=gcs_options)
                            gcs_file.write(items[file_field].file.read())
                            gcs_file.close()
                        else:
                            file_name = user_request.request.POST.get('file')
                            file_name = file_name.filename
                            filename += file_name
                            gcs_options = {'x-goog-acl': 'public-read'}
                            gcs_file = gcs.open(filename, 'w',
                                                options=gcs_options)
                            gcs_file.write(user_request.request.get('file'))
                            gcs_file.close()
                        full_url = "https://storage.googleapis.com" + filename
                        data.file_url = full_url
                        data.additional_data[ad_key]["file_url"] = full_url
                        try:
                            blob_key = blobstore.create_gs_key("/gs" + filename)
                            data.serving_url = images.get_serving_url(blob_key)
                            data.additional_data[ad_key]["serving_url"] = data.serving_url
                            data.gcs_key = blobstore.BlobKey(blob_key)
                        except Exception as e:
                            logging.exception(e)
                            logging.error("FILE IS NOT AN IMAGE")
                            data.additional_data[ad_key]["serving_url"] = full_url
                    except AttributeError, e:
                        logging.exception(e)
                        logging.exception("NO FILE ATTACHED")
            if user:
                data.username = user.name
                data.user = user.key
                data.indexed_data.append(create_indexed_tag("USER_ID",
                                         str(user.key.id())))
            data.tags = uniquify(tags)
            data.put()
            return data
        except Exception as e:
            logging.exception('ERROR')
            logging.debug(e)


def write_to_api_params(items=None, user=None, content_type=None,
                        imported=False, user_request=None):
    data = APIData()
    data.additional_data = {}
    if user:
        tags = []
        try:
            for arg in items:
                if arg.startswith('unindexed_'):
                    ad_key = arg.replace("unindexed_", "")
                    ad_value = user_request.request.get(arg)
                    data.additional_data[ad_key] = ad_value.strip()
                if arg.startswith('indexed_'):
                    ad_key = arg.replace("indexed_", "")
                    ad_value = user_request.request.get(arg)
                    data.additional_data[ad_key] = ad_value
                    try:
                        tags += create_tags(ad_value)
                    except Exception as e:
                        logging.exception("Cannot create tag from: ")
                    data.indexed_data.append(create_indexed_tag(arg,
                                             user_request.request.get(arg)))

                if arg.startswith('file_'):
                    logging.debug(arg)
                    filename = BUCKET_NAME
                    filename += random_string(128) + "/"
                    ad_key = arg.replace("file_", "")
                    data.additional_data[ad_key] = {}
                    try:
                        if not user_request:
                            file_name = items[arg].filename
                            filename += file_name
                            gcs_options = {'x-goog-acl': 'public-read'}
                            gcs_file = gcs.open(filename, 'w',
                                                options=gcs_options)
                            gcs_file.write(items[arg].file.read())
                            gcs_file.close()
                        else:
                            file_name = user_request.request.POST.get(arg)
                            file_name = file_name.filename
                            filename += file_name
                            gcs_options = {'x-goog-acl': 'public-read'}
                            gcs_file = gcs.open(filename, 'w',
                                                options=gcs_options)
                            gcs_file.write(user_request.request.get(arg))
                            gcs_file.close()
                        full_url = "https://storage.googleapis.com" + filename
                        data.file_url = full_url
                        data.additional_data[ad_key]["file_url"] = full_url
                        try:
                            blob_key = blobstore.create_gs_key("/gs" + filename)
                            data.serving_url = images.get_serving_url(blob_key)
                            data.additional_data[ad_key]["serving_url"] = data.serving_url
                            data.gcs_key = blobstore.BlobKey(blob_key)
                        except Exception as e:
                            logging.exception(e)
                            logging.error("FILE IS NOT AN IMAGE")
                            data.additional_data[ad_key]["serving_url"] = full_url
                    except AttributeError, e:
                        logging.exception(e)
                        logging.exception("NO FILE ATTACHED")
            if user:
                data.username = user.name
                data.user = user.key
                data.indexed_data.append(create_indexed_tag("USER_ID",
                                         str(user.key.id())))
            data.tags = uniquify(tags)
            data.put()
            return data
        except Exception as e:
            logging.exception('ERROR')
            logging.debug(e)


def update_api_data(data_id=None, items=None, user=None, content_type=None):
    data = APIData.get_by_id(normalize_id(data_id))
    if not data:
        return
    if content_type == "application/json":
        tags = []
        try:
            for key, value in items.items():
                if key.startswith('unindexed_'):  # unindexed_
                    ad_key = key.replace("unindexed_", "")
                    data.additional_data[ad_key] = value.strip()

                if key.startswith('indexed_'):
                    ad_key = key.replace("indexed_", "")
                    data.additional_data[ad_key] = value

                    for d in data.indexed_data:
                        ad_key = key.replace("indexed_", "")
                        if d.startswith(ad_key.upper()):
                            try:
                                data.indexed_data.remove(d)
                            except Exception as e:
                                logging.exception(e)
                                logging.info("Cannot remove from list")

                    data.indexed_data.append(
                        create_indexed_tag(
                            key, value))
                    try:
                        tags += create_tags(value)
                    except Exception as e:
                        logging.exception("Cannot create tag from: ")
            if user:
                data.username = user.name
                data.user = user.key
            logging.info(tags)
            data.indexed_data = uniquify(data.indexed_data)
            data.tags = uniquify(tags)
            data.put()
        except Exception as e:
            logging.exception(e)
    else:
        tags = []
        try:
            for arg in self.request.arguments():
                for d in data.indexed_data:
                    ad_key = arg.replace("indexed_", "")
                    if d.startswith(ad_key.upper()):
                        try:
                            data.indexed_data.remove(d)
                        except Exception as e:
                            logging.exception(e)
                    if arg.startswith('unindexed_'):  # unindexed_
                        ad_key = arg.replace("unindexed_", "")
                        ad_value = self.request.POST.get(arg)
                        data.additional_data[ad_key] = ad_value.strip()

                    if arg.startswith('indexed_'):
                        ad_key = arg.replace("indexed_", "")
                        ad_value = self.request.POST.get(arg)
                        data.additional_data[ad_key] = ad_value
                        try:
                            tags += create_tags(ad_value)
                        except Exception as e:
                            logging.exception("Cannot create tag from: ")

                        data.indexed_data.append(
                            create_indexed_tag(
                                arg, self.request.POST.get(arg)))
                    if arg.startswith('file_'):
                        filename = BUCKET_NAME
                        filename += random_string(20) + "/"
                        ad_key = arg.replace("file_", "")
                        data.additional_data[ad_key] = {}
                        try:
                            file_name = items.get(arg).filename
                            filename += file_name
                            gcs_options = {'x-goog-acl': 'public-read'}
                            gcs_file = gcs.open(filename, 'w',
                                                options=gcs_options)
                            gcs_file.write(self.request.get(arg))
                            gcs_file.close()
                            full_url = "https://storage.googleapis.com" \
                                + filename
                            data.file_url = full_url
                            data.additional_data[ad_key]["file_url"] = full_url
                            try:
                                blob_key = blobstore.create_gs_key("/gs" + filename)
                                data.serving_url = images.get_serving_url(blob_key)
                                data.additional_data[ad_key]["serving_url"] = data.serving_url
                                data.gcs_key = blobstore.BlobKey(blob_key)
                            except Exception as e:
                                logging.exception(e)
                                data.additional_data[ad_key]["serving_url"] = full_url
                        except AttributeError, e:
                            logging.exception(e)
                if self.user:
                    data.username = self.user.name
                    data.user = self.user.key
                data.indexed_data = uniquify(data.indexed_data)
                data.tags = uniquify(tags)
                data.put()
        except Exception as e:
                logging.exception(e)


def find_between_r(s, first, last):
    try:
        start = s.rindex(first) + len(first)
        end = s.rindex(last, start)
        return s[start:end]
    except ValueError:
        return ""


def compute_kml_length(kml_id):
    kml_id = normalize_id(kml_id)
    kml = APIData.get_by_id(kml_id)
    location = urllib.unquote(kml.file_url).replace("https://storage.googleapis.com", '')
    location = location.replace("http://storage.googleapis.com", '')
    response = {}
    try:
        with gcs.open(location) as f:
            if kml.file_url.endswith('.kmz'):
                    zf = ZipFile(StringIO(f.read()))
                    xml_data = zf.read('doc.kml')
            else:
                xml_data = f.read()
        response['points'] = get_kml_points(xml_data)
    except Exception as e:
        response['error'] = 'Error reading KML/KMZ.'
        logging.debug(e)
    response['length'] = []
    for points in response['points']:
        p = 0
        for i in range(1, len(points)):
            p += get_distance_in_km(points[i - 1], points[i])
        response['length'].append(p)
    return response


def get_project_kmls(project_id, dataset=None):
    query = APIData.query()
    query = query.filter(APIData.indexed_data == 'TYPE->KML')
    query = query.filter(APIData.indexed_data == 'PROJECT_CODE->' + project_id)
    if dataset:
      query = query.filter(APIData.indexed_data == 'PARENT_CODE->' + dataset)
    n = 100
    result, cursor, more = query.fetch_page(n)
    resp = {}
    for kml in result:
        resp[kml.file_url.split('/')[-1]] = compute_kml_length(kml.key.id())
    return resp
