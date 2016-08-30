"""

Geostore Task Queue



Objective: Count all of the following:

- Projects
    - Program
    - Year

- Sum Budgets
- Sum counts
- Count number of the ones that have KML
- Get percentage of the ones that have KML
- Count the ones that have images
- Get percentage of the ones that have images
- count geoprocessed
- get percentage of geoprocessed
- count the ones that have ePLC ID AND has completion data


The counter should have the following properties:

It should finish in less than 5 minutes.


Methodology:

1. Create a preput hook that checks for the following per project
    - with classification
    - with KML
    - with images
    - with ePLC
    - with completion data

2. Task Queue that just puts all projects

3.


- run in transaction
- Run counter method
- query by batches of 50.
- process and create a new counter. set its dates.
- put the counts into the counter as json
- if there are still more
    - task queue. set the cursor. and set the last counts as parameters. countdown 3 seconds.
    - in the task, continue the counts from parameters. and the cursor

"""

import uuid
from models import Counter
from application.models.apidata import APIData
from google.appengine.ext import ndb
from google.appengine.datastore.datastore_query import Cursor
from functions import create_indexed_tag
import logging
from functions import uniquify


def run_counter(counter_id=None, cursor_urlsafe=None, set_classification_flags=False):
    if not counter_id:
        counter_id = generate_counter_id()
        counter_instance = Counter(id=counter_id)
        counters_data = {}
    else:
        counter_instance = Counter.get_by_id(counter_id)
        counters_data = counter_instance.data

    n = 50
    query = APIData.query()
    query = query.filter(APIData.archived == False)
    environment_key = ndb.Key('Environment', 'PUBLIC')
    query = query.filter(APIData.environment == environment_key)
    tag = create_indexed_tag('type', 'PROJECT')
    query = query.filter(APIData.indexed_data == tag)

    query = query.order(APIData._key)

    if cursor_urlsafe:
        curs = Cursor(urlsafe=cursor_urlsafe)
        projects, cursor, more = query.fetch_page(n, start_cursor=curs)
    else:
        projects, cursor, more = query.fetch_page(n)

    new_projects = []
    for project in projects:
        project_data = get_project_data(project)
        counters_data = increment_counts_with_province(counters_data, project_data)

        if set_classification_flags:
            if project_data['has_image']:
                project.indexed_data.append(create_indexed_tag('has_image', '1'))
                project.additional_data['has_image'] = '1'
            else:
                project.indexed_data.append(create_indexed_tag('has_image', '0'))
                project.additional_data['has_image'] = '0'

            if project_data['has_kml']:
                project.indexed_data.append(create_indexed_tag('has_kml', '1'))
                project.additional_data['has_kml'] = '1'
            else:
                project.indexed_data.append(create_indexed_tag('has_kml', '0'))
                project.additional_data['has_kml'] = '0'

            if project_data['has_classification']:
                project.indexed_data.append(create_indexed_tag('has_classification', '1'))
                project.additional_data['has_classification'] = '1'
            else:
                project.indexed_data.append(create_indexed_tag('has_classification', '0'))
                project.additional_data['has_classification'] = '0'

            project.indexed_data = uniquify(project.indexed_data)
            new_projects.append(project)

    counter_instance.data = counters_data

    if not cursor:
        counter_instance.done = True
    counter_instance.put()

    if set_classification_flags and new_projects:
        ndb.put_multi(new_projects)

    return {"counter_id": counter_id, "cursor": cursor.urlsafe() if cursor else None}


def generate_counter_id():
    return str(uuid.uuid4())


def increment_counts(counters, data):
    """
    Counter structure:
    {
        "PRDP (program)": {
            "2014 (year)":
                {
                    "budget": 123,
                    "count": 123,
                    "has_kml": 123,
                    "has_image": 123,
                    "has_classification": 123,
                    "has_eplc_id": 123,
                    "has_completion_data": 123
                }
        }
    }
    """

    # program
    if data['program'] not in counters:
        counters[data['program']] = {}

    # year
    if data['year'] not in counters[data['program']]:
        counters[data['program']][data['year']] = {}

    # has classification
    if 'has_classification' not in counters[data['program']][data['year']]:
        counters[data['program']][data['year']]['has_classification'] = 0

    counters[data['program']][data['year']]['has_classification'] += data['has_classification']

    # has kml
    if 'has_kml' not in counters[data['program']][data['year']]:
        counters[data['program']][data['year']]['has_kml'] = 0

    counters[data['program']][data['year']]['has_kml'] += data['has_kml']

    # has image
    if 'has_image' not in counters[data['program']][data['year']]:
        counters[data['program']][data['year']]['has_image'] = 0

    counters[data['program']][data['year']]['has_image'] += data['has_image']

    # has eplc_id
    if 'has_eplc_id' not in counters[data['program']][data['year']]:
        counters[data['program']][data['year']]['has_eplc_id'] = 0

    counters[data['program']][data['year']]['has_eplc_id'] += data['has_eplc_id']

    # has completion_data
    if 'has_completion_data' not in counters[data['program']][data['year']]:
        counters[data['program']][data['year']]['has_completion_data'] = 0

    counters[data['program']][data['year']]['has_completion_data'] += data['has_completion_data']

    # with eplc and has completion_data
    if 'has_eplc_and_completion_data' not in counters[data['program']][data['year']]:
        counters[data['program']][data['year']]['has_eplc_and_completion_data'] = 0

    if data['has_eplc_id'] and data['has_completion_data']:
        counters[data['program']][data['year']]['has_eplc_and_completion_data'] += 1

    # budget
    if 'budget' not in counters[data['program']][data['year']]:
        counters[data['program']][data['year']]['budget'] = 0

    counters[data['program']][data['year']]['budget'] += data['budget']

    # count
    if 'count' not in counters[data['program']][data['year']]:
        counters[data['program']][data['year']]['count'] = 0
    counters[data['program']][data['year']]['count'] += 1

    # count images
    if 'images' not in counters[data['program']][data['year']]:
        counters[data['program']][data['year']]['images'] = 0
    counters[data['program']][data['year']]['images'] += data['images']

    # count kmls
    if 'kmls' not in counters[data['program']][data['year']]:
        counters[data['program']][data['year']]['kmls'] = 0
    counters[data['program']][data['year']]['kmls'] += data['kmls']

    return counters


def increment_counts_with_province(counters, data):
    """
    Counter structure:
    {
        "PROVINCE": {
            "MUNICIPALITY": {
                "YEAR": {
                    "PROGRAM": {
                        "budget": 123,
                        "count": 123,
                        "has_kml": 123,
                        "has_image": 123,
                        "has_classification": 123,
                        "has_eplc_id": 123,
                        "has_completion_data": 123,
                        "is_coa": 1
                    }
                }
            }
        }
    }
    """

    if data['province'] not in counters:
        counters[data['province']] = {}

    if data['municipality'] not in counters[data['province']]:
        counters[data['province']][data['municipality']] = {}

    if data['year'] not in counters[data['province']][data['municipality']]:
        counters[data['province']][data['municipality']][data['year']] = {}

    if data['program'] not in counters[data['province']][data['municipality']][data['year']]:
        counters[data['province']][data['municipality']][data['year']][data['program']] = {}

    # has classification
    if 'has_classification' not in counters[data['province']][data['municipality']][data['year']][data['program']]:
        counters[data['province']][data['municipality']][data['year']][data['program']]['has_classification'] = 0

    counters[data['province']][data['municipality']][data['year']][data['program']]['has_classification'] += data['has_classification']

    # has kml
    if 'has_kml' not in counters[data['province']][data['municipality']][data['year']][data['program']]:
        counters[data['province']][data['municipality']][data['year']][data['program']]['has_kml'] = 0

    counters[data['province']][data['municipality']][data['year']][data['program']]['has_kml'] += data['has_kml']

    # has image
    if 'has_image' not in counters[data['province']][data['municipality']][data['year']][data['program']]:
        counters[data['province']][data['municipality']][data['year']][data['program']]['has_image'] = 0

    counters[data['province']][data['municipality']][data['year']][data['program']]['has_image'] += data['has_image']

    # has eplc_id
    if 'has_eplc_id' not in counters[data['province']][data['municipality']][data['year']][data['program']]:
        counters[data['province']][data['municipality']][data['year']][data['program']]['has_eplc_id'] = 0

    counters[data['province']][data['municipality']][data['year']][data['program']]['has_eplc_id'] += data['has_eplc_id']

    # has completion_data
    if 'has_completion_data' not in counters[data['province']][data['municipality']][data['year']][data['program']]:
        counters[data['province']][data['municipality']][data['year']][data['program']]['has_completion_data'] = 0

    counters[data['province']][data['municipality']][data['year']][data['program']]['has_completion_data'] += data['has_completion_data']

    # with eplc and has completion_data
    if 'has_eplc_and_completion_data' not in counters[data['province']][data['municipality']][data['year']][data['program']]:
        counters[data['province']][data['municipality']][data['year']][data['program']]['has_eplc_and_completion_data'] = 0

    if data['has_eplc_id'] and data['has_completion_data']:
        counters[data['province']][data['municipality']][data['year']][data['program']]['has_eplc_and_completion_data'] += 1

    # budget
    if 'budget' not in counters[data['province']][data['municipality']][data['year']][data['program']]:
        counters[data['province']][data['municipality']][data['year']][data['program']]['budget'] = 0

    counters[data['province']][data['municipality']][data['year']][data['program']]['budget'] += data['budget']

    # count
    if 'count' not in counters[data['province']][data['municipality']][data['year']][data['program']]:
        counters[data['province']][data['municipality']][data['year']][data['program']]['count'] = 0
    counters[data['province']][data['municipality']][data['year']][data['program']]['count'] += 1

    # count images
    if 'images' not in counters[data['province']][data['municipality']][data['year']][data['program']]:
        counters[data['province']][data['municipality']][data['year']][data['program']]['images'] = 0
    counters[data['province']][data['municipality']][data['year']][data['program']]['images'] += data['images']

    # count kmls
    if 'kmls' not in counters[data['province']][data['municipality']][data['year']][data['program']]:
        counters[data['province']][data['municipality']][data['year']][data['program']]['kmls'] = 0
    counters[data['province']][data['municipality']][data['year']][data['program']]['kmls'] += data['kmls']

    return counters


def get_project_data(project):
    data = {}

    project_object = project.to_api_object()

    data['has_classification'] = project_has_classification(project_object)
    data['has_kml'] = project_has_kml(project_object)
    data['has_image'] = project_has_image(project_object)
    data['has_eplc_id'] = project_has_eplc_id(project_object)
    data['has_completion_data'] = project_has_completion_data(project_object)

    data['year'] = get_year(project_object)
    data['program'] = project_object['program']
    data['budget'] = get_budget(project_object)

    data['province'] = get_province(project_object)
    data['municipality'] = get_municipality(project_object)

    data['is_coa'] = is_coa(project_object)

    if data['has_image']:
        data['images'] = project_count_images(project_object)
    else:
        data['images'] = 0

    if data['has_kml']:
        data['kmls'] = project_count_kml(project_object)
    else:
        data['kmls'] = 0

    return data


def get_budget(project_object):
    """
    TODO: get actual budget fields
    """

    try:
        return int(normalize_number(project_object['meta']['cost']) * 1000 * 100)
    except:
        pass

    try:
        return int(normalize_number(project_object['meta']['project_abc']) * 1000 * 100)
    except:
        pass

    try:
        return int(normalize_number(project_object['meta']['sp_cost___total']) * 100)
    except:
        pass

    try:
        return int(normalize_number(project_object['meta']['projects_gaa_budget']) * 100)
    except:
        pass

    return 0


def normalize_number(n):
    # turn into string
    n = str(n)

    # remove all commas
    n = n.replace(',', '')

    return float(n)


def get_year(project_object):
    """
    TODO: get actual year fields
    """

    try:
        if project_object['program'] == 'GAA':
            if 'control_number' in project_object['meta']:
                return '2015'
            else:
                return '2014'
    except:
        pass

    try:
        return project_object['meta']['budget_year']
    except:
        pass

    try:
        return project_object['meta']['projects_gaa_year']
    except:
        pass

    try:
        return project_object['meta']['year_of_fuc254']
    except:
        pass

    try:
        # for end of project code "XXXX-XXXX-2015"
        year = project_object['code'][-4:]

        if year not in [
        '2005',
        '2006',
        '2007',
        '2008',
        '2009',
        '2010',
        '2011',
        '2012',
        '2013',
        '2014',
        '2015',
        '2016',
        '2017',
        '2018',
        '2019']:
            if '10' in year:
                year = '2010'
            if '11' in year:
                year = '2011'
            if '12' in year:
                year = '2012'
            if '13' in year:
                year = '2013'
            if '14' in year:
                year = '2014'
            if '15' in year:
                year = '2015'
            if '16' in year:
                year = '2016'
            if '17' in year:
                year = '2017'
            if '18' in year:
                year = '2018'
            if '19' in year:
                year = '2019'
        return year
    except:
        pass

    return 'Unknown'


def project_has_classification(project_object):
    query = APIData.query()
    query = query.filter(APIData.archived == False)
    environment_key = ndb.Key('Environment', 'PUBLIC')
    query = query.filter(APIData.environment == environment_key)

    tag = create_indexed_tag('type', 'CLASSIFICATION')
    query = query.filter(APIData.indexed_data == tag)

    tag = create_indexed_tag('project_code', project_object['code'])
    query = query.filter(APIData.indexed_data == tag)

    classification = query.get(keys_only=True)

    if classification:
        return 1
    else:
        return 0


def project_has_kml(project_object):
    query = APIData.query()
    query = query.filter(APIData.archived == False)
    environment_key = ndb.Key('Environment', 'PUBLIC')
    query = query.filter(APIData.environment == environment_key)

    tag = create_indexed_tag('type', 'KML')
    query = query.filter(APIData.indexed_data == tag)

    tag = create_indexed_tag('project_code', project_object['code'])
    query = query.filter(APIData.indexed_data == tag)

    kml = query.get(keys_only=True)

    if kml:
        return 1
    else:
        return 0


def project_count_kml(project_object):
    query = APIData.query()
    query = query.filter(APIData.archived == False)
    environment_key = ndb.Key('Environment', 'PUBLIC')
    query = query.filter(APIData.environment == environment_key)

    tag = create_indexed_tag('type', 'KML')
    query = query.filter(APIData.indexed_data == tag)

    tag = create_indexed_tag('project_code', project_object['code'])
    query = query.filter(APIData.indexed_data == tag)

    kml_count = 0

    more = True
    cursor = None
    while more:
        if not cursor:
            kmls, cursor, more = query.fetch_page(200, keys_only=True)
        else:
            kmls, cursor, more = query.fetch_page(200, start_cursor=cursor, keys_only=True)
        kml_count += len(kmls)

    return kml_count


def project_has_image(project_object):
    query = APIData.query()
    query = query.filter(APIData.archived == False)
    environment_key = ndb.Key('Environment', 'PUBLIC')
    query = query.filter(APIData.environment == environment_key)

    tag = create_indexed_tag('type', 'IMAGE')
    query = query.filter(APIData.indexed_data == tag)

    tag = create_indexed_tag('project_code', project_object['code'])
    query = query.filter(APIData.indexed_data == tag)

    image = query.get(keys_only=True)

    if image:
        return 1
    else:
        return 0


def project_count_images(project_object):
    query = APIData.query()
    query = query.filter(APIData.archived == False)
    environment_key = ndb.Key('Environment', 'PUBLIC')
    query = query.filter(APIData.environment == environment_key)

    tag = create_indexed_tag('type', 'IMAGE')
    query = query.filter(APIData.indexed_data == tag)

    tag = create_indexed_tag('project_code', project_object['code'])
    query = query.filter(APIData.indexed_data == tag)

    image_count = 0

    more = True
    cursor = None
    while more:
        if not cursor:
            images, cursor, more = query.fetch_page(200, keys_only=True)
        else:
            images, cursor, more = query.fetch_page(200, start_cursor=cursor, keys_only=True)
        image_count += len(images)

    return image_count


def project_has_eplc_id(project_object):
    """
    TODO: Double check what the fields are
    """

    try:
        if project_object['project_id']:
            return 1
        else:
            return 0
    except:
        pass
    return 0


def project_has_completion_data(project_object):
    """
    TODO: Double check what the fields are
    """

    try:
        if project_object['completion']:
            return 1
        else:
            return 0
    except KeyError:
        pass

    try:
        fin_progress = int(normalize_number(project_object['fin_progress']))
        if fin_progress:
            return 1
    except:
        pass

    return 0


def get_province(project_object):
    """
    Return province of project in lowercase
    """
    try:
        return project_object['province'].lower().strip()
    except:
        return 'unknown'



def get_municipality(project_object):
    """
    Return municipality of project in lowercase
    """
    try:
        return project_object['municipality'].lower().strip()
    except:
        return 'unknown'


def is_coa(project_object):
    """
    Return 1 if coa
    """
    try:
        if project_object['coa']:
            return 1
        else:
            return 0
    except:
        pass

    return 0









