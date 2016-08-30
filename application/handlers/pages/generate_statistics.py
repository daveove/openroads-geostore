import json
import logging
from datetime import datetime
from google.appengine.datastore.datastore_query import Cursor
from google.appengine.api import memcache
from google.appengine.api import taskqueue
from application.handlers.base import BaseHandler
from application.models.apidata import APIData
from application.models.program import Program
from application.models.statistics import Statistics


class GenerateStatisticsHandler(BaseHandler):
    def get(self):
        '''
            Query projects that has a classification then put the total
            number of projects in the memcache. Optionally set a version.
        '''
        self.response.headers['Content-Type'] = 'application/json'
        date = datetime.now()
        query = Statistics.query()
        query = query.order(-Statistics.created)
        statistics = query.get()
        self.response.write(json.dumps(statistics.statistics))
        return
        coa_projects_geoprocessed = memcache.get('statistics_coa_projects_geoprocessed')
        if not coa_projects_geoprocessed:
            query = APIData.query()
            query = query.filter(APIData.indexed_data == 'TYPE->PROJECT')
            query = query.filter(APIData.indexed_data == 'HAS_CLASSIFICATION->1')
            query = query.filter(APIData.indexed_data == 'PROGRAM->COA')
            coa_projects_geoprocessed = len(query.fetch(keys_only=True))
            memcache.set('statistics_coa_projects_geoprocessed', coa_projects_geoprocessed, 86400)
        prdp_projects_geoprocessed = memcache.get('statistics_prdp_projects_geoprocessed')
        if not prdp_projects_geoprocessed:
            query = APIData.query()
            query = query.filter(APIData.indexed_data == 'TYPE->PROJECT')
            query = query.filter(APIData.indexed_data == 'HAS_CLASSIFICATION->1')
            query = query.filter(APIData.indexed_data == 'PROGRAM->PRDP')
            prdp_projects_geoprocessed = len(query.fetch(keys_only=True))
            memcache.set('statistics_prdp_projects_geoprocessed', prdp_projects_geoprocessed, 86400)
        bub_projects_geoprocessed = memcache.get('statistics_bub_projects_geoprocessed')
        if not bub_projects_geoprocessed:
            query = APIData.query()
            query = query.filter(APIData.indexed_data == 'TYPE->PROJECT')
            query = query.filter(APIData.indexed_data == 'HAS_CLASSIFICATION->1')
            query = query.filter(APIData.indexed_data == 'PROGRAM->BUB')
            bub_projects_geoprocessed = len(query.fetch(keys_only=True))
            memcache.set('statistics_bub_projects_geoprocessed', bub_projects_geoprocessed, 86400)
        gaa_projects_geoprocessed = memcache.get('statistics_gaa_projects_geoprocessed')
        if not gaa_projects_geoprocessed:
            query = APIData.query()
            query = query.filter(APIData.indexed_data == 'TYPE->PROJECT')
            query = query.filter(APIData.indexed_data == 'HAS_CLASSIFICATION->1')
            query = query.filter(APIData.indexed_data == 'PROGRAM->GAA')
            gaa_projects_geoprocessed = len(query.fetch(keys_only=True))
            memcache.set('statistics_gaa_projects_geoprocessed', gaa_projects_geoprocessed, 86400)
        trip_projects_geoprocessed = memcache.get('statistics_trip_projects_geoprocessed')
        if not trip_projects_geoprocessed:
            query = APIData.query()
            query = query.filter(APIData.indexed_data == 'TYPE->PROJECT')
            query = query.filter(APIData.indexed_data == 'HAS_CLASSIFICATION->1')
            query = query.filter(APIData.indexed_data == 'PROGRAM->TRIP')
            trip_projects_geoprocessed = len(query.fetch(keys_only=True))
            memcache.set('statistics_trip_projects_geoprocessed', trip_projects_geoprocessed, 86400)
        coa_projects = memcache.get('statistics_coa_projects')
        if not coa_projects:
            query = APIData.query()
            query = query.filter(APIData.indexed_data == 'TYPE->PROJECT')
            query = query.filter(APIData.indexed_data == 'PROGRAM->COA')
            coa_projects = len(query.fetch(keys_only=True))
            memcache.set('statistics_coa_projects', coa_projects, 86400)
        prdp_projects = memcache.get('statistics_prdp_projects')
        if not prdp_projects:
            query = APIData.query()
            query = query.filter(APIData.indexed_data == 'TYPE->PROJECT')
            query = query.filter(APIData.indexed_data == 'PROGRAM->PRDP')
            prdp_projects = len(query.fetch(keys_only=True))
            memcache.set('statistics_prdp_projects', prdp_projects, 86400)
        bub_projects = memcache.get('statistics_bub_projects')
        if not bub_projects:
            query = APIData.query()
            query = query.filter(APIData.indexed_data == 'TYPE->PROJECT')
            query = query.filter(APIData.indexed_data == 'PROGRAM->BUB')
            bub_projects = len(query.fetch(keys_only=True))
            memcache.set('statistics_bub_projects', bub_projects, 86400)
        gaa_projects = memcache.get('statistics_gaa_projects')
        if not gaa_projects:
            query = APIData.query()
            query = query.filter(APIData.indexed_data == 'TYPE->PROJECT')
            query = query.filter(APIData.indexed_data == 'PROGRAM->GAA')
            gaa_projects = len(query.fetch(keys_only=True))
            memcache.set('statistics_gaa_projects', gaa_projects, 86400)
        trip_projects = memcache.get('statistics_trip_projects')
        if not trip_projects:
            query = APIData.query()
            query = query.filter(APIData.indexed_data == 'TYPE->PROJECT')
            query = query.filter(APIData.indexed_data == 'PROGRAM->TRIP')
            trip_projects = len(query.fetch(keys_only=True))
            memcache.set('statistics_trip_projects', trip_projects, 86400)
        coa_geotag_images = memcache.get('statistics_coa_geotag_images')
        if not coa_geotag_images:
            query = APIData.query()
            query = query.filter(APIData.indexed_data == 'TYPE->IMAGE')
            query = query.filter(APIData.indexed_data == 'IS_ROAD->1')
            query = query.filter(APIData.indexed_data == 'PROGRAM->COA')
            coa_geotag_images = len(query.fetch(keys_only=True))
            memcache.set('statistics_coa_geotag_images', coa_geotag_images, 86400)
        coa_images = memcache.get('statistics_coa_images')
        if not coa_images:
            query = APIData.query()
            query = query.filter(APIData.indexed_data == 'TYPE->IMAGE')
            query = query.filter(APIData.indexed_data == 'PROGRAM->COA')
            coa_images = len(query.fetch(keys_only=True))
            memcache.set('statistics_coa_images', coa_images, 86400)
        prdp_geotag_images = memcache.get('statistics_prdp_geotag_images')
        if not prdp_geotag_images:
            query = APIData.query()
            query = query.filter(APIData.indexed_data == 'TYPE->IMAGE')
            query = query.filter(APIData.indexed_data == 'IS_ROAD->1')
            query = query.filter(APIData.indexed_data == 'PROGRAM->PRDP')
            prdp_geotag_images = len(query.fetch(keys_only=True))
            memcache.set('statistics_prdp_geotag_images', prdp_geotag_images, 86400)
        prdp_images = memcache.get('statistics_prdp_images')
        if not prdp_images:
            query = APIData.query()
            query = query.filter(APIData.indexed_data == 'TYPE->IMAGE')
            query = query.filter(APIData.indexed_data == 'PROGRAM->PRDP')
            prdp_images = len(query.fetch(keys_only=True))
            memcache.set('statistics_prdp_images', prdp_images, 86400)
        bub_geotag_images = memcache.get('statistics_bub_geotag_images')
        if not bub_geotag_images:
            query = APIData.query()
            query = query.filter(APIData.indexed_data == 'TYPE->IMAGE')
            query = query.filter(APIData.indexed_data == 'IS_ROAD->1')
            query = query.filter(APIData.indexed_data == 'PROGRAM->BUB')
            bub_geotag_images = len(query.fetch(keys_only=True))
            memcache.set('statistics_bub_geotag_images', bub_geotag_images, 86400)
        bub_images = memcache.get('statistics_bub_images')
        if not bub_images:
            query = APIData.query()
            query = query.filter(APIData.indexed_data == 'TYPE->IMAGE')
            query = query.filter(APIData.indexed_data == 'PROGRAM->BUB')
            bub_images = len(query.fetch(keys_only=True))
            memcache.set('statistics_bub_images', bub_images, 86400)
        gaa_geotag_images = memcache.get('statistics_gaa_geotag_images')
        if not gaa_geotag_images:
            query = APIData.query()
            query = query.filter(APIData.indexed_data == 'TYPE->IMAGE')
            query = query.filter(APIData.indexed_data == 'IS_ROAD->1')
            query = query.filter(APIData.indexed_data == 'PROGRAM->GAA')
            gaa_geotag_images = len(query.fetch(keys_only=True))
            memcache.set('statistics_gaa_geotag_images', gaa_geotag_images, 86400)
        gaa_images = memcache.get('statistics_gaa_images')
        if not gaa_images:
            query = APIData.query()
            query = query.filter(APIData.indexed_data == 'TYPE->IMAGE')
            query = query.filter(APIData.indexed_data == 'PROGRAM->GAA')
            gaa_images = len(query.fetch(keys_only=True))
            memcache.set('statistics_gaa_images', gaa_images, 86400)
        trip_geotag_images = memcache.get('statistics_trip_geotag_images')
        if not trip_geotag_images:
            query = APIData.query()
            query = query.filter(APIData.indexed_data == 'TYPE->IMAGE')
            query = query.filter(APIData.indexed_data == 'IS_ROAD->1')
            query = query.filter(APIData.indexed_data == 'PROGRAM->TRIP')
            trip_geotag_images = len(query.fetch(keys_only=True))
            memcache.set('statistics_trip_geotag_images', trip_geotag_images, 86400)
        trip_images = memcache.get('statistics_trip_images')
        if not trip_images:
            query = APIData.query()
            query = query.filter(APIData.indexed_data == 'TYPE->IMAGE')
            query = query.filter(APIData.indexed_data == 'PROGRAM->TRIP')
            trip_images = len(query.fetch(keys_only=True))
            memcache.set('statistics_trip_images', trip_images, 86400)
        self.response.headers['Content-Type'] = 'application/json'
        self.response.write(json.dumps(
            {
                'coa_projects_geoprocessed': memcache.get('statistics_coa_projects_geoprocessed'),
                'prdp_projects_geoprocessed': memcache.get('statistics_prdp_projects_geoprocessed'),
                'bub_projects_geoprocessed': memcache.get('statistics_bub_projects_geoprocessed'),
                'gaa_projects_geoprocessed': memcache.get('statistics_gaa_projects_geoprocessed'),
                'trip_projects_geoprocessed': memcache.get('statistics_trip_projects_geoprocessed'),
                'coa_projects': memcache.get('statistics_coa_projects'),
                'prdp_projects': memcache.get('statistics_prdp_projects'),
                'bub_projects': memcache.get('statistics_bub_projects'),
                'gaa_projects': memcache.get('statistics_gaa_projects'),
                'trip_projects': memcache.get('statistics_trip_projects'),
                'coa_geotag_images': memcache.get('statistics_coa_geotag_images'),
                'coa_images': memcache.get('statistics_coa_images'),
                'prdp_geotag_images': memcache.get('statistics_prdp_geotag_images'),
                'prdp_images': memcache.get('statistics_prdp_images'),
                'bub_geotag_images': memcache.get('statistics_bub_geotag_images'),
                'bub_images': memcache.get('statistics_bub_images'),
                'gaa_geotag_images': memcache.get('statistics_gaa_geotag_images'),
                'gaa_images': memcache.get('statistics_gaa_images'),
                'trip_geotag_images': memcache.get('statistics_trip_geotag_images'),
                'trip_images': memcache.get('statistics_trip_images'),
            }
        ))
        return

    def post(self):
        logging.debug(self.request.POST)
        self.response.headers['Content-Type'] = 'application/json'
        date = datetime.now()
        query = Statistics.query()
        query = query.order(-Statistics.created)
        statistics = query.get()
        if statistics:
            if statistics.created.date() == date.date():
                if statistics.done:
                    logging.debug({'done': True})
                    return
                else:
                    logging.debug({'done': False})
            else:
                statistics = Statistics()
        else:
            statistics = Statistics()
        logging.debug(statistics.statistics)
        if statistics.statistics:
            statistics_ = statistics.statistics
        else:
            statistics_ = {}
        query = Program.query()
        programs = query.fetch()
        for program in programs:
            logging.debug(program.name)
            if program.name.upper() not in statistics_:
                statistics_[program.name.upper()] = {}
        query = APIData.query()
        query = query.filter(APIData.indexed_data == 'TYPE->PROJECT')
        if self.request.get('cursor'):
            logging.debug('HAS CURSOR')
            c = Cursor(urlsafe=self.request.get('cursor'))
            results, cursor, more = query.fetch_page(200, start_cursor=c)
        else:
            logging.debug('NO CURSOR')
            results, cursor, more = query.fetch_page(200)
        logging.debug(len(results))
        logging.debug(more)
        for project in results:
            program = project.additional_data['program'].upper()
            year = date.strftime('%Y')
            if program not in statistics_:
                logging.debug('PROGRAM DOES NOT EXIST')
                statistics_[program] = {}
            if 'year' in project.additional_data:
                year = project.additional_data['year']
            else:
                for x in project.additional_data:
                    if 'year' in x:
                        if 'budget' in x:
                            if project.additional_data[x]:
                                year = project.additional_data[x]
                                break
                            else:
                                continue
                        else:
                            if project.additional_data[x]:
                                year = project.additional_data[x]
            if year not in statistics_[program]:
                statistics_[program][year] = {}
                statistics_[program][year]['projects'] = 0
                statistics_[program][year]['geoprocessed_images'] = 0
                statistics_[program][year]['geoprocessed_projects'] = 0
                statistics_[program][year]['geoprocessed_projects_details'] = {}
            statistics_[program][year]['projects'] += 1
            if 'has_geoprocessed_images' in project.additional_data:
                if project.additional_data['has_geoprocessed_images'] == '1':
                    statistics_[program][year]['geoprocessed_projects'] += 1
                    statistics_[program][year]['geoprocessed_images'] += int(project.additional_data['geoprocessed_images'])
                    statistics_[program][year]['geoprocessed_projects_details'][project.additional_data['code']] = int(project.additional_data['geoprocessed_images'])
        statistics.statistics = statistics_
        statistics.put()
        if cursor:
            params = {'cursor': cursor.urlsafe()}
            logging.debug(params)
            taskqueue.add(
                url='/statistics/generate',
                params=params
            )
        else:
            for x in statistics_:
                logging.debug(x.upper())
                query = APIData.query()
                query = query.filter(APIData.indexed_data == 'TYPE->IMAGE')
                query = query.filter(APIData.indexed_data == 'PROGRAM->' + x.upper())
                total_geotag_images = len(query.fetch(keys_only=True))
                statistics_[x.upper()]['total_geotag_images'] = total_geotag_images
                logging.debug('total_geotag_images:' + str(total_geotag_images))
                query = APIData.query()
                query = query.filter(APIData.indexed_data == 'TYPE->KML')
                query = query.filter(APIData.indexed_data == 'PROGRAM->' + x.upper())
                kml = len(query.fetch(keys_only=True))
                statistics_[x.upper()]['kml'] = kml
                logging.debug('kml:' + str(kml))
                query = APIData.query()
                query = query.filter(APIData.indexed_data == 'TYPE->IMAGE')
                query = query.filter(APIData.indexed_data == 'IS_ROAD->1')
                query = query.filter(APIData.indexed_data == 'PROGRAM->' + x.upper())
                geotag_images = len(query.fetch(keys_only=True))
                statistics_[x.upper()]['geotag_images'] = geotag_images
                logging.debug('geotag_images:' + str(geotag_images))
            statistics.statistics = statistics_
            statistics.done = True
            statistics.put()
        return
        # if version == 'new':
        #     self.response.headers['Content-Type'] = 'application/json'
        #     date = datetime.now()
        #     query = Statistics.query()
        #     query = query.order(-Statistics.created)
        #     statistics = query.get()
        #     if statistics:
        #         if statistics.created.date() == date.date():
        #             if statistics.done:
        #                 logging.debug({'done': True})
        #             else:
        #                 logging.debug({'done': False})
        #             return
        #     statistics_ = Statistics()
        #     statistics_.data = {}
        #     statistics_.put()
        #     logging.debug(statistics_)
        #     query = Program.query()
        #     programs = query.fetch()
        #     statistics = {}
        #     for program in programs:
        #         statistics[program.name.upper()] = {}
        #         statistics[program.name.upper()]['projects'] = 0
        #         statistics[program.name.upper()]['kml'] = 0
        #         statistics[program.name.upper()]['geotag_images'] = 0
        #         statistics[program.name.upper()]['total_geotag_images'] = 0
        #         statistics[program.name.upper()]['geoprocessed_images'] = 0
        #         statistics[program.name.upper()]['geoprocessed_projects'] = 0
        #         statistics[program.name.upper()]['geoprocessed_projects_details'] = {}
        #         query = APIData.query()
        #         query = query.filter(APIData.indexed_data == 'TYPE->PROJECT')
        #         query = query.filter(APIData.indexed_data == 'HAS_CLASSIFICATION->1')
        #         query = query.filter(APIData.indexed_data == 'PROGRAM->' + program.name.upper())
        #         statistics[program.name.upper()]['geoprocessed_projects'] = len(query.fetch(keys_only=True))
        #         query = APIData.query()
        #         query = query.filter(APIData.indexed_data == 'TYPE->PROJECT')
        #         query = query.filter(APIData.indexed_data == 'PROGRAM->' + program.name.upper())
        #         statistics[program.name.upper()]['projects'] = len(query.fetch(keys_only=True))
        #         query = APIData.query()
        #         query = query.filter(APIData.indexed_data == 'TYPE->IMAGE')
        #         query = query.filter(APIData.indexed_data == 'IS_ROAD->1')
        #         query = query.filter(APIData.indexed_data == 'PROGRAM->' + program.name.upper())
        #         statistics[program.name.upper()]['geotag_images'] = len(query.fetch(keys_only=True))
        #         query = APIData.query()
        #         query = query.filter(APIData.indexed_data == 'TYPE->IMAGE')
        #         query = query.filter(APIData.indexed_data == 'PROGRAM->' + program.name.upper())
        #         statistics[program.name.upper()]['total_geotag_images'] = len(query.fetch(keys_only=True))
        #         query = APIData.query()
        #         query = query.filter(APIData.indexed_data == 'TYPE->KML')
        #         query = query.filter(APIData.indexed_data == 'PROGRAM->' + program.name.upper())
        #         statistics[program.name.upper()]['kml'] = len(query.fetch(keys_only=True))
        #     query = APIData.query()
        #     query = query.filter(APIData.indexed_data == 'TYPE->PROJECT')
        #     query = query.filter(APIData.indexed_data == 'HAS_GEOPROCESSED_IMAGES->1')
        #     projects = query.fetch()
        #     for project in projects:
        #         program = project.additional_data['program']
        #         code = project.additional_data['code']
        #         geoprocessed_images = int(project.additional_data['geoprocessed_images'])
        #         if program not in statistics:
        #             statistics[program] = {}
        #             statistics[program]['projects'] = 0
        #             statistics[program]['kml'] = 0
        #             statistics[program]['geotag_images'] = 0
        #             statistics[program]['total_geotag_images'] = 0
        #             statistics[program]['geoprocessed_images'] = 0
        #             statistics[program]['geoprocessed_projects'] = 0
        #             statistics[program]['geoprocessed_projects_details'] = {}
        #         if program in statistics:
        #             statistics[program]['geoprocessed_projects_details'][code] = geoprocessed_images
        #     statistics_.statistics = statistics
        #     statistics_.done = True
        #     statistics_.put()
        #     logging.debug(statistics_)
        #     self.response.write(json.dumps({'done': True}))
        #     return