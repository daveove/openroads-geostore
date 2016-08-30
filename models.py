import os
import datetime
import time
import urllib
import hashlib
import json
import csv
import random
import logging
import cloudstorage as gcs
# from settings import CHARGE, CURRENCY, CURRENT_URL
from request import global_vars
from mandrill_email import *
from user_exceptions import *
from functions import *
from google.appengine.ext import ndb
from google.appengine.api import taskqueue
from settings import RED_FLAGS
from functions import get_distance_in_meters
from functions import get_kml_file_contents
from functions import get_kml_points


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


class LoginCode(ndb.Model):
    login_code = ndb.StringProperty()
    session = ndb.KeyProperty(kind="Session")
    expiry = ndb.DateTimeProperty()
    created_time = ndb.DateTimeProperty(auto_now_add=True)
    updated_time = ndb.DateTimeProperty(auto_now=True)


class Nonce(ndb.Model):
    nonce = ndb.StringProperty()
    timestamp = ndb.IntegerProperty()


class Token(ndb.Model):
    token = ndb.StringProperty()
    session = ndb.KeyProperty(kind="Session")
    token_type = ndb.StringProperty()


class Session(ndb.Model):
    owner = ndb.KeyProperty(kind='User')
    created_time = ndb.DateTimeProperty(auto_now_add=True)
    ip_address = ndb.StringProperty()
    user_agent = ndb.TextProperty()
    status = ndb.BooleanProperty(default=True)
    data = ndb.JsonProperty()
    expires = ndb.DateTimeProperty()


class Counter(ndb.Model):
    created = ndb.DateTimeProperty(auto_now_add=True)
    updated = ndb.DateTimeProperty(auto_now=True)
    data = ndb.JsonProperty()
    done = ndb.BooleanProperty(default=False)


class APIProxy(ndb.Model):
    updated = ndb.DateTimeProperty(auto_now_add=True)
    content = ndb.BlobProperty()


class RedFlag(ndb.Model):
    created = ndb.DateTimeProperty(auto_now_add=True)
    updated = ndb.DateTimeProperty(auto_now=True)
    links = ndb.KeyProperty(repeated=True)
    redflag = ndb.StringProperty(required=True)

    def to_object(self, full=False):
        data = {}
        data['created'] = time.mktime(self.created.timetuple())
        data['updated'] = time.mktime(self.updated.timetuple())
        data['redflag'] = self.redflag
        data['redflag_description'] = RED_FLAGS[self.redflag]

        if full:
            data['links'] = []

            if self.links:
                links = ndb.get_multi(self.links)
                for link in self.links:
                    data_object = link.to_api_object()
                    data['links'].append(data_object)

        return data


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


def check_for_overlapping_kmls(dataset_id, dataset_code, project_id):
    # there must be no KMLs in the same dataset that is very far away from the
    # starting point from other KMLs.

    query = APIData.query(APIData.indexed_data == create_indexed_tag(
        'parent_code', str(dataset_code)))
    query = query.filter(APIData.indexed_data == create_indexed_tag(
        'type', 'KML'))
    query = query.order(-APIData.created_time)
