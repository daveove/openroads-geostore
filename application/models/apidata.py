import time
import urllib
import logging
import datetime
# from functions import create_indexed_tag, normalize_id
from google.appengine.ext import ndb
from application.models.syslog import SysLog
from application.models.redflag import RedFlag


def create_indexed_tag(key, value):
    """
        Creates a tag for the api.
    """
    key = key.upper()
    key = key.replace("INDEXED_", "")
    key = key.replace("UNINDEXED_", "")
    return "->".join([key, value]).upper()


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


class APIData(SysLog):
    additional_data = ndb.JsonProperty()
    indexed_data = ndb.StringProperty(repeated=True)
    serving_url = ndb.StringProperty()
    gcs_key = ndb.BlobKeyProperty()
    file_url = ndb.StringProperty()
    user = ndb.KeyProperty()
    username = ndb.StringProperty()
    tags = ndb.StringProperty(repeated=True)
    archived = ndb.BooleanProperty(default=False)
    workspace = ndb.KeyProperty(repeated=True)
    environment = ndb.KeyProperty(repeated=True)
    # data_api_status = ndb.StringProperty(default="PENDING")
    created_time = ndb.DateTimeProperty(auto_now_add=True)
    updated_time = ndb.DateTimeProperty(auto_now=True)
    permission = ndb.StringProperty(default="PUBLIC")
    reput = ndb.BooleanProperty(default=False)

    def to_object(self):
        """
            Converts the entity to JSON.
        """
        data = {}
        data["id"] = str(self.key.id())
        # data["type"] = self.data_type
        data["username"] = self.username or ""
        data["additional_data"] = self.additional_data
        data["indexed_data"] = self.indexed_data
        data["serving_url"] = self.serving_url
        # data["user"] = {}
        # if self.user:
        #     user = self.user.get()
        #     if user:
        #         data["user"] = user.to_object()

        return data

    def to_api_object(self, return_user=True):
        """
            Converts the entity to JSON.
        """
        data = {}
        data["id"] = str(self.key.id())

        # added this to force display of file_url
        try:
            if self.file_url:
                # data['original_file_url'] = self.file_url
                data['original_file_url'] = urllib.quote(self.file_url, safe="%/:=&?~#+!$,;'@()*[]")
        except:
            logging.exception("NO self.file_url")

        # data["type"] = self.data_type
        # data["username"] = self.username or ""

        # data["user"] = {}

        for key, value in self.additional_data.items():
            if key == "file":
                data[key] = {}
                for key2, value2 in value.items():
                    if key2 == "file_url":
                        if self.serving_url:
                            data[key][key2] = urllib.quote(self.serving_url, safe="%/:=&?~#+!$,;'@()*[]")
                        else:
                            data[key][key2] = urllib.quote(self.file_url, safe="%/:=&?~#+!$,;'@()*[]")
                    else:
                        data[key][key2] = urllib.quote(value2, safe="%/:=&?~#+!$,;'@()*[]")
            elif 'meta' in key:
                if 'meta' not in data:
                    data['meta'] = {}
                data['meta'][key.replace('meta_', '')] = value
            else:
                if 'file_url' in self.additional_data[key]:
                    if key not in data:
                        data[key] = {}
                    for x in self.additional_data[key]:
                        value = self.additional_data[key][x]
                        data[key][x] = urllib.quote(value, safe="%/:=&?~#+!$,;'@()*[]")
                else:
                    data[key] = value

        if self.user and return_user:
            user = self.user.get()
            if user:
                data["user"] = user.to_api_object()
        elif self.user:
            data["user_id"] = self.user.id()

        data["created"] = ""
        if self.created_time:
            created = self.created_time
            created += datetime.timedelta(hours=8)
            data["created"] = created.strftime("%b %d, %Y %I:%M:%S %p")
            data["created_timestamp"] = time.mktime(created.timetuple())
            data["created_timestamp_utc"] = time.mktime(self.created_time.timetuple())
        data["updated"] = ""
        if self.updated_time:
            updated = self.updated_time
            updated += datetime.timedelta(hours=8)
            data["updated"] = updated.strftime("%b %d, %Y %I:%M:%S %p")
            data["updated_timestamp"] = time.mktime(updated.timetuple())
            data["updated_timestamp_utc"] = time.mktime(self.updated_time.timetuple())


        data['permission'] = self.permission

        return data


    def to_flat_dict(self):
        """
            Converts the entity to a flat dictionary.
        """
        data = {}
        data["id"] = str(self.key.id())

        # added this to force display of file_url
        try:
            if self.file_url:
                # data['original_file_url'] = self.file_url
                data['original_file_url'] = urllib.quote(self.file_url, safe="%/:=&?~#+!$,;'@()*[]")
        except:
            logging.exception("NO self.file_url")

        # data["type"] = self.data_type
        # data["username"] = self.username or ""

        # data["user"] = {}

        for key, value in self.additional_data.items():
            if key in ["file", "file_url", "image"]:
                continue
            else:
                data[key] = value

        if self.user:
            data["user_id"] = self.user.id()
        else:
            data["user_id"] = ''

        data["created"] = ""
        if self.created_time:
            created = self.created_time
            created += datetime.timedelta(hours=8)
            data["created"] = created.strftime("%b %d, %Y %I:%M:%S %p")
            data["created_timestamp"] = time.mktime(created.timetuple())
            data["created_timestamp_utc"] = time.mktime(self.created_time.timetuple())
        data["updated"] = ""
        if self.updated_time:
            updated = self.updated_time
            updated += datetime.timedelta(hours=8)
            data["updated"] = updated.strftime("%b %d, %Y %I:%M:%S %p")
            data["updated_timestamp"] = time.mktime(updated.timetuple())
            data["updated_timestamp_utc"] = time.mktime(self.updated_time.timetuple())

        return data


    def _pre_put_hook(self):
        """
            Add default environment key if there is no environment.
            If it's otherwise, look for an `environment_key` field and use it.
            If it's a project, always make it public.
        """
        if 'environment_key' in self.additional_data:
            try:
                environment = ndb.Key(urlsafe=self.additional_data['environment_key']).get()
                if environment:
                    if self.environment:
                        logging.debug('do not touch already existing environment')
                    else:
                        self.environment = [environment.key]
            except:
                logging.exception('error in assigning environment')

        if 'type' in self.additional_data:
            if self.additional_data['type'].upper() in ['PROJECT', 'SUBPROJECT']:
                self.environment = [ndb.Key('Environment', 'PUBLIC')]

            if self.additional_data['type'].upper() == 'KML':
                if self.file_url.split('/')[-1].startswith('ACCESS-'):
                    logging.debug('KML UPLOADED IS ACCESS ROAD')
                    self.additional_data['road_type'] = 'ACCESS'
                    self.indexed_data.append(create_indexed_tag('road_type', 'ACCESS ROAD'))
                else:
                    logging.debug('KML UPLOADED IS PROJECT ROAD')
                    self.additional_data['road_type'] = 'PROJECT'
                    self.indexed_data.append(create_indexed_tag('road_type', 'PROJECT ROAD'))

        if not self.environment:
            # add check if part of dataset
            if 'type' in self.additional_data:
                if self.additional_data['type'].upper() not in ['PROJECT', 'SUBPROJECT', 'DATASET']:
                    if 'parent_code' in self.additional_data:
                        # not a project, subproject, or dataset. inherit from parent dataset
                        p_dataset = APIData.query(create_indexed_tag('parent_code', self.additional_data['parent_code'])).get()
                        if p_dataset:
                            # has dataset. copy environment
                            self.environment = p_dataset.environment

        if not self.environment:
            self.environment = [ndb.Key('Environment', 'PUBLIC')]
        logging.debug(self.environment)
        
        if not 'type' in self.additional_data:
            return

        # create indexed_data
        self.convert_additional_data_to_indexed_data('type')
        self.convert_additional_data_to_indexed_data('code')
        self.convert_additional_data_to_indexed_data('program')
        self.convert_additional_data_to_indexed_data('has_classification')
        self.convert_additional_data_to_indexed_data('has_kml')
        self.convert_additional_data_to_indexed_data('status')
        self.convert_additional_data_to_indexed_data('coa')
        self.convert_additional_data_to_indexed_data('has_image')
        self.convert_additional_data_to_indexed_data('classification')
        self.convert_additional_data_to_indexed_data('agency')
        self.convert_additional_data_to_indexed_data('project_type')
        self.convert_additional_data_to_indexed_data('province')
        self.convert_additional_data_to_indexed_data('municipality')

        self.convert_additional_data_to_indexed_data('parent_id')
        self.convert_additional_data_to_indexed_data('parent_code')

        self.convert_additional_data_to_indexed_data('dataset_id')
        self.convert_additional_data_to_indexed_data('dataset_code')

        self.convert_additional_data_to_indexed_data('project_code')
        self.convert_additional_data_to_indexed_data('project_id')

        self.convert_additional_data_to_indexed_data('subproject_code')
        self.convert_additional_data_to_indexed_data('subproject_id')

        self.convert_additional_data_to_indexed_data('is_road')
        self.convert_additional_data_to_indexed_data('surface_quality')
        self.convert_additional_data_to_indexed_data('surface_type')

        self.convert_additional_data_to_indexed_data('latlng')
        self.convert_additional_data_to_indexed_data('date')

        self.convert_additional_data_to_indexed_data('classification_type')

        self.convert_additional_data_to_indexed_data('image_id')

        self.reput = True

    
    def convert_additional_data_to_indexed_data(self, field):
        if not self.indexed_data:
            self.indexed_data = []

        if field in self.additional_data:
            self.indexed_data.append(create_indexed_tag(field, self.additional_data[field]))


    def _post_put_hook(self, future):
        # just call SysLog parent
        super(APIData, self)._post_put_hook(future)

        if 'type' in self.additional_data:
            if self.additional_data['type'].upper() == 'DATASET':
                # kick off checking scripts
                try:
                    project_id = self.additional_data['project_id']
                except KeyError:
                    project_id = None
                start_red_flags_checker(self.key.id(), project_id, self.additional_data['code'])

def start_red_flags_checker(dataset_id, project_id, dataset_code):
    # kml modified date is far from the date of the images
    logging.debug('dataset_id: ' + str(dataset_id))

    # images are more than 50 meters apart
    # there are points that have less than 4 photos
    check_for_more_than_50(dataset_id, dataset_code, project_id)

    # overlapping kml points


def create_red_flag(dataset_id, project_id, redflag):
    current_red_flag = redflag
    logging.debug('create a red flag: ' + current_red_flag)
    # check first if this red flag doesn't exist
    dataset_key = ndb.Key('APIData', normalize_id(dataset_id))
    existing_redflag = RedFlag.query(RedFlag.links == dataset_key,
                                     RedFlag.redflag == current_red_flag).get(
                                     keys_only=True)
    if existing_redflag:
        logging.debug('red flag already exists: ' +
                      str(existing_redflag.urlsafe()))
        return

    project_key = ndb.Key('APIData', normalize_id(project_id))

    redflag = RedFlag()
    redflag.links = [dataset_key, project_key]
    redflag.redflag = current_red_flag
    redflag.put()
    return  # our job is done here. exit!


def check_for_kml_date_different(dataset_id, dataset_code, project_id, images):
    difference_limit = 60 * 60 * 24 * 14  # 2 weeks / 14 days

    # kml
    query = APIData.query(APIData.indexed_data == create_indexed_tag(
        'dataset_id', str(dataset_id)))
    query = query.filter(APIData.indexed_data == create_indexed_tag(
        'type', 'KML'))
    query = query.order(-APIData.created_time)

    kmls = query.fetch(20)

    logging.debug(len(kmls))

    kml_dates = []
    kml_urls = []

    for kml in kmls:
        try:
            timestamp = int(kml.additional_data['last_modified_date'])
            date = datetime.datetime.fromtimestamp(timestamp)
            logging.debug(date)
            kml_dates.append(date)
            kml_urls.append(kml.file_url)
            logging.debug('KML URL: ' + kml.file_url)
        except ValueError:
            logging.exception('problem with int')
            continue
        except KeyError:
            logging.exception('problem with key')
            continue

    if kml_dates:
        kml_dates = set(kml_dates)

    if not kml_dates:
        logging.debug('no kml_dates')
        return

    # image
    logging.debug(len(images))

    image_dates = []

    for image in images:
        try:
            # 2015:05:12 03:03:00
            date = datetime.datetime.strptime(
                image.additional_data['date'], '%Y:%m:%d %H:%M:%S')
            logging.debug(date)
            image_dates.append(date)
        except ValueError:
            logging.exception('problem with int')
            continue
        except KeyError:
            logging.exception('problem with key')
            continue

    if image_dates:
        image_dates = set(image_dates)

    if not image_dates:
        logging.debug('no image_dates')

    if image_dates:
        # comparison
        for kml_date in kml_dates:
            for image_date in image_dates:
                difference_in_microseconds = \
                    (kml_date - image_date).total_seconds()
                logging.debug('difference_in_microseconds: ' +
                              str(difference_in_microseconds))
                difference_in_seconds = int(difference_in_microseconds)
                if difference_in_seconds < 0:
                    logging.debug('less than 0: ' + str(difference_in_seconds))
                    difference_in_seconds = difference_in_seconds * -1
                if difference_in_seconds > difference_limit:
                    # create red flag
                    create_red_flag(
                        dataset_id, project_id, 'KML_DATE_DIFFERENT')

    # kmls have inconsistent start and end points
    check_for_inconsistent_kmls(dataset_id, dataset_code, project_id, kml_urls)


def check_for_upload_delay(dataset_id, dataset_code, project_id, images):
    difference_limit = 60 * 60 * 24 * 14  # 2 weeks / 14 days

    # image
    logging.debug(len(images))

    has_late_upload = False
    for image in images:
        try:
            date = datetime.datetime.strptime(
                image.additional_data['date'], '%Y:%m:%d %H:%M:%S')
            logging.debug(date)
        except ValueError:
            logging.exception('problem with parsing')
            continue
        except KeyError:
            logging.exception('problem with key')
            continue

        difference_in_microseconds = \
            (date - image.created_time).total_seconds()
        logging.debug('difference_in_microseconds: ' +
                      str(difference_in_microseconds))
        difference_in_seconds = int(difference_in_microseconds)
        if difference_in_seconds < 0:
            logging.debug('less than 0: ' + str(difference_in_seconds))
            difference_in_seconds = difference_in_seconds * -1
        if difference_in_seconds > difference_limit:
            # create red flag
            has_late_upload = True
            break

    if has_late_upload:
        create_red_flag(dataset_id, project_id, 'IMAGES_LATE_UPLOAD')


def check_for_more_than_50(dataset_id, dataset_code, project_id):
    # there must be images within 25 to 100 meters away from
    query = APIData.query(APIData.indexed_data == create_indexed_tag(
        'parent_code', str(dataset_code)))
    query = query.filter(APIData.indexed_data == create_indexed_tag(
        'type', 'IMAGE'))
    query = query.order(-APIData.created_time)

    cursor = None
    i = 1
    n = 100
    all_image_coordinates = []
    all_images = []
    while i < 50:
        logging.debug('querying...')
        images, cursor, more = query.fetch_page(n, start_cursor=cursor)
        i = i + 1

        for image in images:
            all_images.append(image)
            try:
                all_image_coordinates.append(image.additional_data['latlng'])
            except KeyError:
                logging.debug(image.additional_data)
                logging.error('no latlng')

        if len(images) < n:
            break

    logging.debug('all_image_coordinates length: ' +
                  str(len(all_image_coordinates)))

    has_50_meter = False
    matched_self = False
    has_red_flag = False
    for image_coordinate in all_image_coordinates:
        if has_50_meter:
            has_50_meter = False
            # skip everything else
            continue

        # make sure that all images have at least one that is less than 50
        # meters away from them.
        for image_coordinate2 in all_image_coordinates:
            distance = get_distance_in_meters(image_coordinate,
                                              image_coordinate2)
            if distance > 25 and distance < 100:
                # outside the grouping circle, and within 50 + 25 meters
                # allowance for grouping
                has_50_meter = True
                # i have a 50 meter
                break

        if not has_50_meter:
            # this image is alone
            create_red_flag(dataset_id, project_id, 'IMAGES_MORE_THAN_50')
            has_red_flag = True
            break

    if not has_red_flag:
        # delete red flag if there was.
        current_red_flag = 'IMAGES_MORE_THAN_50'
        logging.debug('delete red flag: ' + current_red_flag)

        dataset_key = ndb.Key('APIData', normalize_id(dataset_id))
        existing_redflag = RedFlag.query(RedFlag.links == dataset_key,
                                         RedFlag.redflag == current_red_flag
                                         ).get(keys_only=True)
        if existing_redflag:
            existing_redflag.delete()

    # check has 4 photos
    logging.debug('checking 4 photos')
    image_groups = []
    for image_coordinate in all_image_coordinates:
        has_group = False
        for group in image_groups:
            for image in group:
                distance = get_distance_in_meters(image, image_coordinate)
                if distance < 25 and distance >= 0:
                    group.append(image_coordinate)
                    has_group = True
                    break

            if has_group:
                break

        if not has_group:
            image_groups.append([image_coordinate])

    everything_has_4 = True
    logging.debug(image_groups)
    for group in image_groups:
        if len(group) < 4:
            everything_has_4 = False
            create_red_flag(dataset_id, project_id, 'LESS_THAN_4_PHOTOS')

    if everything_has_4:
        # delete red flag if there was.
        current_red_flag = 'LESS_THAN_4_PHOTOS'
        logging.debug('delete red flag: ' + current_red_flag)

        dataset_key = ndb.Key('APIData', normalize_id(dataset_id))
        existing_redflag = RedFlag.query(
            RedFlag.links == dataset_key,
            RedFlag.redflag == current_red_flag).get(keys_only=True)
        if existing_redflag:
            existing_redflag.delete()

    check_for_upload_delay(dataset_id, dataset_code, project_id, all_images)
    check_for_kml_date_different(dataset_id, dataset_code, project_id,
                                 all_images)


def check_for_inconsistent_kmls(dataset_id, dataset_code, project_id,
                                kml_urls):
    # there must be no KMLs in the same dataset that is very far away from the
    # starting point from other KMLs.
    logging.debug('check_for_inconsistent_kmls')
    logging.debug(kml_urls)

    if len(kml_urls) <= 1:
        return

    tracks = []
    for kml_url in kml_urls:
        tracks.append(get_kml_points(get_kml_file_contents(kml_url)))

    logging.debug(tracks)

    max_discrepancy = 500  # 500 meters

    # compare starts

    # check each kml file except itself if it has similar
    # starting and endpoints.
    # it has to have at least one consistency to pass
    is_consistent = []
    outer_index = 0
    for track in tracks:
        get_out = False
        inner_index = 0
        for track2 in tracks:
            get_out = False
            if inner_index != outer_index:
                for path in track:
                    for path2 in track2:
                        distance = get_distance_in_meters(path[0], path2[0])
                        if distance < 0:
                            distance = distance * -1
                        if distance < max_discrepancy:
                            distance2 = \
                                get_distance_in_meters(path[-1], path2[-1])
                            if distance2 < 0:
                                distance2 = distance2 * -1
                            if distance2 < max_discrepancy:
                                is_consistent.append(True)
                                get_out = True
                                break
                    if get_out:
                        break

            inner_index += 1
        outer_index += 1

    logging.debug('is consistent')
    logging.debug(is_consistent)
    logging.debug(len(tracks))
    if len(is_consistent) < len(tracks):
        create_red_flag(dataset_id, project_id, 'INCONSISTENT_KMLS')
    return


def check_for_overlapping_kmls(dataset_id, dataset_code, project_id):
    # there must be no KMLs in the same dataset that is very far away from the
    # starting point from other KMLs.

    query = APIData.query(APIData.indexed_data == create_indexed_tag(
        'parent_code', str(dataset_code)))
    query = query.filter(APIData.indexed_data == create_indexed_tag(
        'type', 'KML'))
    query = query.order(-APIData.created_time)