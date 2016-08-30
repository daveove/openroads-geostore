#!/usr/bin/env python
# -*- coding: utf-8 -*-
import logging
import json
from application.handlers.base import BaseHandler
from decorators import login_required
from application.models.apidata import APIData
from functions import create_indexed_tag
from asset_values import ASSET_VALUES
from google.appengine.ext import ndb


def find_between_r(s, first, last):
    try:
        start = s.rindex(first) + len(first)
        end = s.rindex(last, start)
        return s[start:end]
    except ValueError:
        return ""


class GeoprocessingDashboardHandler(BaseHandler):
    @login_required
    def get(self):
        self.tv['page'] = 'dashboard'
        self.tv['page_geoprocessing'] = True
        self.tv["program"] = "all"
        self.render('geoprocessing/geoprocessing-dashboard.html')


class GeoprocessingDashboardClassifictionHandler(BaseHandler):
    @login_required
    def get(self):
        self.tv['page_geoprocessing'] = True

        self.tv['project_code'] = self.request.get('project_code')

        if self.tv['project_code']:
            tag = create_indexed_tag('project_code',
                                     str(self.tv['project_code']))
            query = APIData.query(APIData.indexed_data == tag)
            tag = create_indexed_tag('type', 'KML')
            query = query.filter(APIData.indexed_data == tag)
            query = query.order(-APIData.created_time)

            kmls = query.fetch(20)
            logging.debug(kmls)

            self.tv['kmls'] = []
            tag = create_indexed_tag('parent_code',
                                     str(self.tv['project_code']))
            query = APIData.query(APIData.indexed_data == tag)
            tag = create_indexed_tag('type', 'DATASET')
            query = query.filter(APIData.indexed_data == tag)
            query = query.order(-APIData.created_time)
            datasets = query.fetch(25)
            logging.debug(datasets)

            for kml in kmls:
                self.tv['kmls'].append({
                    'filename': find_between_r(kml.file_url + ' ', '/', ' '),
                    'kml_id': kml.key.id(),
                    'file_url': kml.file_url,
                    'parent_code': kml.additional_data['parent_code']
                })
            self.tv['datasets'] = []
            for dataset in datasets:
                self.tv['datasets'].append(dataset.to_api_object())
            self.tv['asset_values'] = json.dumps(ASSET_VALUES)
        self.render('geoprocessing/new-classification-summary.html')


class GeoprocessingToolImagesHandler(BaseHandler):
    @login_required
    def get(self):
        self.tv['page_geoprocessing'] = True
        self.tv['project_code'] = self.request.get('project_code')
        self.render('geoprocessing/images.html')


class GeoprocessedPageHandler(BaseHandler):
    @login_required
    def get(self):
        self.tv['page_geoprocessing'] = True
        self.tv["program"] = "geoprocessed"
        self.tv['page_geoprocessed'] = True
        self.render('geoprocessing/geoprocessing-dashboard.html')


class GeoprocessingToolHandler(BaseHandler):
    @login_required
    def get(self):
        self.tv['page'] = 'tool'
        self.tv["program"] = "tool"
        self.tv['page_geoprocessing'] = True
        self.render('geoprocessing/index.html')


class ForGeoprocessedPageHandler(BaseHandler):
    @login_required
    def get(self):
        self.tv['page_geoprocessing'] = True
        self.tv['page_for_geoprocessing'] = True
        self.tv["program"] = "for_geoprocessing"
        self.render('geoprocessing/geoprocessing-dashboard.html')
