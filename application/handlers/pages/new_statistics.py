import logging
import json
from datetime import datetime
from google.appengine.api import taskqueue, memcache
from application.handlers.base import BaseHandler
from application.models.statistics import Statistics
from settings import APP_IS_LOCAL


class NewStatisticsDashboard(BaseHandler):
    def get(self):
        if APP_IS_LOCAL:
            if self.request.get('old'):
                with open('statistics.json', 'rb') as f:
                    self.tv['statistics'] = f.read()
            else:
                with open('statistics-v2.json', 'rb') as f:
                    self.tv['statistics'] = f.read()
            self.render('new-statistics-summary-dashboard.html')
            return
        date = datetime.now()
        query = Statistics.query()
        query = query.order(-Statistics.created)
        statistics = query.get()
        if statistics:
            if statistics.created.date() == date.date():
                if statistics.done:
                    self.tv['statistics'] = json.dumps(statistics.to_api_object())
                    self.render('new-statistics-summary-dashboard.html')
                else:
                    response = {}
                    response['done'] = False
                    response['generating'] = True
                    response['message'] = ('Please refresh this page within 1-'
                                           '2 minutes to check if the statisti'
                                           'cs has been generated.')
                    logging.debug(response)
                    self.render('new-statistics-summary-dashboard-generating.html')
                return
            else:
                taskqueue.add(url='/statistics/generate')
                response = {}
                response['done'] = False
                response['generating'] = True
                response['message'] = ('Please refresh this page within 1-'
                                       '2 minutes to check if the statisti'
                                       'cs has been generated.')
                logging.debug(response)
                self.render('new-statistics-summary-dashboard-generating.html')
            return
        else:
            taskqueue.add(url='/statistics/generate')
            response = {}
            response['done'] = False
            response['generating'] = True
            response['message'] = ('Please refresh this page within 1-'
                                   '2 minutes to check if the statisti'
                                   'cs has been generated.')
            logging.debug(response)
            self.render('new-statistics-summary-dashboard-generating.html')
        return
        # self.tv['statistics'] = json.dumps({
        #     'coa_projects_geoprocessed': memcache.get('statistics_coa_projects_geoprocessed'),
        #     'prdp_projects_geoprocessed': memcache.get('statistics_prdp_projects_geoprocessed'),
        #     'bub_projects_geoprocessed': memcache.get('statistics_bub_projects_geoprocessed'),
        #     'gaa_projects_geoprocessed': memcache.get('statistics_gaa_projects_geoprocessed'),
        #     'trip_projects_geoprocessed': memcache.get('statistics_trip_projects_geoprocessed'),
        #     'coa_projects': memcache.get('statistics_coa_projects'),
        #     'prdp_projects': memcache.get('statistics_prdp_projects'),
        #     'bub_projects': memcache.get('statistics_bub_projects'),
        #     'gaa_projects': memcache.get('statistics_gaa_projects'),
        #     'trip_projects': memcache.get('statistics_trip_projects'),
        #     'coa_geotag_images': memcache.get('statistics_coa_geotag_images'),
        #     'coa_images': memcache.get('statistics_coa_images'),
        #     'prdp_geotag_images': memcache.get('statistics_prdp_geotag_images'),
        #     'prdp_images': memcache.get('statistics_prdp_images'),
        #     'bub_geotag_images': memcache.get('statistics_bub_geotag_images'),
        #     'bub_images': memcache.get('statistics_bub_images'),
        #     'gaa_geotag_images': memcache.get('statistics_gaa_geotag_images'),
        #     'gaa_images': memcache.get('statistics_gaa_images'),
        #     'trip_geotag_images': memcache.get('statistics_trip_geotag_images'),
        #     'trip_images': memcache.get('statistics_trip_images'),
        # })
        # self.render('statistics-summary-dashboard.html')
