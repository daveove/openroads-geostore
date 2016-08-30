import csv
import json
import logging
from settings import API_KEY
from functions import write_to_api
from application.handlers.base import BaseHandler
from decorators import login_required

class ImportHandler(BaseHandler):
    @login_required
    def get(self, template=None):
        if template == 'template.csv':
            self.response.headers['Content-Type'] = 'text/csv'
            self.response.out.write(open('template.csv', 'rb').read())
        else:
            self.tv['title'] = "Viewer"
            self.render('2.0/importer.html')

    @login_required
    def post(self):
        filename = self.request.POST['file'].filename.lower()
        if filename.endswith('.csv'):
            HEADERS = []
            DATA = []
            reader = csv.reader(self.request.get('file').split('\n'))
            count = 0
            for row in reader:
                if count == 0:
                    for col in row:
                        new = col.lower()
                        new = new.replace(' ', '_')
                        new = new.replace('(', '')
                        new = new.replace(')', '')
                        new = new.replace('\'', '')
                        new = new.replace('\\', '')
                        new = new.replace('/', '')
                        HEADERS.append(new)
                else:
                    data = {}
                    for i in range(0, len(row)):
                        data[HEADERS[i]] = row[i]
                    DATA.append(data)
                count += 1
            json_filename = filename.replace('.csv', '.json').replace('.CSV', '.json')
            if 'prdp' in json_filename.lower():
                fn = 'prdp'
            elif 'trip' in json_filename.lower():
                fn = 'tripproj'
                if 'sub' in json_filename.lower():
                    fn = 'tripsubproj'
            elif 'bub' in json_filename.lower():
                fn = 'bub'
            elif 'gaa' in json_filename.lower():
                fn = 'gaa'
                if '2014' in json_filename.lower():
                    fn = 'gaa_2013'
            elif 'cpa' in json_filename.lower():
                fn = 'cpa'
            filename = fn + json_filename
            data = DATA
        else:
            data = json.loads(self.request.POST['file'].value)
        for row in data:
            new = {}
            for x in row:
                if x:
                    if x == 'type':
                        x = 'row_type'
                    key = 'unindexed_meta_' + x
                    modified_key = False
                    if 'prdp' in filename:
                        if x == 'subproject_identification_number':
                            key = key.replace(x, 'code')
                            modified_key = True
                        elif x == 'subproject_type___corrected':
                            key = key.replace(x, 'project_type')
                            modified_key = True
                        elif x == 'subproject_title':
                            key = key.replace(x, 'title')
                            modified_key = True
                        elif x == 'category':
                            key = key.replace(x, 'scope')
                            modified_key = True
                        elif x == 'municipality___city':
                            key = key.replace(x, 'municipality')
                            modified_key = True
                        elif x == 'province':
                            key = key.replace(x, 'province')
                            modified_key = True
                        elif x == 'subroject_status':
                            key = key.replace(x, 'status')
                            modified_key = True
                    elif 'tripsubproj' in filename:
                        if x == 'project_id':
                            key = key.replace(x, 'code')
                            modified_key = True
                        elif x == 'typec254':
                            key = key.replace(x, 'project_type')
                            modified_key = True
                        elif x == 'project_description':
                            key = key.replace(x, 'title')
                            modified_key = True
                        elif x == 'provincec254':
                            key = key.replace(x, 'province')
                            modified_key = True
                        elif x == 'locationc254':
                            key = key.replace(x, 'municipality')
                            modified_key = True
                        elif x == 'projcodec254':
                            key = key.replace(x, 'parent_code')
                            modified_key = True
                    elif 'trip_bohol_sub' in filename:
                        if x == 'projectid':
                            key = key.replace(x, 'code')
                            modified_key = True
                        elif x == 'category':
                            key = key.replace(x, 'project_type')
                            modified_key = True
                        elif x == 'project_description':
                            key = key.replace(x, 'title')
                            modified_key = True
                        elif x == 'province':
                            key = key.replace(x, 'province')
                            modified_key = True
                        elif x == 'projcode':
                            key = key.replace(x, 'parent_code')
                            modified_key = True
                        elif x == 'scope':
                            key = key.replace(x, 'scope')
                            modified_key = True
                    elif 'bub' in filename:
                        if x == 'id':
                            key = key.replace(x, 'code')
                            modified_key = True
                        elif x == 'projects_project_type':
                            key = key.replace(x, 'project_type')
                            modified_key = True
                        elif x == 'projects_project_title':
                            key = key.replace(x, 'title')
                            modified_key = True
                        elif x == 'projects_municipality':
                            key = key.replace(x, 'municipality')
                            modified_key = True
                        elif x == 'projects_province':
                            key = key.replace(x, 'province')
                            modified_key = True
                        elif x == 'reports_quarterly_physical_accomplishment':
                            key = key.replace(x, 'status')
                            modified_key = True
                    elif 'gaa_2013' in filename:
                        if x == 'code':
                            key = key.replace(x, 'code')
                            modified_key = True
                        elif x == 'name_of_project_road_section':
                            key = key.replace(x, 'title')
                            modified_key = True
                        elif x == 'proj_status':
                            key = key.replace(x, 'status')
                            modified_key = True
                        elif x == 'prov':
                            key = key.replace(x, 'province')
                            modified_key = True
                        elif x == 'municplity':
                            key = key.replace(x, 'municipality')
                            modified_key = True
                    elif 'gaa' in filename:
                        if x == 'id':
                            key = key.replace(x, 'code')
                            modified_key = True
                        elif x == 'project_description':
                            key = key.replace(x, 'title')
                            modified_key = True
                        elif x == 'status':
                            key = key.replace(x, 'status')
                            modified_key = True
                        elif x == 'province':
                            key = key.replace(x, 'province')
                            modified_key = True
                        elif x == 'municipality':
                            key = key.replace(x, 'municipality')
                            modified_key = True
                    elif 'cpa' in filename:
                        if x == 'id':
                            key = key.replace(x, 'code')
                            modified_key = True
                        elif x == 'name':
                            key = key.replace(x, 'title')
                            modified_key = True
                        elif x == 'status':
                            key = key.replace(x, 'status')
                            modified_key = True
                        elif x == 'province':
                            key = key.replace(x, 'province')
                            modified_key = True
                        elif x == 'municipality':
                            key = key.replace(x, 'municipality')
                            modified_key = True
                    elif 'tripproj' in filename:
                        if x == 'proj_code':
                            key = key.replace(x, 'code')
                            modified_key = True
                        elif x == 'road_name':
                            key = key.replace(x, 'title')
                            modified_key = True
                        elif x == 'scope_of_work':
                            key = key.replace(x, 'scope')
                            modified_key = True
                        elif x == 'province':
                            key = key.replace(x, 'province')
                            modified_key = True
                        elif x == 'municipality':
                            key = key.replace(x, 'municipality')
                            modified_key = True
                    else:
                        if x == 'id':
                            key = key.replace('id', 'code')
                    if modified_key:
                        key = key.replace('meta_', '')
                    if any(y in x for y in ['id', 'code', 'status', 'cost', 'length', 'amount', 'year', 'type']):
                        key = key.replace('unindexed_', 'indexed_')
                    if x in ['island', 'region', 'psgc_mun', 'municipality', 'name', 'geotagged', 'fs_type', 'fs_name', 'fs_tname', 'batch', 'cpa_assessment', 'coa']:
                        key = key.replace('unindexed_', 'indexed_')
                    if x == 'row_type':
                        new[key] = row['type']
                    else:
                        new[key] = row[x]
            new['indexed_type'] = 'PROJECT'
            if any(y in filename for y in ['tripsubproj', 'trip_bohol_sub']):
                new['indexed_type'] = 'SUBPROJECT'
            new['indexed_data_is_imported'] = '1'
            if 'indexed_project_type' not in new:
                new['indexed_project_type'] = ''
            if 'prdp' in filename:
                new['indexed_agency'] = 'DA'
                new['indexed_program'] = 'PRDP'
            elif 'trip' in filename:
                new['indexed_agency'] = 'DOT'
                new['indexed_program'] = 'TRIP'
            elif 'bub' in filename:
                new['indexed_agency'] = 'DPWH'
                new['indexed_program'] = 'BUB'
            elif 'gaa' in filename:
                new['indexed_agency'] = 'DPWH'
                new['indexed_program'] = 'GAA'
            elif 'cpa' in filename:
                new['indexed_coa'] = '1'
                new['indexed_agency'] = 'DPWH'
                new['indexed_program'] = 'GAA'
                if 'local' in filename:
                    new['indexed_agency'] = 'LOCAL'
                    new['indexed_program'] = 'LOCAL'
            logging.debug(new)
            headers = {}
            headers['Authorization'] = API_KEY
            headers['From'] = 'nell+geostore@sym.ph'
            headers['Content-Type'] = 'application/json'
            write_to_api(new, self.user, 'application/json', True)
            self.redirect('/import')