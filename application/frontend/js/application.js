/*
# Data Management

Single projects database
Store this database locally
Create function for creating or updating a project from server
Query only changes from server. When querying from server, query only latest changes in the projects list based on modified date ascending. starting from a certain timestamp. Save the last timestamp used locally.


For multiple project selction, use a boolean flag "selected" in the local database.
For searching/filtering data, use a boolean flag "visible" in the local database.
When rendering map, only render selected projects in the map.
When rendering sidebar, only render "visible" projects in the sidebar.

Always replace html entirely when rendering.

Cache URL's for KML's and images.


*/



/**********************
 * Templates
 **********************/

 function li(arr){
    var str = ''
    _.each(arr, function(i){
        str += '<li><label><input type="checkbox" value="' + data[i].code + '"> ' + data[i].title + '</label></li>';
    });
    return str;
 }


/* Project Template. Supports nesting. */
/* removed:  <% if(!project_kml) { %><i title="No KML Found" class="fa fa-warning"></i><% } %> */
var PROJECT_TEMPLATE = '<div class="clearfix block proj-item<% if(selected) { %> active<% } %>" data-index="<%= index %>" data-code="<%= project_code %>" data-program="<%= project_program %>">' +
      '<span class="program_indicator"><%= project_program %></span> <span class="proj-code">| <%= project_code %></span>' +
      // '<span class="pull-right"><span class="upload-stat has-images">has images</span><span class="upload-stat has-kml">has kml track</span></span>'+
      // '<span class="clearfix"></span>' +
      '<h4><%= project_name %></h4>' +
      '<div class="clear"></div>' +
      '<div class="clearfix proj-stat-type">' +
      // '<span class="left proj-status"><%= project_status %></span>' +
      // '<span class="right proj-type"><%= project_type %></span>' +
      '<span style="display: none;" class="proj-location"><%= project_location %></span>' +
      '<span style="display: none;" class="proj-desc"><%= project_description %></span>' +
      // '<div class="project-checkbox"><input class="sidebar_project_checkbox" data-code="<%= project_code %>" data-index="<%= index %>" type="checkbox" <% if(selected) { %>checked="checked"<% } %> /></div>' +
      '</div>' +
      '<div class="proj-dataset-subproject">' +
      '<% if(datasets) { %>' +
      '<div class="proj-dataset">' +
      '<b>Datasets</b>' +
      '<ul class="list-unstyled"><% _.each(datasets, function(dataset){ %> <li><label><input type="checkbox" <% if(dataset.selected) { %>checked="checked"<% } %> value="<%= dataset.code %>"><%= dataset.title %></label></li> <% }) %></ul>' +
      '</div>' +
      '<% } %>' +
      '<% if(subprojects) { %>' +
      '<div class="proj-subproject">' +
      '<b>Subprojects</b>' +
      // '<ul class="list-unstyled"><% _.each(subprojects, function(subproject){ %> <li><label><input type="checkbox" <% if(subproject.selected) { %>checked="checked"<% } %> value="<%= subproject.code %>"><%= subproject.title %></label>' +
      '<ul class="list-unstyled"><% _.each(subprojects, function(subproject){ %> <li><div class="subproject-title"><%= subproject.title %></div>' +
      '<% if(subproject.datasets) { %>' +
      '<div class="subproj-dataset">' +
      // '<b>Datasets</b>' +
      '<ul class="list-unstyled"><% _.each(subproject.datasets, function(dataset){ %> <li><label><input type="checkbox" <% if(dataset.selected) { %>checked="checked"<% } %> value="<%= dataset.code %>"><%= dataset.title %></label></li> <% }) %></ul>' +
      '</div>' +
      '<% } %>' +
      '</li> <% }) %></ul>' +
      '</div>' +
      '<% } %>' +
      '<div class="underline">&nbsp;</div>' +
      '<% if(has_image) { %><i class="fa fa-picture-o has-images" title="Has Images"></i> <% } %><% if(has_kml) { %><i class="fa fa-globe has-kml" title="Has KML Track"></i> <% } %><a target="_blank" href="/projects/<%= program_url %>/<%= project_code %>" class="list-link pull-left">Upload Geotagged Data</a>' +
      '<a href="#" class="list-link pull-right add-to-selection" data-code="<%= project_code %>"><%= selection_action %> Selection</a>' +
      '</div>' +
      '</div>';


/* Dataset Template. Supports Multiple KMLs, Protocol Images, & Other Geotagged Images. */
var DATASET_TEMPLATE = '<div><select><% project_dataset %></select></div>';




/**********************
 * Local Database Objects
 **********************/

window.projects_database = {};
window.datasets_database = {};
window.visible_projects = [];
window.current_images = {};
window.visibleMarkers = [];
window.is_image_viewer_displayed = false;
window.current_image_index = 0;
window.user_environments = [];
window.put_at_top = null;
window.special_images_are_displayed = false;
window.images_are_displayed = true;
window.current_special_image_viewer_dataset = '';
window.current_special_image_index = 0;
window.current_dates_selected = [];
window.kalman_filter = false;
window.show_original_track = false;
window.current_kml_length = 0;
window.start_kml_length = false;


window.images_database = {};

// BASE_URL = 'https://coageostore.appspot.com';

window.current_images_array = [];


String.prototype.title = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}



/**********************
 * Functions
 **********************/


/**
 * Gets new projects from remote server. Updates local db for retrieved projects.
 * @param {int} fromLastTimestamp - The timestamp to start checking from.
 */
function getNewProjects(fromLastTimestamp){
    // get by json all projects. push them to the projects_database with the project codes as keys
    console.log("Getting new projects from timestamp", fromLastTimestamp);

    if(fromLastTimestamp){
        var api = BASE_URL + '/api/v1/data?type=PROJECT&order=asc&n=100&start_updated_from=' + fromLastTimestamp + '&callback=?';
    }
    else {
        var api = BASE_URL + '/api/v1/data?type=PROJECT&order=asc&n=100&callback=?';
    }

    $.getJSON(api, function(data) {
        var next = data.cursor;
        var data = data.data;
        if(data){
            for(var i=0; i<data.length; i++){
                createOrUpdateProject(data[i]);
            }
            renderProjectsInSidebar();
        }
        if(next) {
            getNewProjects(data[data.length-1].updated_timestamp_utc);
        }
        else {
            console.log("DONE LOADING ALL PROJECTS");
        }
        saveProjectsToLocalStorage();
    });
}


/**
 * Gets new projects from remote server. Updates local db for retrieved projects.
 * @param {int} fromLastTimestamp - The timestamp to start checking from.
 */
function getNewProjectsFromMostRecent(){
    // get by json all projects. push them to the projects_database with the project codes as keys

    var api = BASE_URL + '/api/v1/data?type=PROJECT&order=desc&n=100&callback=?';

    $.getJSON(api, function(data) {
        var next = data.cursor;
        var data = data.data;
        if(data){
            for(var i=0; i<data.length; i++){
                createOrUpdateProject(data[i]);
            }
            renderProjectsInSidebar();
        }
        saveProjectsToLocalStorage();
    });
}


/**
 * Create or updates a project. This also puts the project under the correct project if it's a subproject.
 * @param {object} project - The project to create or update in db.
 */
function createOrUpdateProject(project){
    // TODO: Add checks.
    if(project.code in window.projects_database){
        project.selected = window.projects_database[project.code].selected;
        project.visible = window.projects_database[project.code].visible;
        if(window.projects_database[project.code].datasets){
            project.datasets = window.projects_database[project.code].datasets;
        }
    }

    window.projects_database[project.code] = project;

    if (window.projects_database[project.code].selected === undefined){
        window.projects_database[project.code].selected = false;
    }

    if (window.projects_database[project.code].visible === undefined){
        window.projects_database[project.code].visible = true;
    }

    if (project.type == 'SUBPROJECT'){
        if (!('subprojects' in window.projects_database[project.parent_code])){
            window.projects_database[project.parent_code].subprojects = {};
        }
        window.projects_database[project.parent_code].subprojects[project.code] = project;
    }

    generateFreeSearchText(window.projects_database[project.code]);

    return window.projects_database[project.code];
}

/**
 * Generate Free Search Text
 * @param {object} project - The project to generate free search text for.
 */
function generateFreeSearchText(project){
    project.free_search = project.code.toLowerCase() + ' ';
    try {
        project.free_search += project.title.toLowerCase() + ' ';
    }
    catch(e){
        // do nothing
    }

    try {
        project.free_search += project.status.toLowerCase() + ' ';
    }
    catch(e){
        // do nothing
    }

    try {
        project.free_search += project.municipality.toLowerCase() + ' ';
    }
    catch(e){
        // do nothing
    }

    try {
        project.free_search += project.province.toLowerCase() + ' ';
    }
    catch(e){
        // do nothing
    }

    try {
        project.free_search += project.description.toLowerCase() + ' ';
    }
    catch(e){
        // do nothing
    }

    try {
        project.free_search += project.program.toLowerCase() + ' ';
    }
    catch(e){
        // do nothing
    }

    try {
        project.free_search += project.agency.toLowerCase() + ' ';
    }
    catch(e){
        // do nothing
    }
}


/**
 * Get Datasets for a Project from remote server.
 * @param {string} url - The URL of the project to be fetched from the server as dataset.
 * @param {string} cursor - The cursor to be appended into the URL if there is another set of data to be fetched.
 */
function getProjectDatasets(project, cursor){
    var url = BASE_URL + '/api/v1/data?callback=?&parent_code=' + project.code + '&type=DATASET';
    if(cursor) {
        url += '&cursor=' + cursor;
    }
    console.log('url', url);
    $.getJSON(url, function(data) {
        var next = data.cursor;
        var data = data.data;
        if(data) {
            for(var i = 0; i < data.length; i++) {
                createOrUpdateDataset(data[i]);
            }
        }
        if(next) {
            getProjectDatasets(project, next);
        }
        else {
            // select all datasets
            selectAllProjectDatasets(project);
        }
        refreshViews();
    });
}


function selectAllProjectDatasets(project){
    if('datasets' in window.projects_database[project.code]){
        for(var key in window.projects_database[project.code].datasets){
            if(window.projects_database[project.code].datasets.hasOwnProperty(key)){
                window.projects_database[project.code].datasets[key].selected = true;
            }
        }
    }
    refreshViews();
}

function deselectAllProjectDatasets(project){
    if('datasets' in window.projects_database[project.code]){
        for(var key in window.projects_database[project.code].datasets){
            if(window.projects_database[project.code].datasets.hasOwnProperty(key)){
                window.projects_database[project.code].datasets[key].selected = false;
            }
        }
    }

    if('subprojects' in window.projects_database[project.code]){
        for(var key in window.projects_database[project.code].subprojects){
            if(window.projects_database[project.code].subprojects.hasOwnProperty(key)){
                deselectAllProjectDatasets(window.projects_database[project.code].subprojects[key]);
            }
        }
    }

    refreshViews();
}


/**
 * Get Environments of the current logged in user.
 */
function getEnvironments(cursor){
    var url = '/api/v1/environments';
    if(cursor) {
        url += '?cursor=' + cursor;
    }
    $.getJSON(url, function(data) {
        var next = data.cursor;
        var data = data.data;
        if(data) {
            for(var i=0; i<data.length; i++){
                window.user_environments.push(data[i]);
            }
        }
        if(next) {
            getEnvironments(next);
        }
        else {
            loadPrivateDatasets();
        }
    });
}



/**
 * Iterate over user environments and load all private datasets
 */
function loadPrivateDatasets(){
    for(var i=0; i<window.user_environments.length; i++){
        var key = window.user_environments[i].key;
        loadDatasetByEnvironment(key);
    }
}


function loadDatasetByEnvironment(key, cursor){
    var url = '/api/v1/data?type=DATASET&environment=' + key;
    if(cursor) {
        url += '?cursor=' + cursor;
    }
    $.getJSON(url, function(data) {
        var next = data.cursor;
        var data = data.data;
        if(data) {
            for(var i=0; i<data.length; i++){
                createOrUpdateDataset(data[i]);
            }
        }
        if(next) {
            loadDatasetByEnvironment(key, next);
        }
    });
}



function getSubprojects(project, cursor) {
    var url = BASE_URL + '/api/v1/data?type=SUBPROJECT&parent_code=' + project.code + '&callback=?';
    $.getJSON(url, function(data) {
        var next = data.cursor;
        var data = data.data;
        if(data) {
            for(var i=0; i<data.length; i++){
                createOrUpdateProject(data[i]);
                getProjectDatasets(data[i]);
            }
        }
        if(next) {
            getSubprojects(project, next);
        }
    });
}

/*function getSubprojectDatasets(url, cursor) {
    var modified_url = url.replace('&code=', '&parent_code=').replace('&type=PROJECT', '&type=DATASET');
    if(cursor) {
        modified_url += '&cursor=' + cursor;
    }
    $('#select-dataset').empty();
    console.log('getProjectDatasets', modified_url);
    $.getJSON(modified_url, function(data) {
        var next = data.cursor;
        var data = data.data;
        var li = '';
        if(data) {
            if(!('datasets' in window.projects_database[data[0].parent_code])) {
                window.projects_database[data[0].parent_code].datasets = {}
            }
            for(var i = 0; i < data.length; i++) {
                window.projects_database[data[0].parent_code].datasets[data[i].code] = data[i];
                li += '<li><label><input type="checkbox" value="' + data[i].code + '"> ' + data[i].title + '</label></li>';
            }
            $('div[data-code="' + data[0].parent_code + '"] .proj-dataset ul').append(li);
            $('div[data-code="' + data[0].parent_code + '"] .proj-dataset ul').parents('.proj-dataset-subproject').removeClass('none');
            $('div[data-code="' + data[0].parent_code + '"] .proj-dataset ul').find('input[type="checkbox"]')[0].click();
        }
        if(next) {
            getProjectDatasets(url, next);
        }
    });
}*/


function loadProjectDataset(dataset_code) {
    console.log('loadProjectDataset', dataset_code);
    if(!('images' in window.datasets_database[dataset_code])) {
        getDatasetImages(dataset_code);
    }
    if(!('kml' in window.datasets_database[dataset_code])) {
        getDatasetKMLs(dataset_code);
    }
    if(!('files' in window.datasets_database[dataset_code])) {
        getDatasetFiles(dataset_code);
    }
}


/**
 * Create or updates a dataset under a Project
 * @param {object} dataset - The dataset to create or update in db.
 */
function createOrUpdateDataset(dataset){
    if(!('datasets' in window.projects_database[dataset.parent_code])) {
        window.projects_database[dataset.parent_code].datasets = {}
    }

    if(window.projects_database[dataset.parent_code].datasets[dataset.code]){
        // don't update
        console.log('Dataset Exists. Not updating', dataset.code);
        return
    }

    window.projects_database[dataset.parent_code].datasets[dataset.code] = dataset;
    window.datasets_database[dataset.code] = dataset;

    loadProjectDataset(dataset.code);

}


/**
 * Loads Projects from the local storage into the live local db.
 */
function loadProjectsFromLocalStorage(){
    // Retrieve the object from storage
    var pd = localStorage.getItem('projects_database')
    if(pd){
        window.projects_database = JSON.parse(pd);
        console.log("Loaded " + Object.keys(window.projects_database).length + " projects from local storage");
    }
    else {
        console.log("No projects saved in local storage");
    }

    for(var key in window.projects_database){
        generateFreeSearchText(window.projects_database[key]);
    }
    putLocationsinFilter()
}

function putLocationsinFilter() {
    var LOCATIONS = [];
    for(key in projects_database) {
        if(projects_database[key].municipality) {
            if(LOCATIONS.indexOf(projects_database[key].municipality.toUpperCase()) == -1) {
                LOCATIONS.push(projects_database[key].municipality.toUpperCase());
            }
        }
    }
    for(var i = 0; i < LOCATIONS.length; i++) {
        $('.chosen-location').append('<option value="' + LOCATIONS[i].toLowerCase() + '">' + LOCATIONS[i] + '</option>');
    }
    $('.chosen-location').trigger("chosen:updated");
}


/**
 * Saves Projects from the live local db to local storage.
 */
function saveProjectsToLocalStorage(){
    var projectsCommonFieldsDatabase = {}
    for(var key in window.projects_database) {
        var project = {}
        project.status = window.projects_database[key].status;
        project.program = window.projects_database[key].program;
        project.updated_timestamp_utc = window.projects_database[key].updated_timestamp_utc;
        project.code = window.projects_database[key].code;
        project.province = window.projects_database[key].province;
        project.title = window.projects_database[key].title;
        project.data_is_imported = window.projects_database[key].data_is_imported;
        project.agency = window.projects_database[key].agency;
        project.municipality = window.projects_database[key].municipality;
        project.project_type = window.projects_database[key].agencyproject_type
        project.agencytype = window.projects_database[key].agencytype
        project.type = window.projects_database[key].type
        project.id = window.projects_database[key].id;
        project.has_image = window.projects_database[key].has_image;
        project.has_kml = window.projects_database[key].has_kml;
        projectsCommonFieldsDatabase[key] = project;
    }

    localStorage.setItem('projects_database', JSON.stringify(projectsCommonFieldsDatabase));
    console.log("Saved " + Object.keys(window.projects_database).length + " projects to local storage");
}


/**
 * getNewestProject. Helper function. Returns the newest project from the live local database.
 */
function getNewestProject(){
    var newestProject = null;
    for (var key in window.projects_database) {
        if (window.projects_database.hasOwnProperty(key)) {
            if (!newestProject){
                newestProject = window.projects_database[key];
            }

            if (window.projects_database[key].updated_timestamp_utc > newestProject.updated_timestamp_utc){
                newestProject = window.projects_database[key];
            }
        }
    }
    return newestProject;
}

/**
 * Refresh and calls upon all the render components of the Geostore viewer.
 */
function refreshViews(){
    renderViewer();
}


/**
 * Render the entire viewer.
 */
function renderViewer(){
    renderProjectsInSidebar();
    renderMap();
    // renderImageViewer();
    renderProjectDetails();
}


window.projects_end_index = 100;
/**
 * Render the visible projects in the sidebar.
 */
function renderProjectsInSidebar(increment){
    var end_index = window.projects_end_index;
    if(increment){
        end_index += 100;
    }

    applyVisibilityFilters();

    var projects = getVisibleProjects();

    // sort selected projects first
    // projects.sort(function(a, b){
    //     if(a.selected && !b.selected){
    //         return -1;
    //     }
    //     if(!a.selected && b.selected){
    //         return 1;
    //     }
    //     return 0;
    // });

    // sort put at top
    if(window.put_at_top){
        projects = projects.filter(function(obj) {
           return obj.code != window.put_at_top;
        });
        projects.unshift(window.projects_database[window.put_at_top]);
    }


    var tpl = _.template(PROJECT_TEMPLATE);
    var projects_length = projects.length;

    if (projects_length < end_index){
        end_index = projects_length;
    }
    else {
        window.projects_end_index = end_index;
    }

    var html = "";
    for(var i=0;  i < end_index; i++){
        projectTemplateValues = setProjectTemplateValues(projects[i]);
        projectTemplateValues.index = i;
        html += tpl(projectTemplateValues);
    }

    replaceHtml("sidebar_list_wrapper", html);

    resizeProjectsList();
}

/**
 * Set the current project's variables to be rendered by the default project template
 * @param {string} project - The object to contain the project's details.
 */
function setProjectTemplateValues(project) {
    data = {}
    data['project_code'] = project.code;
    data['project_name'] = project.title;
    data['project_status'] = project.status;
    data['project_location'] = project.municipality + ((project.province && project.municipality) ? ', ' : '' ) + project.province
    data['project_type'] = project.project_type;
    data['project_description'] = project.description ? project.description : '';
    data['project_program'] = project.program;
    data['datasets'] = project.datasets;
    data['subprojects'] = project.subprojects;
    data['project_kml'] = false;
    data['selected'] = project.selected;

    data['has_kml'] = project.has_kml == '1' ? true : false;
    data['has_image'] = project.has_image == '1' ? true : false;

    if(project.selected){
        data['selection_action'] = '- Remove from';
    }
    else {
        data['selection_action'] = '+ Add to';
    }

    data['program_url'] = false;

    if(project.program == 'PRDP'){
        data['program_url'] = 'da';
    }
    if(project.program == 'BUB'){
        data['program_url'] = 'bub';
    }
    if(project.program == 'TRIP'){
        data['program_url'] = 'trip';
    }
    if(project.program == 'LOCAL'){
        data['program_url'] = 'local';
    }
    if(project.program == 'GAA'){
        data['program_url'] = 'gaa';
    }

    return data;
}

/**
 * Return a list of visible projects
 */
function getVisibleProjects(){
    return window.visible_projects;
}


/**
 * Return the selected projects.
 */
function getSelectedProjects(){
    var selectedProjects = [];
    for (var key in window.projects_database) {
        if (window.projects_database.hasOwnProperty(key)) {
            if(window.projects_database[key].type == 'PROJECT' && window.projects_database[key].selected){
                selectedProjects.push(window.projects_database[key]);
            }
        }
    }
    return selectedProjects;
}


function getSelectedDatasetsFromSelectedProjects() {
    var selectedProjects = getSelectedProjects();
    var selectedDatasets = {};
    for(var i = 0; i < selectedProjects.length; i++) {
        if(window.projects_database.hasOwnProperty(selectedProjects[i].code)) {
            if(window.projects_database[selectedProjects[i].code].selected) {
                for(var y in window.projects_database[selectedProjects[i].code].datasets) {
                    if(window.projects_database[selectedProjects[i].code].datasets[y].selected) {
                        if(!(selectedProjects[i].code in selectedDatasets)) {
                            selectedDatasets[selectedProjects[i].code] = {};
                        }
                        selectedDatasets[selectedProjects[i].code][y] = window.projects_database[selectedProjects[i].code].datasets[y];
                    }
                }
            }
        }
    }
    return selectedDatasets;
}


function getSelectedDatasets() {
    var selectedDatasets = [];
    for(var key in window.datasets_database){
        if(window.datasets_database.hasOwnProperty(key)){
            if(window.datasets_database[key].selected){
                selectedDatasets.push(window.datasets_database[key]);
            }
        }
    }
    return selectedDatasets;
}


function getNotSelectedDatasets(){
    var notSelectedDatasets = [];
    for(var key in window.datasets_database){
        if(window.datasets_database.hasOwnProperty(key)){
            if(!window.datasets_database[key].selected){
                notSelectedDatasets.push(window.datasets_database[key]);
            }
        }
    }
    return notSelectedDatasets;
}


/**
 * Return the selected project. If multiple, return nothing.
 */
function getSelectedProject(){
    var selectedProjects = getSelectedProjects();
    if(selectedProjects.length == 1){
        return selectedProjects[0];
    }
    else {
        return selectedProjects[0];
    }
    return null;
}


/**
 * Load the selected project's details from the project list.
 * @param {string} program - The object to contain the project's details.
 * @param {string} code - The object to contain the project's details.
 */
function loadProject(project_code) {
    console.log('loadProject');
    var project = window.projects_database[project_code];
    if(project){
        getPhilGEPS(project_code);
        var program = project.program;
        var code = project.code;

        var url = BASE_URL + '/api/v1/data?callback=?&code=' + code + '&type=PROJECT';
        $.getJSON(url, function(data) {
            data = data.data[0];
            if(data) {
                // data.loaded = true;
                createOrUpdateProject(data);
                getProjectDatasets(data);
                getSubprojects(data);
                refreshViews();
            }
        });
    }
}


function getLatLngFromString(str) {
    var latlng = {}
    latlngalt_array = str.split(',');
    try {
        if(parseFloat(latlngalt_array[1]) > 90) {
            latlng['lat'] = parseFloat(latlngalt_array[0]);
            latlng['lng'] = parseFloat(latlngalt_array[1]);
        }
        else {
            latlng['lat'] = parseFloat(latlngalt_array[1]);
            latlng['lng'] = parseFloat(latlngalt_array[0]);
        }
    }
    catch(e){
        console.log(e);
    }
    return latlng;
}



/**
 * Load KML data.
 */
function getKML(dataset_code, kml) {
    console.log('getKML', kml.kml.file_url);
    if(!window.datasets_database[dataset_code].rendered_kmls){
        window.datasets_database[dataset_code].rendered_kmls = {};
    }
    // if(kml.kml.file_url.endsWith('.kmz')) {
    //     $.post('/viewer?url=' + encodeURIComponent(kml.kml.file_url), function(data) {
    //         window.datasets_database[dataset_code].rendered_kmls[kml.kml.file_url] = renderKML(kml, data);
    //         renderMap();
    //     }, 'xml');
    // }
    // else {
    //     $.get(kml.kml.file_url, function(data) {
    //         window.datasets_database[dataset_code].rendered_kmls[kml.kml.file_url] = renderKML(kml, data);
    //         renderMap();
    //     }, 'xml');
    // }

    if(kml.kml.file_url) {
        $.post('/viewer?url=' + encodeURIComponent(kml.kml.file_url), function(data) {
            window.datasets_database[dataset_code].rendered_kmls[kml.kml.file_url] = renderKML(kml, data);
            renderMap();
        }, 'xml');
    }
}

function convertLatLng(obj) {
    return new google.maps.LatLng(obj.lat, obj.lng);
}


/**
 * Render a KML into the map.
 * Return an array of marker objects.
 */
function renderKML(kml, xml){
    var mapObjects = [];
    var LineString = $(xml).find('LineString');
    var MultiTrack = $(xml).filterNode('gx:MultiTrack');
    var strokeColor = '#FF0000';

    var bounds = [];

    if(LineString.length) {
        // console.log('LINESTRING FOUND');
        for(var i = 0; i < LineString.length; i++) {
            var flightPlanCoordinates = [];
            try{
                var name = $(LineString[i]).siblings('name')[0].innerHTML;
            }
            catch(e){
                var name = 'No Name'
                console.log(e);
            }

            // console.log('linestring', $(LineString[i]).find('coordinates').text());
            var coordinates = $(LineString[i]).find('coordinates').text().trim().split(' ');
            var c = [];
            temporary_kml_length = 0;
            for(var j = 0; j < coordinates.length; j++) {
                var latlng = getLatLngFromString(coordinates[j]);
                c.push(latlng['lat'] + ',' + latlng['lng']);
                flightPlanCoordinates.push(latlng);
                if(j > 0) {
                    var prev_latlng = getLatLngFromString(coordinates[j - 1]);
                    temporary_kml_length += getDistance(convertLatLng(prev_latlng), convertLatLng(latlng));
                }
                else {
                    window.start_kml_length = convertLatLng(latlng);
                }
                window.current_kml_length = temporary_kml_length;
                if(j == 0 || j == coordinates.length - 1) {
                    var icon = 'start-marker.png';
                    if(j != 0) {
                        icon = 'end-marker.png'
                    }
                    var l = new google.maps.LatLng(latlng.lat, latlng.lng);
                    var marker = new google.maps.Marker({
                        position: l,
                        icon: '/images/' + icon,
                        anchor: new google.maps.Point(17, 30)
                    });
                    mapObjects.push(marker);
                }
            }
            if(window.kalman_filter) {
                flightPlanCoordinates_ = flightPlanCoordinates;
                flightPlanCoordinates = setKalmanFilter(0.5, 0.005, 0.005, c);
                console.log('KALMAN FILTER ACTIVE');
            }

            switch(kml.program) {
                case 'GAA':
                    strokeColor = '#17A41A';
                    break;
                case 'PRDP':
                    strokeColor = '#127EB7';
                    break;
                case 'PRDP':
                    strokeColor = '#EDAB3A';
                    break;
            }

            var name_of_road = '';
            var description_of_road = '';
            try{
              name_of_road = $(LineString[i]).find('name').text().toLowerCase().trim();
            }
            catch(e){
              console.log(e);
            }
            try{
              description_of_road = $(LineString[i]).find('description').text().toLowerCase().trim();
            }
            catch(e){
              console.log(e);
            }

            if(name_of_road.indexOf('municipal') != -1 || name_of_road.indexOf('mun.') != -1 || name_of_road.indexOf('hall') != -1 || name_of_road.indexOf('access road') != -1 || description_of_road.indexOf('municipal') != -1 || description_of_road.indexOf('mun.') != -1 || description_of_road.indexOf('hall') != -1 || description_of_road.indexOf('access road') != -1){
                strokeColor = '#F26763';
            }

            var flightPath = new google.maps.Polyline({
                path: flightPlanCoordinates,
                geodesic: true,
                strokeColor: strokeColor,
                strokeOpacity: 1.0,
                strokeWeight: 4,
                name: name,
            });
            google.maps.event.addListener(flightPath, 'click', function() {
                console.log(this.name);
            });

            for(var j = 0; j < flightPlanCoordinates.length; j++) {
                /*console.log('lat', flightPlanCoordinates[i]['lat']);
                console.log('lng', flightPlanCoordinates[i]['lng']);*/
                var latlng = new google.maps.LatLng(flightPlanCoordinates[j]['lat'], flightPlanCoordinates[j]['lng']);
                bounds.push(latlng);
            }
            if(window.show_original_track) {
                var flightPath_ = new google.maps.Polyline({
                    path: flightPlanCoordinates_,
                    geodesic: true,
                    strokeColor: '#00F',
                    strokeOpacity: 1.0,
                    strokeWeight: 4,
                    name: name,
                });
                google.maps.event.addListener(flightPath_, 'click', function() {
                    console.log(this.name);
                });

                for(var j = 0; j < flightPlanCoordinates_.length; j++) {
                    var latlng = new google.maps.LatLng(flightPlanCoordinates_[j]['lat'], flightPlanCoordinates_[j]['lng']);
                    bounds.push(latlng);
                }
                mapObjects.push(flightPath_);
            }
            mapObjects.push(flightPath);
        }
    }
    if(MultiTrack.length) {
        // console.log('MULTITRACK FOUND');
        for(var i = 0; i < MultiTrack.length; i++) {
            var flightPlanCoordinates = [];
            try {
                var name = $(MultiTrack[i]).siblings('name')[0].innerHTML;
            }
            catch(e){
                var name = 'No Name'
                console.log(e);
            }
            var coordinates = $(MultiTrack[i]).filterNode('gx:coord');

            var c = [];
            // console.log('gx:coord', $(MultiTrack[i]).filterNode('gx:coord'));
            temporary_kml_length = 0;
            for(var j = 0; j < coordinates.length; j++) {
                var latlngalt = coordinates[j].innerHTML.trim().split(' ');
                c.push(latlngalt[1] + ',' + latlngalt[0]);


                var latlng = getLatLngFromString(latlngalt[0] + ',' + latlngalt[1]); // specify lat,lng properly. TODO
                flightPlanCoordinates.push(latlng);
                if(j > 0) {
                    var prev_raw_latlng = coordinates[j - 1].innerHTML.trim().split(' ');
                    var prev_latlng = getLatLngFromString(prev_raw_latlng[0] + ',' + prev_raw_latlng[1]);
                    temporary_kml_length += getDistance(convertLatLng(prev_latlng), convertLatLng(latlng));
                }
                else {
                    window.start_kml_length = convertLatLng(latlng);
                }
                window.current_kml_length = temporary_kml_length;
                if(j == 0 || j == coordinates.length - 1) {
                    var icon = 'start-marker.png';
                    if(j != 0) {
                        icon = 'end-marker.png'
                    }
                    var l = new google.maps.LatLng(latlng.lat, latlng.lng);
                    var marker = new google.maps.Marker({
                        position: l,
                        icon: '/images/' + icon,
                        anchor: new google.maps.Point(17, 30)
                    });
                    mapObjects.push(marker);
                }
            }

            if(window.kalman_filter) {
                flightPlanCoordinates_ = flightPlanCoordinates;
                flightPlanCoordinates = setKalmanFilter(0.5, 0.005, 0.005, c);
                console.log('KALMAN FILTER ACTIVE');
            }

            console.log(kml.program);


            switch(kml.program) {
                case 'GAA':
                    strokeColor = '#17A41A';
                    break;
                case 'PRDP':
                    strokeColor = '#127EB7';
                    break;
                case 'PRDP':
                    strokeColor = '#EDAB3A';
                    break;
            }

            if(name.indexOf('municipal') != -1 || name.indexOf('mun.') != -1 || name.indexOf('hall') != -1 || name.indexOf('access road') != -1){
                strokeColor = '#F26763';
            }

            var flightPath = new google.maps.Polyline({
                path: flightPlanCoordinates,
                geodesic: true,
                strokeColor: strokeColor,
                strokeOpacity: 1.0,
                strokeWeight: 4,
                name: name,
            });
            google.maps.event.addListener(flightPath, 'click', function() {
                console.log(this.name);
            });

            for(var j = 0; j < flightPlanCoordinates.length; j++) {
                /*console.log('lat', flightPlanCoordinates[i]['lat']);
                console.log('lng', flightPlanCoordinates[i]['lng']);*/
                var latlng = new google.maps.LatLng(flightPlanCoordinates[j]['lat'], flightPlanCoordinates[j]['lng']);
                bounds.push(latlng);
            }
            mapObjects.push(flightPath);
            if(window.show_original_track) {
                var flightPath_ = new google.maps.Polyline({
                    path: flightPlanCoordinates_,
                    geodesic: true,
                    strokeColor: '#00F',
                    strokeOpacity: 1.0,
                    strokeWeight: 4,
                    name: name,
                });
                google.maps.event.addListener(flightPath_, 'click', function() {
                    console.log(this.name);
                });

                for(var j = 0; j < flightPlanCoordinates_.length; j++) {
                    var latlng = new google.maps.LatLng(flightPlanCoordinates_[j]['lat'], flightPlanCoordinates_[j]['lng']);
                    bounds.push(latlng);
                }
                mapObjects.push(flightPath_);
            }
        }
    }
    if(LineString.length == 0 && MultiTrack.length == 0) {
        return {'mapObjects': [], 'bounds': []};
    }

    return {'mapObjects': mapObjects, 'bounds': bounds};
}

/**
 * Load and set the visibilty image viewer to true.
 * @param {string} project - The project code that contains the dataset that has the image group.
 * @param {string} dataset - The dataset of the image group.
 * @param {integer} index - The index of the image group.
 */
// function displayImageViewer(project, dataset_code, index) {
//     window.is_image_viewer_displayed = true;
//     window.current_image_index = index;
//     dataset = window.projects_database[project].datasets[dataset_code];
//     group = dataset.image_groups[index];
//     populateImageViewer(dataset, index);
//     populateTimeline(dataset);
//     getDistanceFromStartingPoint(dataset, index);
//     refreshViews();
//     $('#proj-gallery-lightbox-v .individual-image-wrapper')[0].click();
// }

function getDistanceFromStartingPoint(dataset, index) {
    var projects = getSelectedDatasetsFromSelectedProjects();
    var latlng1 = dataset.image_groups[dataset.image_groups.length - 1][0].latlng.split(',');
    var latlng1 = new google.maps.LatLng(parseFloat(latlng1[0]), parseFloat(latlng1[1]));
    var latlng2 = dataset.image_groups[index][0].latlng.split(',');
    var latlng2 = new google.maps.LatLng(parseFloat(latlng2[0]), parseFloat(latlng2[1]));
    $('#distance_from_starting_point').text((getDistance(latlng1, latlng2) / 1000).toFixed(2) + ' KM');
}

/**
 * Display image viewer if the its displayed flag is true or hides it otherwise.
 */
// function renderImageViewer() {
//     window.is_image_viewer_displayed ?
//         $('#protocol_viewer').css({'display': 'block'}) : $('#protocol_viewer').css({'display': 'none'});
// }

/**
 * Hide the image viewers' visibility flag then refresh the views.
 */
// function hideViewers() {
//     $(".proj-gallery-lightbox-wrapper").hide();
//     window.is_image_viewer_displayed = false;
//     window.images_are_displayed = false;
//     window.special_images_are_displayed = false;
//     refreshViews();
// }

function getImage(image) {

}

/**
 * Count the properties inside an object.
 * @param {Object} obj - The object whose properties are to be counted.
 */
function countProperties(obj) {
    var count = 0;
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            ++count;
    }
    return count;
}


/**
 * Get Dataset Files
 * @param {string} dataset_code - The dataset Id of the images to retrieve.
 * @param {string} cursor - Cursor for fetching additional data.
 */
function getDatasetFiles(dataset_code, cursor) {
    var dataset = window.datasets_database[dataset_code];
    var url = BASE_URL + '/api/v1/data?callback=?&n=100&type=FILE' +
        '&parent_code=' + dataset.code
    if(cursor) {
        url += '&cursor=' + cursor;
    }
    console.log('getDatasetFiles', url);
    $.getJSON(url, function(data) {
        var next = data.cursor;
        var data = data.data;
        if(data) {
            if(!('files' in window.datasets_database[dataset_code])) {
                window.datasets_database[dataset_code].files = [];
            }
            for(var i = 0; i < data.length; i++) {
                window.datasets_database[dataset_code].files.push(data[i]);
            }
            if(next) {
                getDatasetFiles(dataset_code, next);
            }
        }
    });
}

function loadSpecialFindingsViewer(index){
    // take grouped_images and render on a nice slick view
    // start from index
    window.special_images_are_displayed = true;

    if(index || index === 0){
        window.current_special_image_index = index;
    }

    $("#proj-gallery-lightbox-v-special").empty();

    var image = window.datasets_database[current_special_image_viewer_dataset].files[index];

    var html = '<div class="special-image-wrapper"> \
    <h2 class="special_viewer_title">Special Findings & Observations</h2> \
    <img src="' + image['file']['serving_url'] + '=s1000" alt=""> \
    <div class="special_showing_number">Showing ' + (window.current_special_image_index+1) + ' of ' + window.datasets_database[window.current_special_image_viewer_dataset].files.length + '</div> \
    <div class="download_special_image"><a href="' + image.original_file_url + '" target="_blank" class="fa fa-download tooltip" title="Download Image">&nbsp; Download Image</a></div> \
    </div>';
    $('#proj-gallery-lightbox-v-special').prepend(html);
    $("#special_left, #special_right").removeClass("invisible");
    if(window.current_special_image_index == 0){
        // no more left;
        $("#special_left").addClass("invisible");
    }
    if(window.current_special_image_index == window.datasets_database[window.current_special_image_viewer_dataset].files.length - 1){
        // no more right
        $("#special_right").addClass("invisible");
    }

    renderSpecialImageViewer();
}

/**
 * Get Dataset Images
 * @param {string} datasetId - The dataset Id of the images to retrieve.
 * @param {string} url - The passed URL for retrieving the specific dataset images.
 */
function getDatasetImages(dataset_code, cursor){
    console.log('getDatasetImages', dataset_code);
    var dataset = window.datasets_database[dataset_code];
    var url = BASE_URL + '/api/v1/data?callback=?&n=100&type=IMAGE' +
        '&parent_code=' + dataset.code
    if(cursor) {
        url += '&cursor=' + cursor;
    }

    $.getJSON(url, function(data) {
        var next = data.cursor;
        var data = data.data;
        if(data) {
            // console.log('got images', data);
            if(!('images' in window.datasets_database[dataset_code])) {
                window.datasets_database[dataset_code].images = [];
            }
            for(var i = 0; i < data.length; i++) {
                try {
                    data[i].datetime = data[i].date;
                }
                catch(e){
                    console.log(e);
                }
                create_image(data[i]);
                window.datasets_database[dataset_code].images.push(data[i]);
            }
            if(next) {
                getDatasetImages(dataset_code, next);
            }
            else {
                groupDatasetImages(dataset_code);
            }
        }
    });
}

/**
 * Group dataset images to be displayed on both the map and the image viewer.
 * @param {Object} dataset - The dataset object which contains the images to be grouped.
 */
function groupDatasetImages(dataset_code) {
    var images = window.datasets_database[dataset_code].images;
    for(var i = 0; i < images.length; i++) {
        if(!('image_groups' in window.datasets_database[dataset_code])) {
            window.datasets_database[dataset_code].image_groups = [];
        }
        if(!window.datasets_database[dataset_code].image_groups.length) {
            window.datasets_database[dataset_code].image_groups.push([images[i]]);
            continue;
        }
        var assigned = false;
        for(var j = 0; j < window.datasets_database[dataset_code].image_groups.length; j++) {
            if(window.datasets_database[dataset_code].image_groups[j][0].id == images[i].id) {
                continue;
            }
            if(is_near(window.datasets_database[dataset_code].image_groups[j][0].latlng, images[i].latlng)) {
                window.datasets_database[dataset_code].image_groups[j].push(images[i]);
                assigned = true;
                break;
            }
        }
        if(!assigned) {
            window.datasets_database[dataset_code].image_groups.push([images[i]]);
        }
        getImage(images[i]);
    }
    refreshViews();
}

/**
 * Populate the image viewer with the currently selected images from the selected projects and its selected datasets.
 * @param {Object} dataset - The dataset object to be stored on the global array for viewing.
 * @param {Integer} index - The index selected triggered by clicking the marker.
 */
// function populateImageViewer(dataset, index) {
//     window.current_images[dataset.parent_code] = {}
//     window.current_images[dataset.parent_code][dataset.code] = dataset.image_groups;
//     resetImageViewer();
//     for(var i = 0; i < window.current_images[dataset.parent_code][dataset.code][index].length; i++) {
//         var image = window.current_images[dataset.parent_code][dataset.code][index][i];
//         var html = '<div class="individual-image-wrapper">';
//         html += '<div class="date-time-image"><span>Location:</span> <b>' + image.latlng + '</b><br/><!--<span>Time:</span> <b>' + moment(image.date, 'YYYY:MM:DD HH:mm:sss').format('MMMM DD, YYYY H:mm A') + '</b> --></div>';
//         html += '<a href="' + image.image.file_url + '" target="_blank" class="fa fa-download dl-img-btn tooltip" title="Download Image">&nbsp;</a>';
//         html += '<img src="' + image.image.serving_url + '"/>';
//         html += '<div class="road-details-wrapper" data-image-id="' + image.id + '" id="road-details-wrapper" data-info="' + btoa(JSON.stringify([image.latlng, image.image.serving_url, image.image.file_url, image.parent_code, image.id, image.project_code])) + '">';
//         html += '<div class="surface-wrapper" data-img-id="' + image.id + '">';
//         html += '<span class="selectSurface-label">Surface: </span>';
//         if(image.surface_type && image.surface_type != 'NA') {
//             var surface = '<img src="/images/icn-' + image.surface_type.toLowerCase() + '.jpg" class="inline-block"/> ';
//         }
//         else {
//             var surface = 'Select Surface';
//         }
//         html += '<span class="surface-val" id="surface-val" data-img-id="' + image.id + '">' + surface + '</span>';
//         html += '</div>';
//         html += '<div class="select-surface clearfix none" id="select-surface" data-img-id="' + image.id + '">';
//         html += '<span class="block" data-surface="concrete"><input type="checkbox" name="concrete" value="concrete" class="inline-block"/><img src="/images/icn-concrete.jpg" class="inline-block"/> Concrete</span>';
//         html += '<span class="block" data-surface="asphalt"><input type="checkbox" name="asphalt" value="asphalt" class="inline-block"/><img src="/images/icn-asphalt.jpg" class="inline-block"/> Asphalt</span>';
//         html += '<span class="block" data-surface="gravel"><input type="checkbox" name="gravel" value="gravel" class="inline-block"/><img src="/images/icn-gravel.jpg" class="inline-block"/> Gravel</span>';
//         html += '<span class="block" data-surface="earth"><input type="checkbox" name="earth" value="earth" class="inline-block"/><img src="/images/icn-earth.jpg" class="inline-block"/> Earth</span>';
//         html += '</div>';
//         html += '<div class="quality-wrapper" data-img-id="'+ image.id +'">';
//         html += '<span class="selectQuality-label">Quality: </span>';
//         html += '<select id="selectQuality" name="surface" class="select-quality" multiple data-image="' + image.id + '">';
//         if(image.surface_quality && image.surface_quality != 'NA') {
//             var quality = 'data-iconurl="/images/icn-' + image.surface_quality.toLowerCase() + '.jpg"> ' + toTitleCase(image.surface_quality);
//         }
//         else {
//             var quality = '>Select Quality';
//         }
//         html += '<option disabled ' + quality + '</option>';
//         html += '<option value="Good" data-iconurl="/images/icn-good.jpg"> Good</option>';
//         html += '<option value="Fair" data-iconurl="/images/icn-fair.jpg"> Fair </option>';
//         html += '<option value="Poor" data-iconurl="images/icn-poor.jpg"> Poor </option>';
//         html += '<option value="Bad" data-iconurl="/images/icn-bad.jpg">Bad</option>';
//         html += '</select>';
//         html += '</div>';
//         html += '<div class="set-width-menu" id="set-width-menu"';
//         html += '<ul>';
//         html += '<li> <form action="" class="width-form"> <input type="text" placeholder="Set manually in meters..."><input type="submit" value="OK"></form></li>';
//         html += '<li><a href="#" class="">Same As Last</a></li>';
//         html += '</ul>';
//         html += '</div>';
//         html += '<a class="width-btn" href="#">Width: <span>' + 'road_width' + '</span></a>';
//         html += '</div>';
//         html += '</div>';
//         $('#proj-gallery-lightbox-v').prepend(html);
//     }
//     $(".select-quality, .select-surface").selectBoxIt();
//     $('.select-surface').on('click', '.block', function() {
//         $(this).children('input').trigger('click');
//     });
//     $('.select-quality').on('change', function() {
//         submitClassification('QUALITY', $(this).val(), JSON.parse(atob($(this).parents('.road-details-wrapper').data('info'))), this);
//     });
//     $(".surface-wrapper .surface-val").on("click", function(){
//         var id = $(this).data("img-id");
//         var selectSurface = $(".select-surface[data-img-id=" + id + "]");
//         if(selectSurface.hasClass('none')) {
//             selectSurface.removeClass('none');
//             selectSurface.addClass('display');
//         }
//         else {
//             selectSurface.removeClass('display');
//             selectSurface.addClass('none');
//             var surfaces = [];
//             $('.select-surface[data-img-id="' + id + '"] span input:checked').each(function() {
//                 surfaces.push($(this).val().toUpperCase());
//             });
//             submitClassification('SURFACE', surfaces, JSON.parse(atob($(this).parents('.road-details-wrapper').data('info'))), this);
//         }
//     });
//     var number_of_images_in_dataset = window.current_images[dataset.parent_code][dataset.code][index].length;
//     if(number_of_images_in_dataset < 3) {
//         for(var i = 0; i < (3 - number_of_images_in_dataset); i++) {
//             var html = '<div class="individual-image-wrapper">';
//             html += '<img src="/images/image_viewer_wrapper.jpg"/>';
//             html += '</div>';
//             $('#proj-gallery-lightbox-v').prepend(html);
//         }
//     }
//     initializeImageViewer(number_of_images_in_dataset);
// }

function submitClassification(type, values, image_data, node) {
    var post = '/api/v1/classification';
    var payload = {}
    for(var i = 0; i < values.length; i++) {
        payload['classification_type'] = type;
        payload['classification'] = values[i].toUpperCase();
        payload['lat'] = image_data[0].split(',')[0];
        payload['lng'] = image_data[0].split(',')[1];
        payload['image_serving_url'] = image_data[1];
        payload['image_url'] = image_data[2];
        payload['parent_code'] = image_data[3];
        payload['image_id'] = image_data[4];
        payload['is_road'] = '1';
        payload['project_code'] = image_data[5];
        $.post(post, payload, function(data) {
            if(type == 'SURFACE') {
                var node_html = '';
                if(values.length > 1) {
                    for(var i = 0; i < values.length; i++) {
                        node_html += values[i] == 'EARTH' ? '<img src="/images/icn-earth.jpg" class="inline-block"/> ': '<img src="/images/icn-' + values[i].toLowerCase() + '.jpg" class="inline-block"/> ';
                    }
                }
                else {
                    node_html = values[0] == 'EARTH' ? '<img src="/images/icn-earth.jpg" class="inline-block"/> ': '<img src="/images/icn-' + values[0].toLowerCase() + '.jpg" class="inline-block"/> ';
                }
                $(node).html(node_html);
                $('li.progress-timeline-marker[data-image="' + payload.image_id + '"]').children('.road-class-info').removeClass('earth gravel asphalt concrete');
                surface = payload['classification'].toLowerCase();
                if(surface == 'earth') {
                    surface = 'earth';
                }
                $('li.progress-timeline-marker[data-image="' + payload.image_id + '"]').children('.road-class-info').addClass(surface);
            }
            else if(type == 'QUALITY') {
                var node_html = '';
                if(values.length > 1) {
                    node_html = '<b>' + values[0] + '</b>';
                }
                $(node).html(node_html);
                $('li.progress-timeline-marker[data-image="' + payload.image_id + '"]').children('.road-class-info').removeClass('good fair poor bad');
                quality = payload['classification'].toLowerCase();
                $('li.progress-timeline-marker[data-image="' + payload.image_id + '"]').children('.road-class-info').addClass(quality);
            }
            for(var i = 0; i < window.projects_database[payload.project_code].datasets[payload.parent_code].image_groups[window.current_image_index].length; i++) {
                if(window.projects_database[payload.project_code].datasets[payload.parent_code].image_groups[window.current_image_index][i].id == payload.image_id) {
                    for(var j = 0; j < values.length; j++) {
                        if(type == 'SURFACE') {
                            window.projects_database[payload.project_code].datasets[payload.parent_code].image_groups[window.current_image_index][i].surface_type = values[j];
                        }
                        else if(type == 'QUALITY') {
                            window.projects_database[payload.project_code].datasets[payload.parent_code].image_groups[window.current_image_index][i].surface_quality = values[j];
                        }
                    }
                    break;
                }
            }
        });
    }
}

function getPhilGEPS(solicitation_no) {
    var url = 'http://api.data.gov.ph/catalogue/api/action/datastore_search_sql?sql=SELECT%20*%20from%20%229c74991c-a5e6-4489-8413-c20a8a181d90%22%20WHERE%20solicitation_no%20%3D%20%27' + solicitation_no + '%27';
    console.log('getPhilGEPS', '/api/v1/proxy?url=' + url);
    $.getJSON(url, function(data) {
        console.log('RESULT');
        console.log(data);
    });
}

/**
 * Reset the image viewer.
 */
// function resetImageViewer() {
//     try {
//         $("#proj-gallery-lightbox-v").slick('unslick');
//     }
//     catch(e) {
//         console.info(e);
//     }
//     $("#proj-gallery-lightbox-v").empty();
// }

// function populateTimeline(dataset){
//     $('ul.photo-timeline').empty();
//     var total = dataset.image_groups.length;
//     step = total > 40 ? parseInt(total / 40) + 1 : 1;
//     latlng1 = dataset.image_groups[dataset.image_groups.length - 1][0].latlng.split(',');
//     latlng1 = new google.maps.LatLng(parseFloat(latlng1[0]), parseFloat(latlng1[1]));
//     latlng2 = dataset.image_groups[0][0].latlng.split(',');
//     latlng2 = new google.maps.LatLng(parseFloat(latlng2[0]), parseFloat(latlng2[1]));
//     $('#distance_until_the_end_of_the_road').text((getDistance(latlng1, latlng2) / 1000).toFixed(2) + ' KM');
//     for(var i = 0; i < dataset.image_groups.length; i += step) {
//         var has_surface_index = 0;
//         var surface = 'na';
//         var quality = 'na';
//         for(var j = 0; j < dataset.image_groups[i].length; j++) {
//             if(dataset.image_groups[i][j].surface_type) {
//                 has_surface_index = j;
//                 surface = dataset.image_groups[i][j].surface_type.toLowerCase();
//                 quality = dataset.image_groups[i][j].surface_quality.toLowerCase();
//             }
//             if(surface != 'na') {
//                 break;
//             }
//         }
//         if(surface == 'earth' || surface == 'eartj') {
//             surface = 'earth';
//         }
//         if(i <= window.current_image_index) {
//             try {
//                 $('ul.photo-timeline').append('<li class="progress-timeline-marker" data-image="' + dataset.image_groups[i][has_surface_index].id + '" title="' + i + '"><div class="progress-timeline-line active"></div><i class="img-available"></i><span class="active"></span><div class="road-class-info ' + quality + ' ' + surface + '">X</div></li>');
//             }
//             catch(e) {
//                 console.log('ERROR IN populateTimeline');
//                 console.log('window.current_image_index', window.current_image_index, 'has_surface_index', has_surface_index);
//                 console.log(dataset.image_groups[i][has_surface_index]);
//             }
//         }
//         else {
//             try{
//                 $('ul.photo-timeline').append('<li class="progress-timeline-marker" data-image="' + dataset.image_groups[i][has_surface_index].id + '" title="' + i + '"><div class="progress-timeline-line"></div><i class="img-available"></i><span></span><div class="road-class-info ' + quality + ' ' + surface + '">X</div></li>');
//             }
//             catch(e) {
//                 console.log('ERROR IN populateTimeline');
//                 console.log('window.current_image_index', window.current_image_index, 'has_surface_index', has_surface_index);
//                 console.log(dataset.image_groups[i][has_surface_index]);
//             }
//         }
//     }
// }

/**
 * Initialize the image viewer.
 * @param {Integer} slides - The number of slides to be shown.
 */
// function initializeImageViewer(slides) {
//     $("#proj-gallery-lightbox-v").slick({
//         slidesToShow: getSlidesToShow(slides),
//         initialSlide: getSlidesToShow(slides) - 1,
//         speed: 0,
//         slidesToScroll: 1,
//         centerMode: true,
//         focusOnSelect: true,
//         prevArrow: "<button class='left-gallery-nav'><i class='fa fa-chevron-left'></i></button>",
//         nextArrow: "<button class='right-gallery-nav'><i class='fa fa-chevron-right'></i></button>",
//         variableWidth: true,
//         accessibility: true,
//         // infinite: false,
//     });
// }

/**
 * Get the images in the current images global array.
 * @param {Integer} image_length - The length of the image group.
 */
// function getSlidesToShow(image_length) {
//     return image_length > 8 ? 8: image_length == 0 ? 0:image_length - 1;
// }

/**
 * Get the images in the indicated in current images global array.
 * @param {Integer} index - The variable that indicates where the images in the image groups are.
 */
function getCurrentImagesByIndex(index) {
    return window.current_images[index] ? window.current_images[index] : null;
}

/**
 * Display the special image viewer on the map.
 */
function renderSpecialImageViewer() {
    window.special_images_are_displayed ?
        $('#special_findings_viewer').css({'display': 'block'}) : $('#special_findings_viewer').css({'display': 'none'});
}

/**
 * Display image markers on the map.
 * @param {Object} dataset - The dataset object that containes the image groups that are to be placed on the map.
 */
function displayImageMarkersOnMap(dataset_code) {
    hideImageMarkersOnMap(dataset_code);
    var dataset = window.datasets_database[dataset_code];
    if('image_groups' in dataset){
        var images = [];
        for(var i = 0; i < dataset.image_groups.length; i++) {
            var latlng = dataset.image_groups[i][0].latlng.split(',');
            var l = new google.maps.LatLng(latlng[0], latlng[1]);
            var marker = new google.maps.Marker({
                position: l,
                map: thisMap,
                icon: '/images/image-marker.png',
                index: i,
                project: dataset.parent_code,
                dataset: dataset.code,
            });
            images.push(marker);

            window.mapBounds.extend(l);

            google.maps.event.addListener(marker, 'click', function() {
                // displayImageViewer(this.project, dataset_code, this.index);
                displayImageViewer2(this.project, this.index);
            });
            if(!('mapObjects' in dataset)){
                dataset.mapObjects = {};
            }
            dataset.mapObjects.images = images;
        }
    }
    if('files' in dataset) {
        var images = [];
        for(var i = 0; i < dataset.files.length; i++) {
            if(!('latlng' in dataset.files[i])) {
                continue;
            }
            var latlng = dataset.files[i].latlng.split(',');
            var l = new google.maps.LatLng(latlng[0], latlng[1]);
            var marker = new google.maps.Marker({
                position: l,
                map: thisMap,
                icon: '/images/image-marker-violet.png',
                index: i,
                project: dataset.parent_code,
                dataset: dataset.code,
            });
            images.push(marker);

            window.mapBounds.extend(l);

            google.maps.event.addListener(marker, 'click', function() {
                window.current_special_image_viewer_dataset = dataset_code;
                loadSpecialFindingsViewer(this.index);
            });
            if(!('mapObjects' in dataset)){
                dataset.mapObjects = {};
            }
            dataset.mapObjects.files = images;
        }
    }
}


function hideImageMarkersOnMap(dataset_code){
    var dataset = window.datasets_database[dataset_code];
    if('mapObjects' in dataset){
        if('images' in dataset.mapObjects){
            if(dataset.mapObjects.images){
                for(var i=0; i<dataset.mapObjects.images.length; i++){
                    dataset.mapObjects.images[i].setMap(null);
                }
            }
        }
    }
}


function hideKMLS(dataset_code){
    var dataset = window.datasets_database[dataset_code];

    if('rendered_kmls' in dataset){
        for(var key in dataset['rendered_kmls']){
            if(dataset['rendered_kmls'].hasOwnProperty(key)){
                for(var i=0; i<dataset['rendered_kmls'][key].mapObjects.length; i++){
                    dataset['rendered_kmls'][key].mapObjects[i].setMap(null);
                }
            }
        }
    }
}


function displayKMLS(dataset_code){
    var dataset = window.datasets_database[dataset_code];

    if('rendered_kmls' in dataset){
        for(var key in dataset['rendered_kmls']){
            if(dataset['rendered_kmls'].hasOwnProperty(key)){
                for(var i=0; i<dataset['rendered_kmls'][key].mapObjects.length; i++){
                    dataset['rendered_kmls'][key].mapObjects[i].setMap(thisMap);
                }
                for(var i=0; i<dataset['rendered_kmls'][key].bounds.length; i++){
                    window.mapBounds.extend(dataset['rendered_kmls'][key].bounds[i]);
                }
            }
        }
    }

}


// /**
//  * Move or increase the image viewer index forward.
//  */
// function moveImageViewerForward(){
//     var new_index = window.current_image_index + 1;
//     if(get_images_by_index(new_index)){
//         window.current_image_index += 1;
//         display_images();
//     }
//     else {
//         // reached the end. do nothing.
//         console.log('reached the end. do nothing.');
//     }
// }

// /**
//  * Move or decrease the image viewer index backward.
//  */
// function moveImageViewerBackward(){
//     var new_index = window.current_image_index - 1;
//     if(new_index < 0){
//         // reached the end. do nothing.
//         return;
//     }
//     if(get_images_by_index(new_index)){
//         window.current_image_index -= 1;
//         display_images();
//     }
//     else {
//         // no images there. do nothing. weird though.
//         console.log("WEIRD BEHAVIOR. Index not at zero, but images not available.");
//     }
// }

/**
 * Get Dataset KML
 * @param {string} datasetId - The dataset Id of the KMLs to retrieve.
 * @param {string} url - The passed URL for retrieving the specific dataset images.
 */
function getDatasetKMLs(dataset_code, cursor){
    var dataset = window.datasets_database[dataset_code];
    var url = BASE_URL + '/api/v1/data?callback=?&type=KML' +
        '&parent_code=' + dataset.code;
    if(cursor) {
        url += '&cursor=' + cursor;
    }
    console.log('getDatasetKMLs', url);
    $.getJSON(url, function(data) {
        var next = data.cursor;
        var data = data.data;
        if(data) {
            if(!('kml' in window.datasets_database[dataset_code])) {
                window.datasets_database[dataset_code].kml = [];
            }
            for(var i = 0; i < data.length; i++) {
                window.datasets_database[dataset_code].kml.push(data[i]);
            }
            if(next) {
                getDatasetKMLs(dataset_code, next);
            }
            else {
                var kml = window.datasets_database[dataset_code].kml;
                for(var i = 0; i < kml.length; i++) {
                    getKML(dataset_code, kml[i])
                }
            }
        }
    });
}


/**
 * Create or Update a Dataset Image
 * @param {object} image - The image object to create or update.
 */
function createOrUpdateDatasetImage(image){

}





/**
 * Render the map.
 * Renders all selected datasets to be rendered in the map.
 */
function renderMap(){
    clearBounds();
    // hide not selected
    var datasets_to_hide = getNotSelectedDatasets();
    for(var i=0; i<datasets_to_hide.length; i++){
        hideImageMarkersOnMap(datasets_to_hide[i].code);
        hideKMLS(datasets_to_hide[i].code);
    }

    // render selected
    var datasets = getSelectedDatasets();
    for(var i=0; i<datasets.length; i++){
        displayImageMarkersOnMap(datasets[i].code);
        displayKMLS(datasets[i].code);
    }

    fitBounds();
}


function clearBounds(){
    window.mapBounds = new google.maps.LatLngBounds();
}


function fitBounds(){
    if(!window.mapBounds.isEmpty()){
        thisMap.fitBounds(window.mapBounds);
    }
}


/**
 * Helper function. Efficient way of replacing inner HTML content of an element.
 */
function replaceHtml(el, html) {
    var oldEl = typeof el === "string" ? document.getElementById(el) : el;
    /*@cc_on // Pure innerHTML is slightly faster in IE
        oldEl.innerHTML = html;
        return oldEl;
    @*/
    oldEl.innerHTML = html;
    (!window.visible_projects.length) ?
        $('#sidebar_list_wrapper').append('<div id="no-results-found">No results found</div>'):
        $('#no-results-found').remove();
}


/**
 * Initialize the Geostore Viewer
 */
function initializeGeostoreViewer(){
    loadProjectsFromLocalStorage();
    unHideAllProjects();
    deselectAllProjects();

    // sync new projects that were updated after our last sync
    var fromLastTimestamp = 0;
    var newestProject = getNewestProject();
    if(newestProject){
        fromLastTimestamp = newestProject.updated_timestamp_utc;
    }

    getAndSelectPreselectedProject();

    getNewProjects(fromLastTimestamp);
    getNewProjectsFromMostRecent();

    renderViewer();
}


function getAndSelectPreselectedProject(){
    console.log('getAndSelectPreselectedProject');
    if(window.preselected_project_id){
        var api = BASE_URL + '/api/v1/data/' + window.preselected_project_id + '?callback=?';
        console.log(api);
        $.getJSON(api, function(data) {
            console.log('preselected', data);
            var data = data.data;
            if(data){
                if(data.type == 'PROJECT'){
                    console.log('TEST');
                    var project = createOrUpdateProject(data);
                    toggleSelectProject(data.code);
                    window.put_at_top = project.code;
                }
                refreshViews();
            }
        });
    }
}


/**
 * Deselect all projects. Helper function.
 */
function deselectAllProjects(){
    for (var key in window.projects_database) {
        if (window.projects_database.hasOwnProperty(key)) {
            if(window.projects_database[key].selected){
                deselectAllProjectDatasets(window.projects_database[key]);
            }
            window.projects_database[key].selected = false;
        }
    }

    // window.put_at_top = null;
}



/**
 * Unhide all projects. Helper function.
 */
function unHideAllProjects(){
    window.visible_projects = [];
    for (var key in window.projects_database) {
        if (window.projects_database.hasOwnProperty(key)) {
            if(window.projects_database[key].type == 'PROJECT'){
                window.projects_database[key].visible = true;
                window.visible_projects.push(window.projects_database[key]);
            }
        }
    }
}


/**
 * Listeners
 */
function initializeListeners(){
    // Clicking on a dataset on the sidebar
    // Clicking on a project on the sidebar
    // clicking on a marker on the map
}


/**
 * Delay function helper
 */

var delay = (function(){
  var timer = 0;
  return function(callback, ms){
    clearTimeout (timer);
    timer = setTimeout(callback, ms);
  };
})();





/**
 * Filters for projects in sidebar
 */
function applyVisibilityFilters(){
    unHideAllProjects();

    // applySearchProjectStatus();
    // applySearchProjectType();
    applyHasKMLFilter();
    applyHasImagesFilter();
    applyProgramFilter();
    applySearchLocation();
    applySearchScope();
    applyDateFilter();
    applySearchFilter();
}


/**
 * Set Project Visibility Hidden to those that don't match the program filter
 */
function applyProgramFilter(){
    var selected_programs = get_selected_programs();

    var new_visible_projects = [];

    if(selected_programs.length > 0){
        if(selected_programs.indexOf('CPA') > -1){
            // has CPA
            var projects_length = window.visible_projects.length;
            for(var i=0; i<projects_length; i++){
                if(selected_programs.indexOf(window.visible_projects[i].program) != -1){
                    new_visible_projects.push(window.visible_projects[i]);
                }
                else if(window.visible_projects[i].coa == '1'){
                    new_visible_projects.push(window.visible_projects[i]);
                }
            }
        }
        else {
            // no CPA
            var projects_length = window.visible_projects.length;
            for(var i=0; i<projects_length; i++){
                if(selected_programs.indexOf(window.visible_projects[i].program) != -1){
                    new_visible_projects.push(window.visible_projects[i]);
                }
            }
        }
    }
    else {
        new_visible_projects = window.visible_projects;
    }

    window.visible_projects = new_visible_projects;
}


/**
 * Set Project Visibility Hidden to those that don't match the project status
 */
function applySearchProjectStatus(){
    var projectStatus = $('#project_status_select').val();

    if(projectStatus == 'all'){
        return
    }
    else {
        var new_visible_projects = [];

        var projects_length = window.visible_projects.length;
        for(var i=0; i<projects_length; i++){
            if(window.visible_projects[i].free_search.indexOf(projectStatus) != -1){
                new_visible_projects.push(window.visible_projects[i]);
            }
        }

        window.visible_projects = new_visible_projects;
    }
}


/**
 * Set Project Visibility Hidden to those that don't match the project type
 */
function applySearchProjectType(){
    var projectType = $('#project_type_select').val();

    if(projectType == 'all'){
        return
    }
    else {
        var new_visible_projects = [];

        var projects_length = window.visible_projects.length;
        for(var i=0; i<projects_length; i++){
            if(window.visible_projects[i].free_search.indexOf(projectType) != -1){
                new_visible_projects.push(window.visible_projects[i]);
            }
        }

        window.visible_projects = new_visible_projects;
    }
}


/**
 * Set Project Visibility Hidden to those that have KML
 */
function applyHasKMLFilter(){
    if($('#has_kml_track_filter').is(":checked")){
        var new_visible_projects = [];

        var projects_length = window.visible_projects.length;
        // console.log('projects_length', projects_length);
        for(var i=0; i<projects_length; i++){
            if(window.visible_projects[i].has_kml == '1'){
                new_visible_projects.push(window.visible_projects[i]);
            }
        }

        window.visible_projects = new_visible_projects;
    }
}


/**
 * Set Project Visibility Hidden to those that have Image
 */
function applyHasImagesFilter(){
    if($('#has_images_filter').is(":checked")){
        var new_visible_projects = [];

        var projects_length = window.visible_projects.length;
        for(var i=0; i<projects_length; i++){
            if(window.visible_projects[i].has_image == '1'){
                new_visible_projects.push(window.visible_projects[i]);
            }
        }

        window.visible_projects = new_visible_projects;
    }
}


/**
 * Set Project Visibility Hidden to those that don't match the search filter
 */
function applySearchFilter(){
    var search_name = $("#search_by_name").val();
    search_name = search_name.toLowerCase();

    var new_visible_projects = [];

    var projects_length = window.visible_projects.length;
    for(var i=0; i<projects_length; i++){
        if(window.visible_projects[i].free_search.indexOf(search_name) != -1){
            new_visible_projects.push(window.visible_projects[i]);
        }
    }

    window.visible_projects = new_visible_projects;
}


function applyDateFilter() {
    var given_date = $('.year-filter').val();
    if(given_date) {
        if(given_date != 'all'){
            var new_visible_projects = [];

            var projects_length = window.visible_projects.length;
            for(var i=0; i<projects_length; i++){
                if(window.visible_projects[i].free_search.indexOf(given_date) != -1) {
                    new_visible_projects.push(window.visible_projects[i]);
                }
            }

            window.visible_projects = new_visible_projects;
        }
    }
}

function applySearchScope() {
    var scopes = $('.chosen-scope').val();
    if(scopes) {
        var new_visible_projects = [];

        var projects_length = window.visible_projects.length;
        for(var i=0; i<projects_length; i++){
            if(window.visible_projects[i].free_search) {
                for(var j = 0; j < scopes.length; j++) {
                    if(window.visible_projects[i].free_search.indexOf(scopes[j]) != -1) {
                        new_visible_projects.push(window.visible_projects[i]);
                        break;
                    }
                }
            }
        }

        window.visible_projects = new_visible_projects;
    }
}

function applySearchLocation() {
    var locations = $('.chosen-location').val();
    if(locations) {
        console.log(locations);
        var new_visible_projects = [];

        var projects_length = window.visible_projects.length;
        for(var i=0; i<projects_length; i++){
            if(window.visible_projects[i].municipality) {
                if(locations.indexOf(window.visible_projects[i].municipality.toLowerCase()) != -1) {
                    new_visible_projects.push(window.visible_projects[i]);
                    // break;
                }
            }
        }

        window.visible_projects = new_visible_projects;
    }
}


/**
 * Get the programs that have been checked in the title bar
 */
function get_selected_programs(){
    var selected_programs = [];
    var jquery_objects = $('.program_checkbox:checked');
    for(var i=0; i<jquery_objects.length; i++){
        var program_class = $(jquery_objects[i]).attr('id');
        if(program_class == 'program_select_da'){
            var program = 'PRDP';
        }
        if(program_class == 'program_select_bub'){
            var program = 'BUB';
        }
        if(program_class == 'program_select_trip'){
            var program = 'TRIP';
        }
        if(program_class == 'program_select_gaa'){
            var program = 'GAA';
        }
        if(program_class == 'program_select_cpa'){
            var program = 'CPA';
        }
        if(program_class == 'program_select_local'){
            var program = 'LOCAL';
        }
        selected_programs.push(program);
    }
    return selected_programs;
}



/**
 * Helper function for appending an object's values to an array
 */
function appendAll(dest, src) {
    var n;

    for (var key in src) {
        if (src.hasOwnProperty(key)) {
            dest.push(src[key]);
        }
    }

    return dest;
}


/**
 * Render title bar
 */
function select_program(program){
    var prog_type = '';
    if(program == 'PRDP'){
        $('#program_select_da').prop('checked', true);
        prog_type = 'DA-PRDP';
    }
    if(program == 'BUB'){
        $('#program_select_bub').prop('checked', true);
        prog_type = 'OpenBUB';
    }
    if(program == 'TRIP'){
        $('#program_select_trip').prop('checked', true);
        prog_type = 'TRIP';
    }
    if(program == 'GAA'){
        $('#program_select_gaa').prop('checked', true);
        prog_type = 'GAA FMR Regular';
    }
    if(program == 'CPA'){
        $('#program_select_cpa').prop('checked', true);
        prog_type = 'COA CPA 2015';
    }
    if(program == 'LOCAL'){
        $('#program_select_local').prop('checked', true);
        prog_type = 'LOCAL';
    }
    $('.prog-type').text(prog_type);
}


/**
 * Render title bar
 */
function render_title_bar(){
    // render title bar
    selected_programs = get_selected_programs();

    if (selected_programs.length == 1){
        var html = '';
        if(selected_programs.indexOf('PRDP') != -1){
            html += '<label for="">Department of Agriculture</label>' +
            '<h5>Philippine Rural Development Project</h5>';
        }
        if(selected_programs.indexOf('BUB') != -1){
            html += '<label for="">openbub.gov.ph</label>' +
            '<h5>Grassroots Participatory Budgeting Process</h5>';
        }
        if(selected_programs.indexOf('TRIP') != -1){
            html += '<label for="">Trip</label>' +
            '<h5>Tourism Road Infrastructure Program</h5>';
        }
        if(selected_programs.indexOf('GAA') != -1){
            html += '<label for="">GAA</label>' +
            '<h5>FMR Regular GAA</h5>';
        }
        if(selected_programs.indexOf('CPA') != -1){
            html += '<label for="">Commision on Audit</label>' +
            '<h5>COA CPA 2015</h5>';
        }
        if(selected_programs.indexOf('LOCAL') != -1){
            html += '<label for="">LOCAL</label>' +
            '<h5>Local Projects</h5>';
        }

        html+='<i class="fa fa-caret-down"></i>';
        $('#toggle-title-bar').html(html);
    }
    else if(selected_programs.length > 1){
        var html = '<label>Multiple Programs Selected</label><h5>';
        for(var i=0; i<selected_programs.length; i++){
            if(selected_programs[i] == 'PRDP'){
                html += 'PRDP';
            }
            if(selected_programs[i] == 'BUB'){
                html += 'BUB';
            }
            if(selected_programs[i] == 'TRIP'){
                html += 'TRIP';
            }
            if(selected_programs[i] == 'GAA'){
                html += 'GAA';
            }
            if(selected_programs[i] == 'CPA'){
                html += 'CPA';
            }
            if(selected_programs[i] == 'LOCAL'){
                html += 'LOCAL';
            }
            if((i+1) < selected_programs.length){
                html += ', ';
            }
        }
        html+='</h5>';
        html+='<i class="fa fa-caret-up"></i>';
        $('#toggle-title-bar').html(html);
    }
    else {
        // select default project and render that
        // select_program('PRDP');
        // render_title_bar();
        return;
    }

    renderProjectsInSidebar();
}

function move_special_left(){
    if(window.current_special_image_index >= 1){
        window.current_special_image_index -= 1;
        loadSpecialFindingsViewer(window.current_special_image_index);
    }
}

function move_special_right(){
    if(window.current_special_image_index < (window.datasets_database[window.current_special_image_viewer_dataset].files.length - 1)){
        window.current_special_image_index += 1;
        loadSpecialFindingsViewer(window.current_special_image_index);
    }
}

$(document).ready(function(){
    initializeGeostoreViewer();

    // Listen for dataset item clicks on the left sidebar.
    $('#sidebar_list_wrapper').on('change', '.proj-item .proj-dataset-subproject .proj-dataset input[type="checkbox"]', function() {
        var project = $(this).parents('.proj-item').attr('data-code');
        var program = $(this).parents('.proj-item').attr('data-program');
        var code = this.value;
        var dataset = window.projects_database[project].datasets[code];
        loadProjectDataset(dataset.code);
    });

    // Listen for Project Item clicks on the left sidebar.
    $("#sidebar_list_wrapper").on('click', '.proj-item', function(){
        if($(this).find('.project-checkbox input').is(':checked')) {
            console.log($(this).data('code'));
            // return;
        }
        toggleSelectProject($(this).data('code'));
    });

    // Listen for Project Item clicks on the left sidebar.
    $("#sidebar_list_wrapper").on('click', '.sidebar_project_checkbox', function(e){
        e.stopImmediatePropagation();
        addProjectToSelection($(this).data('code'));
    });

    // Listen for Project Item clicks on the left sidebar.
    $("#sidebar_list_wrapper").on('click', '.add-to-selection', function(e){
        e.stopImmediatePropagation();
        addProjectToSelection($(this).data('code'));
    });

    $('#sidebar_list_wrapper').on('click', '.proj-item .proj-dataset-subproject li', function(e) {
        e.stopImmediatePropagation();
        var dataset_code = $(this).find('input').val();
        toggleSelectDataset(dataset_code);
    });

    $('body').on('change', '.chosen-date', function() {
        window.current_dates_selected = $(this).val()
        display_images();
    });

    // $('.photo-timeline').on('click', '.progress-timeline-marker', function() {
    //     window.current_image_index = parseInt($(this).attr('title'));
    //     var project = '';
    //     var dataset = '';
    //     for(var x in window.current_images) {
    //         project = x;
    //         for(var y in window.current_images[x]) {
    //             dataset = y;
    //             if(window.current_image_index > window.current_images[x][y].length - 1) {
    //                 window.current_image_index--;
    //                 break;
    //             }
    //             break;
    //         }
    //         break;
    //     }
    //     displayImageViewer(project, dataset, window.current_image_index);
    // });

    $('#proj-details').addClass('hidden');

    // Chosen
    $(".chosen-select").chosen();
    $('.chosen-location, .chosen-scope').chosen().change(function() {
        renderProjectsInSidebar();
    });

    $('#year_filter_select').on('change', function() {
        renderProjectsInSidebar();
    });

    $('.filter-proj-options2 > select').on('change', function() {
        renderProjectsInSidebar();
    });

    $('#has_kml_track_filter').on('change', function() {
        renderProjectsInSidebar();
    });

    $('#has_images_filter').on('change', function() {
        renderProjectsInSidebar();
    });

    $('body').on('click', '#special_left', function(e){
      move_special_left();
    });

    $('body').on('click', '#special_right', function(e){
      move_special_right();
    });

    $('body').on('click', '.btn-move-forward', function(e){
      move_forward();
    });

    $('body').on('click', '.btn-move-backward', function(e){
      move_backward();
    });

    $("body").on('click', '.progress-timeline-marker', function(e){
        display_images($(this).data('marker-index'));
    });

    $('.more-filters-toggle').on('click', function() {
        $(this).text().toLowerCase() == 'more filters' ? $(this).text('Hide Filters') : $(this).text('More Filters');
        $('#more-filter-contents').toggle();
        resizeProjectsList();
    });

    $('body').on('click', '#proj-gallery', function(e){
      display_images();
      display_images();
    });

    // Listen for typing of search
    $('#search_by_name').on('keyup', function() {
        delay(function(){
            renderProjectsInSidebar();
        }, 600);
    });

    $("body").on("click", ".close-btn img", function(){
      hide_viewers();
    });

    // $('.btn-move-forward').on('click', function() {
    //     window.current_image_index++;
    //     var project = '';
    //     var dataset = '';
    //     for(var x in window.current_images) {
    //         project = x;
    //         for(var y in window.current_images[x]) {
    //             dataset = y;
    //             if(window.current_image_index > window.current_images[x][y].length - 1) {
    //                 window.current_image_index--;
    //                 break;
    //             }
    //             break;
    //         }
    //         break;
    //     }
    //     displayImageViewer(project, dataset, window.current_image_index);
    // });

    // $('.btn-move-backward').on('click', function() {
    //     window.current_image_index--;
    //     for(var x in window.current_images) {
    //         project = x;
    //         for(var y in window.current_images[x]) {
    //             dataset = y;
    //             if(window.current_image_index < 0) {
    //                 window.current_image_index++;
    //                 break;
    //             }
    //             break;
    //         }
    //         break;
    //     }
    //     displayImageViewer(project, dataset, window.current_image_index);
    // });

    $('.details-links-tab li').on('click', function() {
        $('.details-links-tab li').removeClass('active');
        $(this).addClass('active');
        if($(this).data('link') == 'projdetails') {
            showPlanningTab();
        }
        else if($(this).data('link') == 'procdetails') {
            showProcurementTab();
        }
        else if($(this).data('link') == 'contractdetails') {
            showImplementationTab();
        }
    });

    $('.choose').click(function() {
        // if there are checkboxes, add to the list.
        // if the checkbox was not clicked, then remove all checked marks on other projects and just check that project alone
        // render all projects that have checkmarks

        $('.program_checkbox').prop('checked', false);
        if($(this).hasClass('title-bar-da')){
            select_program('PRDP');
        }
        if($(this).hasClass('title-bar-bub')){
            select_program('BUB');
        }
        if($(this).hasClass('title-bar-trip')){
            select_program('TRIP');
        }
        if($(this).hasClass('title-bar-gaa')){
            select_program('GAA');
        }
        if($(this).hasClass('title-bar-coa-cpa')){
            select_program('CPA');
        }
        if($(this).hasClass('title-bar-local')){
            select_program('LOCAL');
        }

        render_title_bar();
    });


    $(".program_checkbox").click(function(e){
        e.stopImmediatePropagation();
        render_title_bar();
    });

    $(".ok-dismiss-btn").on('click', function(e) {
        e.preventDefault();
        $(".start-view-container").fadeOut("fast");
    });

    $("#sidebar_list_wrapper").scroll(function() {
        if( $("#sidebar_list_wrapper .proj-item:last-child").is_on_screen() ) {
            renderProjectsInSidebar(true);
        }
    });

    $(".title-barss").hide();
    $("#toggle-title-bar").on('click', function(){
        $(".title-barss").toggle();
        if($(".title-barss").is(":visible")){
          $("#toggle-title-bar .fa").addClass('fa-caret-up');
          $("#toggle-title-bar .fa").removeClass('fa-caret-down');
        }
        else {
          $("#toggle-title-bar .fa").addClass('fa-caret-down');
          $("#toggle-title-bar .fa").removeClass('fa-caret-up');
        }
        resizeProjectsList();
    });


    // hide legend
    $('.legend-toggle').click();


    // for geoprocessing

    $('body').on('click', '.click_surface_val', function(){
        var checkbox_group = $(this).parent().parent().find('.select-surface');
        if(checkbox_group.hasClass('none')){
            checkbox_group.removeClass('none');
        }
        else {
            var selected_surfaces = [];
            $(this).parent().parent().find('.surface-selection:checked').each(function(i, e){
                console.log(e);
                selected_surfaces.push($(e).val().toUpperCase());

                console.log('selected_surface', e);
            });

            console.log('selected_surfaces', selected_surfaces);

            var image_id = $(this).parents('.road-details-wrapper').attr('data-image-id');
            var image_url =  $(this).parents('.road-details-wrapper').attr('data-image-url');
            var image_serving_url =  $(this).parents('.road-details-wrapper').attr('data-image-serving-url');
            var image_project = $(this).parents('.road-details-wrapper').attr('data-project');
            var image_latlng = $(this).parents('.road-details-wrapper').attr('data-latlng');

            if(selected_surfaces.length){
                update_road('SURFACE', image_id, selected_surfaces, image_serving_url, image_url, image_project, image_latlng, this);
            }

            checkbox_group.addClass('none');
        }
    });

    $('body').on('click', '.click_quality_val', function(){
        var checkbox_group = $(this).parent().parent().find('.select-quality');
        if(checkbox_group.hasClass('none')){
            checkbox_group.removeClass('none');
        }
        else {
            var selected_quality = [];
            $(this).parent().parent().find('.quality-selection:checked').each(function(i, e){
                console.log(e);
                selected_quality.push($(e).val().toUpperCase());

                console.log('selected_surface', e);
            });

            console.log('selected_quality', selected_quality);

            var image_id = $(this).parents('.road-details-wrapper').attr('data-image-id');
            var image_url =  $(this).parents('.road-details-wrapper').attr('data-image-url');
            var image_serving_url =  $(this).parents('.road-details-wrapper').attr('data-image-serving-url');
            var image_project = $(this).parents('.road-details-wrapper').attr('data-project');
            var image_latlng = $(this).parents('.road-details-wrapper').attr('data-latlng');

            if(selected_quality.length){
                update_road('QUALITY', image_id, selected_quality, image_serving_url, image_url, image_project, image_latlng, this);
            }

            checkbox_group.addClass('none');
        }
    });
});

/**
 * Funciton to get distance by passing two LatLng objects.
 */
function getDistance(p1, p2) {
    var R = 6378137; // Earth’s mean radius in meter
    var dLat = (p2.lat() - p1.lat()) * Math.PI / 180;
    var dLong = (p2.lng() - p1.lng()) * Math.PI / 180;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((p1.lat() * Math.PI / 180)) * Math.cos((p2.lat() * Math.PI / 180)) *
            Math.sin(dLong / 2) * Math.sin(dLong / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    // console.log(R, dLat, dLong, a, c, d);
    return d; // returns the distance in meter
}

function is_near(latlong1, latlong2){
    lat1 = parseFloat(latlong1.split(",")[0]);
    lon1 = parseFloat(latlong1.split(",")[1]);
    lat2 = parseFloat(latlong2.split(",")[0]);
    lon2 = parseFloat(latlong2.split(",")[1]);
    p1 = new google.maps.LatLng(lat1, lon1);
    p2 = new google.maps.LatLng(lat2, lon2);
    var km_distance = getDistance(p1, p2) / 1000;
    if(km_distance <= 0.015){
        return true;
    }
    else {
        return false;
    }
}

/**
 * Helper function. jQuery plugin to determine if an item is on screen.
 */
$.fn.is_on_screen = function(){
    var win = $(window);
    var viewport = {
        top : win.scrollTop(),
        left : win.scrollLeft()
    };
    viewport.right = viewport.left + win.width();
    viewport.bottom = viewport.top + win.height();

    var bounds = this.offset();
    bounds.right = bounds.left + this.outerWidth();
    bounds.bottom = bounds.top + this.outerHeight();

    return (!(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom));
};

/**
 * Helper function. jQuery plugin to filter nodes by node name.
 */
$.fn.filterNode = function(name) {
    return this.find('*').filter(function() {
       return this.nodeName === name;
    });
};


/**
 * Change underscore to space and make into camel case. Eg. contract_price => Contract Price
 */
function formatLabelFromUnderscore(str){
    return toTitleCase(str.replace('_', ' ').replace('  ', ' '))
}


/**
 * Change "hello world" to "Hello World"
 */
function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}


/**
  * Loads the project's procurement details from the OpenData API.
  * @param {String} project_name - The project name to be queried to load the project.
  */
function get_project_procurement_details(project) {
    var url = '/api/philgeps';
    solicitation_number = project.meta.solicitation_number;
    if(!solicitation_number) {
        var philgeps = 'http://api.data.gov.ph/catalogue/api/action/datastore_search_sql?sql=SELECT%20*%20from%20%229c74991c-a5e6-4489-8413-c20a8a181d90%22%20WHERE%20tender_title%20=%20%27' + project.title + '%27';
    }
    else {
        var philgeps = 'http://api.data.gov.ph/catalogue/api/action/datastore_search_sql?sql=SELECT%20*%20from%20%229c74991c-a5e6-4489-8413-c20a8a181d90%22%20WHERE%20solicitation_no%20=%20%27' + solicitation_number + '%27';
    }

    if(!project.philgeps){
        project.philgeps = null;
    }

    $.getJSON(url, {'url': philgeps})
    .done(function( json ) {
        if(json){
            if(json.result.records.length){
                project.philgeps = json.result.records[0];
            }
        }
        refreshViews();
    })
    .fail(function( jqxhr, textStatus, error ) {
        var err = textStatus + ", " + error;
        console.log( "Request Failed: " + err );
        project.philgeps = null;
        refreshViews();
    });
}


/**
 * Render the project details
 */
function renderProjectDetails(){
    // if more than one project. hide this
    if(getSelectedProjects().length > 1){
        $("#view-details, #proj-details").hide();
        return;
    }

    $("#view-details").show();
    var project = getSelectedProject();
    if(project){
        renderPhilGEPSDetails(project);
        $('.list-info').empty();
        var fields = {
            'prdp': {
                'title': {
                    'display': 'Subproject Title',
                    'stage': 'Planning',
                },
                'code': {
                    'display': 'Subproject Identification No.',
                    'stage': 'Planning',
                },
                'province': {
                    'display': 'Province',
                    'stage': 'Planning',
                },
                'meta': {
                    'cluster': {
                        'display': 'Cluster',
                        'stage': 'Planning',
                    },
                    'region': {
                        'display': 'Region',
                        'stage': 'Planning',
                    },
                    'district': {
                        'display': 'District',
                        'stage': 'Planning',
                    },
                    'municipality_/_city': {
                        'display': 'Municipality / City',
                        'stage': 'Planning',
                    },
                    'proponent_lgu': {
                        'display': 'Proponent LGU',
                        'stage': 'Planning',
                    },
                    'subproject_type_-_corrected': {
                        'display': 'Subproject Type',
                        'stage': 'Planning',
                    },
                    'quantity': {
                        'display': 'Quantity (in kilometers)',
                        'stage': 'Planning',
                    },
                    'linear_meter_for_fmr_w/_bridge_sp': {
                        'display': 'Bridge length (if FMR with Bridges; with length)',
                        'stage': 'Planning',
                    },
                    'sp_cost_-_total': {
                        'display': 'Total Subproject Cost',
                        'stage': 'Planning',
                    },
                    'subproject_stage_-_corrected': {
                        'display': 'Subproject Stage Category',
                        'stage': 'Planning',
                    },
                    'under_validation': {
                        'display': 'Date Under Validation',
                        'stage': 'Planning',
                    },
                    'under_fs_/_ded_preparation': {
                        'display': 'Date Under FS/DED Preparation',
                        'stage': 'Planning',
                    },
                    'approved_by_rpab_for_submission_to_the_pso_for_review_/_endorsement_to_the_npco_for_nol_1': {
                        'display': 'Date Approved by RPAB',
                        'stage': 'Planning',
                    },
                    'endorsed_for_issuance_of_nol_1': {
                        'display': 'Date Endorsed for Issuance of NOL 1',
                        'stage': 'Planning',
                    },
                    'with_nol_1': {
                        'display': 'Date with NOL 1',
                        'stage': 'Planning',
                    },
                    're-issuance_of_nol_1': {
                        'display': 'Date of Re-issuance of NOL 1',
                        'stage': 'Procurement',
                    },
                    'with_nol_2': {
                        'display': 'Date with NOL 2',
                        'stage': 'Procurement',
                    },
                    'issuance_of_noa': {
                        'display': 'Date of Issuance of NOA',
                        'stage': 'Procurement',
                    },
                    'issuance_of_ntp': {
                        'display': 'Date of Issuance of NTP',
                        'stage': 'Procurement',
                    },
                    'target': {
                        'display': 'Target Physical Progress',
                        'stage': 'Implementation',
                    },
                    'actual_physical_progress': {
                        'display': 'Actual Physical Progress',
                        'stage': 'Implementation',
                    },
                    '1st_tranche_-target_date_of_release': {
                        'display': '1st Tranche -Target Date of Release',
                        'stage': 'Implementation',
                    },
                    '1st_tranche_-actual_date_of_release': {
                        'display': '1st Tranche -Actual Date of Release',
                        'stage': 'Implementation',
                    },
                    '1st_tranche_-total': {
                        'display': '1st Tranche of Financial Disbursement - Total',
                        'stage': 'Implementation',
                    },
                }
            },
            'gaa-2014': {
                'code': {
                    'display': 'FMRDP Project ID',
                    'stage': 'Planning',
                },
                'province': {
                    'display': 'Province',
                    'stage': 'Planning',
                },
                'municipality': {
                    'display': 'Municipality',
                    'stage': 'Planning',
                },
                'name': {
                    'display': 'Project Description (ePLC)',
                    'stage': 'Planning',
                },
                'meta': {
                    'project_id': {
                        'display': 'ePLC ID',
                        'stage': 'Planning',
                    },
                    'island': {
                        'display': 'Island Group',
                        'stage': 'Planning',
                    },
                    'region': {
                        'display': 'Region',
                        'stage': 'Planning',
                    },
                    'psgc_mun': {
                        'display': 'PSGC Municipality Level',
                        'stage': 'Planning',
                    },
                    'name': {
                        'display': 'Name of Project',
                        'stage': 'Planning',
                    },
                    'scope': {
                        'display': 'Scope of Project',
                        'stage': 'Planning',
                    },
                    'cost': {
                        'display': 'Cost of Project',
                        'stage': 'Planning',
                    },
                    'length': {
                        'display': 'Length of Project',
                        'stage': 'Planning',
                    },
                    'length_elev': {
                        'display': 'Elevated Length',
                        'stage': 'Planning',
                    },
                    'cost_revised': {
                        'display': 'Revised Cost (using Elevated Length)',
                        'stage': 'Planning',
                    },
                    'connectivity': {
                        'display': 'Connecting to National Road via',
                        'stage': 'Planning',
                    },
                    'project_cost': {
                        'display': 'Project Cost (ePLC)',
                        'stage': 'Planning',
                    },
                    'contract_start_date': {
                        'display': 'Contract Start Date (ePLC)',
                        'stage': 'Procurement',
                    },
                    'fs_type': {
                        'display': 'Fund Source Type (ePLC)',
                        'stage': 'Planning',
                    },
                    'project_location': {
                        'display': 'Project Location (ePLC)',
                        'stage': 'Planning',
                    },
                    'implementing_office': {
                        'display': 'Implementing office (ePLC)',
                        'stage': 'Implementation',
                    },
                    'project_contractor': {
                        'display': 'Project Contractor (ePLC)',
                        'stage': 'Procurement',
                    },
                    'actual_start_year': {
                        'display': 'Actual Start Year (ePLC)',
                        'stage': 'Implementation',
                    },
                    'actual_start_month': {
                        'display': 'Actual Start Month (ePLC)',
                        'stage': 'Implementation',
                    },
                    'actual_completion_year': {
                        'display': 'Actual Year of Completion (ePLC)',
                        'stage': 'Implementation',
                    },
                    'actual_completion_month': {
                        'display': 'Actual Month of Completion (ePLC)',
                        'stage': 'Implementation',
                    },
                    'physical_actual': {
                        'display': 'Actual Physical Progress (ePLC)',
                        'stage': 'Implementation',
                    },
                }
            },
            'gaa-2015': {
                'name': {
                    'display': 'Project Description (ePLC)',
                    'stage': 'Planning',
                },
                'code': {
                    'display': 'FMRDP Project ID',
                    'stage': 'Planning',
                },
                'province': {
                    'display': 'Province',
                    'stage': 'Planning',
                },
                'municipality': {
                    'display': 'Municipality',
                    'stage': 'Planning',
                },
                'meta': {
                    'project_id': {
                        'display': 'ePLC ID',
                        'stage': 'Planning',
                    },
                    'uacs_fpap_id': {
                        'display': 'UACS ID',
                        'stage': 'Planning',
                    },
                    'island': {
                        'display': 'Island Group',
                        'stage': 'Planning',
                    },
                    'region': {
                        'display': 'Region',
                        'stage': 'Planning',
                    },
                    'psgc_mun': {
                        'display': 'PSGC Municipality Level',
                        'stage': 'Planning',
                    },
                    'name': {
                        'display': 'Name of Project',
                        'stage': 'Planning',
                    },
                    'scope': {
                        'display': 'Scope of Project',
                        'stage': 'Planning',
                    },
                    'cost': {
                        'display': 'Cost of Project',
                        'stage': 'Planning',
                    },
                    'length': {
                        'display': 'Length of Project',
                        'stage': 'Planning',
                    },
                    'length_elev': {
                        'display': 'Elevated Length',
                        'stage': 'Planning',
                    },
                    'cost_revised': {
                        'display': 'Revised Cost (using Elevated Length)',
                        'stage': 'Planning',
                    },
                    'connectivity': {
                        'display': 'Connecting to National Road via',
                        'stage': 'Planning',
                    },
                    'project_cost': {
                        'display': 'Project Cost (ePLC)',
                        'stage': 'Planning',
                    },
                    'contract_start_date': {
                        'display': 'Contract Start Date (ePLC)',
                        'stage': 'Procurement',
                    },
                    'fs_type': {
                        'display': 'Fund Source Type (ePLC)',
                        'stage': 'Planning',
                    },
                    'project_location': {
                        'display': 'Project Location (ePLC)',
                        'stage': 'Planning',
                    },
                    'implementing_office': {
                        'display': 'Implementing office (ePLC)',
                        'stage': 'Implementation',
                    },
                    'project_contractor': {
                        'display': 'Project Contractor (ePLC)',
                        'stage': 'Procurement',
                    },
                    'actual_start_year': {
                        'display': 'Actual Start Year (ePLC)',
                        'stage': 'Implementation',
                    },
                    'actual_start_month': {
                        'display': 'Actual Start Month (ePLC)',
                        'stage': 'Implementation',
                    },
                    'actual_completion_year': {
                        'display': 'Actual Year of Completion (ePLC)',
                        'stage': 'Implementation',
                    },
                    'actual_completion_month': {
                        'display': 'Actual Month of Completion (ePLC)',
                        'stage': 'Implementation',
                    },
                    'physical_actual': {
                        'display': 'Actual Physical Progress (ePLC)',
                        'stage': 'Implementation',
                    },
                    'department': {
                        'display': 'Department Code Number (UACS)',
                        'stage': 'Planning',
                    },
                    'uacs_dpt_dsc': {
                        'display': 'Department Description (UACS)',
                        'stage': 'Planning',
                    },
                    'agency': {
                        'display': 'Agency Code Number (UACS)',
                        'stage': 'Planning',
                    },
                    'uacs_agy_dsc': {
                        'display': 'Agency Description (UACS)',
                        'stage': 'Planning',
                    },
                    'dsc': {
                        'display': 'Project Descriptrion (UACS)',
                        'stage': 'Planning',
                    },
                    'operunit': {
                        'display': 'Operating Unit (UACS)',
                        'stage': 'Planning',
                    },
                    'uacs_oper_dsc': {
                        'display': 'Operating Unit Description (UACS)',
                        'stage': 'Planning',
                    },
                    'uacs_reg_id': {
                        'display': 'Regional ID (UACS)',
                        'stage': 'Planning',
                    },
                    'fundcd': {
                        'display': 'Fund Code (UACS)',
                        'stage': 'Planning',
                    },
                    'uacs_fundsubcat_dsc': {
                        'display': 'Fund Subcategory Description (UACS)',
                        'stage': 'Planning',
                    },
                    'uacs_exp_cd': {
                        'display': 'Expenditure Code (UACS)',
                        'stage': 'Planning',
                    },
                    'uacs_exp_dsc': {
                        'display': 'Expenditure Description (UACS)',
                        'stage': 'Planning',
                    },
                    'uacs_sobj_cd': {
                        'display': 'Subobject Code (UACS)',
                        'stage': 'Planning',
                    },
                    'uacs_sobj_dsc': {
                        'display': 'Subobject Description (UACS)',
                        'stage': 'Planning',
                    },
                    'amt': {
                        'display': 'Project Amount (UACS)',
                        'stage': 'Planning',
                    },
                    'psgc_codes': {
                        'display': 'PSGC Municipality/City Level',
                        'stage': 'Planning',
                    },
                }
            },
            'bub': {
                'title': {
                    'display': 'Project Title',
                    'stage': 'Planning',
                },
                'code': {
                    'display': 'Subproject Identification No.',
                    'stage': 'Planning',
                },
                'project_type': {
                    'display': 'Project Type',
                    'stage': 'Planning',
                },
                'province': {
                    'display': 'Province',
                    'stage': 'Planning',
                },
                'municipality': {
                    'display': 'Municipality',
                    'stage': 'Planning',
                },
                'status': {
                    'display': 'Quarterly Physical Accomplishment',
                    'stage': 'Implementation',
                },
                'meta': {
                    'projects_agency_name': {
                        'display': 'Agency Name',
                        'stage': 'Planning',
                    },
                    'projects_psgc': {
                        'display': 'PSGC Municipality/City Level',
                        'stage': 'Planning',
                    },
                    'program_name': {
                        'display': 'Program Name',
                        'stage': 'Planning',
                    },
                    'projects_gaa_year': {
                        'display': 'GAA Year',
                        'stage': 'Planning',
                    },
                    'projects_gaa_budget': {
                        'display': 'GAA Budget',
                        'stage': 'Planning',
                    },
                    'projects_region': {
                        'display': 'Region',
                        'stage': 'Planning',
                    },
                    'reports_implementation_mode': {
                        'display': 'Implementation Mode',
                        'stage': 'Planning',
                    },
                    'reports_final_project_amount': {
                        'display': 'Final Project Amount',
                        'stage': 'Implementation',
                    },
                    'reports_quarterly_financial_disbursement': {
                        'display': 'Quarterly Financial Disbursement',
                        'stage': 'Implementation',
                    },
                    'reports_quarterly_cumulative_disbursement': {
                        'display': 'Quarterly Financial Disbursement',
                        'stage': 'Implementation',
                    },
                }
            },
            'trip': {
                'title': {
                    'display': 'Road Name',
                    'stage': 'Planning',
                },
                'code': {
                    'display': 'Project Code',
                    'stage': 'Planning',
                },
                'municipality': {
                    'display': 'Municipality',
                    'stage': 'Planning',
                },
                'province': {
                    'display': 'Province',
                    'stage': 'Planning',
                },
                'scope': {
                    'display': 'Scope of Work',
                    'stage': 'Planning',
                },
                'meta': {
                    'year_first_funded': {
                        'display': 'Year First Funded',
                        'stage': 'Planning',
                    },
                    'region': {
                        'display': 'Region',
                        'stage': 'Planning',
                    },
                    'road_classification_2': {
                        'display': 'Road Classification',
                        'stage': 'Planning',
                    },
                    '_total__project_length_km_': {
                        'display': 'Total Project Length (in kilometers)',
                        'stage': 'Planning',
                    },
                    '_total_project_cost_': {
                        'display': 'Total Project Cost',
                        'stage': 'Planning',
                    },
                    'tourism_destination': {
                        'display': 'Tourism Destination',
                        'stage': 'Planning',
                    },
                    'tourism_development_area': {
                        'display': 'Tourism Development Area',
                        'stage': 'Planning',
                    },
                }
            },
        }
        var program_fields = '';
        if(project.program == 'PRDP') {
            program_fields = 'prdp';
        }
        else if(project.program == 'BUB') {
            program_fields = 'bub';
        }
        else if(project.program == 'TRIP') {
            program_fields = 'trip';
        }
        else if(project.program == 'GAA') {
            if(project.code.indexOf('2015') != -1) {
                program_fields = 'gaa-2015';
            }
            else if(project.code.indexOf('2014') != -1) {
                program_fields = 'gaa-2014';
            }
        }
        for(x in fields[program_fields]) {
            var value = project[x];

            if(x == 'meta') {
                for(y in fields[program_fields][x]) {
                    try {
                        value = project[x][y];
                    }
                    catch(e) {
                        value = null;
                    }
                    if(!value) {
                        value = 'Not Available';
                    }

                    var li = '<li><p><span>' + fields[program_fields][x][y].display + '</span><b>' + value + '</b></p></li>';
                    appendListInfo(fields[program_fields][x][y].stage, li);
                }
            }
            else {
                if(!value) {
                    value = 'Not Available';
                }
                var li = '<li><p><span>' + fields[program_fields][x].display + '</span><b>' + project[x] + '</b></p></li>';
                appendListInfo(fields[program_fields][x].stage, li);
            }
        }
        $('#proj-details').removeClass('hidden');

    }
}

function appendListInfo(stage, li) {
    if(stage == 'Planning') {
        $('#projdetails .list-info').append(li);
    }
    else if(stage == 'Procurement') {
        $('#procdetails .list-info').append(li);
    }
    else if(stage == 'Implementation') {
        $('#contractdetails .list-info').append(li);
    }
}


function renderPhilGEPSDetails(project){
    if(project.philgeps){
        $('.proc-date-posted').text(moment(project.publish_date).format('MM/DD/YYYY'));
        $('.proc-bid-no').text(project.ref_no);
        $('.proc-fund-src').text(project.funding_source);
        $('.proc-bc').text(project.business_category);
        $('.proc-pm').text(project.procurement_mode);
        $('.proc-approved-budget').text('P ' + parseInt(project.approved_budget).formatMoney(2));

        $('#procdetails section').show()
        var bid_url = 'https://www.philgeps.gov.ph/GEPSNONPILOT/Tender/PrintableBidNoticeAbstractUI.aspx?refID=' + data.ref_id;
        $('.bid-notice-url').attr('href', bid_url);
        if(data.tender_status == 'Awarded') {
            var philgeps_award = 'http://api.data.gov.ph/catalogue/api/action/datastore_search_sql?sql=SELECT%20*%20from%20%22314aa773-e6e4-4554-80ce-4f588212e0d1%22%20WHERE%20ref_id%20=%20%27' + data.ref_id + '%27';
            $.getJSON(philgeps_award, function(award_resp) {
                var award_url = 'https://philgeps.gov.ph/GEPSNONPILOT/Tender/printableAwardNoticeAbstractPopUI.aspx?awardID=' + award_resp.result.records[0].award_id;
                $('.award-notice-url').attr('href', award_url).show();
            });
        }
        else {
            $('.award-notice-url').hide();
        }
        $('.bid-status-label').text(data.tender_status);
        $('.procurementdetails-fail, #procdetails section').hide();
    }
    else {
        clearPhilGEPSDetails();
    }
}

function hideAllTabs() {
    $('#projdetails .list-info, #procdetails .list-info, #procdetails .list-info2, #contractdetails .list-info').addClass('hidden');
}

function showPlanningTab() {
    hideAllTabs();
    $('#projdetails .list-info').removeClass('hidden');
}

function showProcurementTab() {
    hideAllTabs();
    $('#procdetails .list-info').removeClass('hidden');
    $('#procdetails .list-info2').removeClass('hidden');
}

function showImplementationTab() {
    hideAllTabs();
    $('#contractdetails .list-info').removeClass('hidden');
}

function clearPhilGEPSDetails(){
    $('#procdetails section').hide();
    // $('.procurementdetails-fail').show();
}


function clearProjectDetails(){
    // clear the project details view. hide it as well
    clearPhilGEPSDetails();
}


function toggleSelectProject(code){
    var current_selection = window.projects_database[code].selected;
    deselectAllProjects();
    console.log('toggleSelectProject', code);
    window.projects_database[code].selected = !current_selection;
    console.log('status', window.projects_database[code].selected);
    if(!window.projects_database[code].selected){
        deselectAllProjectDatasets(window.projects_database[code]);
    }

    // only load if it has never been loaded
    if(window.projects_database[code].selected && !window.projects_database[code].loaded){
        loadProject(code);
    }

    refreshViews();
}


function addProjectToSelection(code){
    console.log('addProjectToSelection', code);
    window.projects_database[code].selected = !window.projects_database[code].selected;
    console.log('status', window.projects_database[code].selected);
    if(!window.projects_database[code].selected){
        deselectAllProjectDatasets(window.projects_database[code]);
    }

    // only load if it has never been loaded
    if(window.projects_database[code].selected && !window.projects_database[code].loaded){
        loadProject(code);
    }

    refreshViews();
}


function toggleSelectDataset(code){
    console.log('toggleSelectDataset', code);
    window.datasets_database[code].selected = !window.datasets_database[code].selected;

    console.log('DATASET SELECTED', window.datasets_database[code]);
    refreshViews();
}


function resizeProjectsList(){
    var resize_to = $(window).height() - $("#topside").height();
    $("#botside").height(resize_to);
    // console.log('resize', resize_to);
}

function clearLocalStorage() {
    localStorage.removeItem('projects_database');
    location.reload();
}

$(window).resize(function() {
    resizeProjectsList();
}).resize();

document.onkeydown = function(e) {
    e = e || window.event;
    if(window.is_image_viewer_displayed) {
        if(e.keyCode == 38) {
            e.preventDefault();
            console.log('move forward');
            $('.btn-move-forward').trigger('click');
        }
        else if(e.keyCode == 40) {
            e.preventDefault();
            console.log('move backward');
            $('.btn-move-backward').trigger('click');
        }
        else if(e.keyCode == 37) {
            e.preventDefault();
            console.log('move prev');
            $("#proj-gallery-lightbox-v").slick('slickPrev');
        }
        else if(e.keyCode == 39) {
            e.preventDefault();
            console.log('move next');
            $("#proj-gallery-lightbox-v").slick('slickNext');
        }
    }
};
String.prototype.endsWith = function (str) {
    return this.slice(-str.length) === str;
}




/* Image Viewer Stuff */

function display_images(index){
    if(window.special_images_are_displayed){
        // do onothing
        console.log("SPECIAL IMAGES ARE DISPLAYED. DO NOTHING.");
        return;
    }
  // take grouped_images and render on a nice slick view
  // start from index
  window.images_are_displayed = true;
  window.is_image_viewer_displayed = true;

  if(index || index === 0){
    console.log(index);
    window.current_image_index = index;
  }

  var images_grouped_by_date = window.current_images[window.current_image_index];

  var date_length = countProperties(images_grouped_by_date);

  if(date_length > 1){
    display_multiple_date_images(images_grouped_by_date);
  }
  else {
    for(date in images_grouped_by_date){
        display_single_date_images(images_grouped_by_date[date]);
    }
  }

  trigger_opacity_of_forward_and_backward_buttons();

  display_timeline();

}


function reset_viewer(){
    try {
        $("#proj-gallery-lightbox-v").slick('unslick');
        $("#proj-gallery-lightbox-v").empty();
    }
    catch(e){
        console.log(e);
    }
}


function display_single_date_images(images){
  // takes one sets of images, and displays them.
  console.log("SINGLE", images);
  reset_viewer();

  var arranged_images_by_time = images
  console.log(arranged_images_by_time);
  arranged_images_by_time.sort(function(a,b ) {
    return moment(b.datetime) - moment(a.datetime);
  });
  console.log(arranged_images_by_time);

  for(var i = 0; i < images.length; i++) {
    var image = images[i];

    var road_class = (image.road_class) ? image.road_class : 'Click to set',
        road_quality = (image.road_quality) ? image.road_quality : 'Click to set',
        road_width = (image.road_width) ? image.road_width : 'Click to set';

    road_class = (image.surface) ? image.surface : 'Click to set';
    road_quality = (image.quality) ? image.quality : 'Click to set';

    road_width = road_width.replace('Meters', '').replace('M', '').replace('m', '');
    if(road_width != 'Click to set') {
      road_width += ' Meters';
    }

    surface_val = return_surface_value_html(image);
    quality_val = return_surface_quality_html(image);
    var code = image.project_code;

    var comments = '';

    var concrete_checked = checkbox_html_for_surface(image, 'CONCRETE');
    var asphalt_checked = checkbox_html_for_surface(image, 'ASPHALT');
    var gravel_checked = checkbox_html_for_surface(image, 'GRAVEL');
    var earth_checked = checkbox_html_for_surface(image, 'EARTH');

    var good_checked = checkbox_html_for_quality(image, 'GOOD');
    var fair_checked = checkbox_html_for_quality(image, 'FAIR');
    var poor_checked = checkbox_html_for_quality(image, 'POOR');
    var bad_checked = checkbox_html_for_quality(image, 'BAD');

    var image_date = image.datetime;
    if(!image_date) {
        image_date = image.date;
    }

    var html = '<div class="individual-image-wrapper"> \
    <div class="date-time-image"><span>Location:</span> <b>' + image.latlng + '</b><br/><span>Time:</span> <b>' + moment(image_date, 'YYYY:MM:DD HH:mm:ss').add(8, 'hours').format('MMMM DD, YYYY H:mm A') + '</b></div> \
    <a href="' + image['image'].file_url + '" target="_blank" class="fa fa-download dl-img-btn tooltip" title="Download Image">&nbsp;</a> \
    <img src="' + image['image']['serving_url'] + '" alt=""> \
    <div class="road-details-wrapper" data-image-id="' + image.id + '" data-image-url="' + image.image.file_url + '" data-image-serving-url="' + image.image.serving_url + '" data-project="' + image.project_code + '" data-latlng="' + image.latlng + '" id="road-details-wrapper">\
      <div class="surface-wrapper" data-img-id="'+image.id+'"> \
          <span class="selectSurface-label">Surface: </span> \
          <span class="surface-val click_surface_val" id="surface-val" data-img-id="'+image.id+'">' + surface_val + '</span> \
      </div> \
      <div class="select-surface clearfix none" id="select-surface" data-img-id="'+image.id+'">\
        <label class="block" data-surface="concrete"><input type="checkbox" name="concrete" value="concrete" ' + concrete_checked + ' class="inline-block surface-selection"/><img src="/images/icn-concrete.jpg" class="inline-block"/> Concrete</label> \
        <label class="block" data-surface="asphalt"><input type="checkbox" name="asphalt" value="asphalt" ' + asphalt_checked + ' class="inline-block surface-selection"/><img src="/images/icn-asphalt.jpg" class="inline-block"/> Asphalt</label> \
        <label class="block" data-surface="gravel"><input type="checkbox" name="gravel" value="gravel" ' + gravel_checked + ' class="inline-block surface-selection"/><img src="/images/icn-gravel.jpg" class="inline-block"/> Gravel</label> \
        <label class="block" data-surface="earth"><input type="checkbox" name="earth" value="earth" ' + earth_checked + ' class="inline-block surface-selection"/><img src="/images/icn-earth.jpg" class="inline-block"/> Earth</label> \
      </div> \
        <div class="quality-wrapper" data-img-id="'+image.id+'"> \
          <span class="selectQuality-label">Quality: </span> \
          <span class="quality-val click_quality_val" data-img-id="'+image.id+'">' + quality_val + '</span> \
        </div> \
        <div class="select-quality clearfix none" id="select-quality" data-img-id="'+image.id+'">\
            <form style="margin-bottom: 0;"><label class="block" data-quality="concrete"><input type="radio" name="quality" value="good" ' + good_checked + ' class="inline-block quality-selection"/><img src="/images/icn-good.jpg" class="inline-block"/> Good</label> \
            <label class="block" data-quality="asphalt"><input type="radio" name="quality" value="fair" ' + fair_checked + ' class="inline-block quality-selection"/><img src="/images/icn-fair.jpg" class="inline-block"/> Fair</label> \
            <label class="block" data-quality="gravel"><input type="radio" name="quality" value="poor" ' + poor_checked + ' class="inline-block quality-selection"/><img src="/images/icn-poor.jpg" class="inline-block"/> Poor</label> \
            <label class="block" data-quality="earth"><input type="radio" name="quality" value="bad" ' + bad_checked + ' class="inline-block quality-selection"/><img src="/images/icn-bad.jpg" class="inline-block"/> Bad</label></form> \
          </div> \
        <div class="set-width-menu" id="set-width-menu">\
          <ul>\
            <li> <form action="" class="width-form"> <input type="text" placeholder="Set manually in meters..."><input type="submit" value="OK"></form></li> \
            <li><a href="#" class="">Same As Last</a></li> \
          </ul> \
        </div>\
        <a class="width-btn" href="#">Width: <span>' + road_width + '</span></a> \
    </div> \
    <div class="road-class-big" data-id="' + image.id + '">Concrete, Asphalt, Gravel, earth / Good, Fair, Poor, Bad</div> \
    </div>';
    $('#proj-gallery-lightbox-v').prepend(html);
  }

  // set_image_viewer_overlays();

  display_viewer(images.length);
  $('.choose-date-wrapper, .view-dates').addClass('hidden');

  // create array of dates
  var dates = new Array();
  push_to_array_if_unique(dates, moment(images[0].datetime, 'YYYY:MM:DD HH:mm:ss').format('YYYY-MM-DD')); // just get the first image.
  // display_dates_in_viewer(dates);

  // if (images.length > 1) {
  //   var face = 0;
  //   for(var i = 0; i < item_length; i++) {
  //     if(project.image_groups[index[2]][index[1]][i].face == 'front') {
  //       face = i;
  //       break;
  //     }
  //   }
  //   $('#proj-gallery-lightbox-v').slick('slickGoTo', face);
  // }

} // end of display_single_date_images()

function display_dates_in_viewer(dates){
    $('.image-dates, .chosen-date').empty();
    for(var i = 0; i < dates.length; i++) {
        $('.image-date-select, .chosen-date').append('<option value="' + dates[i] + '">' + dates[i] + '</option>');
        if(i == 0) {
            $('.image-dates').append('<label><input checked="" type="checkbox" name="image-dates" value="' + dates[i] + '">' + dates[i] + '</option></label>');
        }
        else {
            $('.image-dates').append('<label><input type="checkbox" name="image-dates" value="' + dates[i] + '">' + dates[i] + '</option></label>');
        }
    }
    $('.choose-date-wrapper, .view-dates').removeClass('hidden');
    $('.chosen-date').val(window.current_dates_selected);
    $('.chosen-date').trigger('chosen:updated');
}

function return_surface_value_html(image) {
    var html = '<span class="inline-block one-surface">';
    if(image.surface_types){
        var surface_types = image.surface_types.split(',');
        if(surface_types.length > 1){
            for(var i=0; i<surface_types.length; i++){
                if(surface_types[i] == 'CONCRETE'){
                    html += '<img src="/images/icn-concrete.jpg" class="inline-block"/>';
                }
                if(surface_types[i] == 'ASPHALT'){
                    html += '<img src="/images/icn-asphalt.jpg" class="inline-block"/>';
                }
                if(surface_types[i] == 'GRAVEL'){
                    html += '<img src="/images/icn-gravel.jpg" class="inline-block"/>';
                }
                if(surface_types[i] == 'EARTH'){
                    html += '<img src="/images/icn-earth.jpg" class="inline-block"/>';
                }
            }
        }
        else {
            if(surface_types[0] == 'CONCRETE'){
                html += '<img src="/images/icn-concrete.jpg" class="inline-block"/> Concrete';
            }
            if(surface_types[0] == 'ASPHALT'){
                html += '<img src="/images/icn-asphalt.jpg" class="inline-block"/> Asphalt';
            }
            if(surface_types[0] == 'GRAVEL'){
                html += '<img src="/images/icn-gravel.jpg" class="inline-block"/> Gravel';
            }
            if(surface_types[0] == 'EARTH'){
                html += '<img src="/images/icn-earth.jpg" class="inline-block"/> Earth';
            }
        }
    }
    else if(image.surface_type){
        var surface_type = image.surface_type;
        if(surface_type == 'CONCRETE'){
            html += '<img src="/images/icn-concrete.jpg" class="inline-block"/> Concrete';
        }
        if(surface_type == 'ASPHALT'){
            html += '<img src="/images/icn-asphalt.jpg" class="inline-block"/> Asphalt';
        }
        if(surface_type == 'GRAVEL'){
            html += '<img src="/images/icn-gravel.jpg" class="inline-block"/> Gravel';
        }
        if(surface_type == 'EARTH'){
            html += '<img src="/images/icn-earth.jpg" class="inline-block"/> Earth';
        }
    }

    else {
        html += 'Click to set';
    }

    html += '</span>';
    return html;
}


function return_surface_quality_html(image){
    var html = '<span class="inline-block one-surface">';
    if(image.surface_quality){
        var surface_quality = image.surface_quality;
        if(surface_quality == 'GOOD'){
            html += '<img src="/images/icn-good.jpg" class="inline-block"/> Good';
        }
        if(surface_quality == 'FAIR'){
            html += '<img src="/images/icn-fair.jpg" class="inline-block"/> Fair';
        }
        if(surface_quality == 'POOR'){
            html += '<img src="/images/icn-poor.jpg" class="inline-block"/> Poor';
        }
        if(surface_quality == 'BAD'){
            html += '<img src="/images/icn-bad.jpg" class="inline-block"/> Bad';
        }
    }

    else {
        html += 'Click to set';
    }

    html += '</span>';
    return html;
}



function display_multiple_date_images(images_grouped_by_date){
  // takes multiple sets of images and displays them all
  console.log("MULTIPLE", images_grouped_by_date);

  reset_viewer();
  if(Object.keys(images_grouped_by_date) > 1) {
      display_dates_in_viewer(Object.keys(images_grouped_by_date));
  }
  else {
      $('.choose-date-wrapper, .view-dates').addClass('hidden');
  }

  var grouped_images = new Array();
  var last_index = 0;
  var date_count = 0;

  while(last_index < 100){
    var current_batch = new Array();
    for(date in images_grouped_by_date){
      if(!window.current_dates_selected.length) {
        window.current_dates_selected = Object.keys(images_grouped_by_date);
      }
      var dates = window.current_dates_selected;
      if(dates.indexOf(date) == -1) {
        continue;
      }
      if(images_grouped_by_date[date][last_index]){
        // contains an image. add to array
        current_batch.push(images_grouped_by_date[date][last_index]);
      }
      else {
        current_batch.push(null);
      }
    }
    var nothing_in_this_batch = true;
    for(var k=0; k<current_batch.length; k++){
      if(current_batch[k]){
        nothing_in_this_batch = false;
      }
    }
    if(nothing_in_this_batch){
      break;
    }

    last_index += 1;
    if(current_batch.length){
      grouped_images.push(current_batch);
    }
    else {
      break;
    }
  }

  // create array of dates
  var dates = new Array();
  for(var i=0; i < grouped_images.length; i++){
    for(var j=0; j < grouped_images[i].length; j++){
      if(grouped_images[i][j]){
          push_to_array_if_unique(dates, moment(grouped_images[i][j].datetime, 'YYYY:MM:DD HH:mm:ss').format('YYYY-MM-DD'));
      }
    }
  }

  for(var i=0; i < grouped_images.length; i++){
    var html = '<div>';
    for(var j = 0; j < dates.length; j++) {
      var image = grouped_images[i][j];
      if(image){
        var road_class = (image.road_class) ? image.road_class : 'Click to set',
            road_quality = (image.road_quality) ? image.road_quality : 'Click to set',
            road_width = (image.road_width) ? image.road_width : 'Click to set';
        road_class = (image.surface) ? image.surface : 'Click to set';
        road_quality = (image.quality) ? image.quality : 'Click to set';
        road_width = road_width.replace('Meters', '').replace('M', '').replace('m', '');
        if(road_width != 'Click to set') {
          road_width += ' Meters';
        }

        var road_quality_icon = 'good';
        if(road_quality == 'Good'){
          road_quality_icon = 'good';
        }
        else if(road_quality == 'Fair'){
          road_quality_icon = 'fair';
        }
        else if(road_quality == 'Poor'){
          road_quality_icon = 'poor';
        }
        else if(road_quality == 'Bad'){
          road_quality_icon = 'bad';
        }
        surface_val = return_surface_value_html(image);
        quality_val = return_surface_quality_html(image);

        var concrete_checked = checkbox_html_for_surface(image, 'CONCRETE');
        var asphalt_checked = checkbox_html_for_surface(image, 'ASPHALT');
        var gravel_checked = checkbox_html_for_surface(image, 'GRAVEL');
        var earth_checked = checkbox_html_for_surface(image, 'EARTH');

        var good_checked = checkbox_html_for_quality(image, 'GOOD');
        var fair_checked = checkbox_html_for_quality(image, 'FAIR');
        var poor_checked = checkbox_html_for_quality(image, 'POOR');
        var bad_checked = checkbox_html_for_quality(image, 'BAD');

        var comments = '';

        var code = image.project_code;

        var image_date = image.datetime;
        if(!image_date) {
            image_date = image.date;
        }

        html += '<div class="individual-image-wrapper"> \
        <div class="date-time-image"><span>Location:</span> <b>' + image.latlng + '</b><br/><span>Time:</span> <b>' + moment(image_date, 'YYYY:MM:DD HH:mm:ss').add(8, 'hours').format('MMMM DD, YYYY H:mm A') + '</b></div> \
        <a href="' + image['image'].file_url + '" target="_blank" class="fa fa-download dl-img-btn tooltip" title="Download Image">&nbsp;</a> \
        <img src="' + image['image']['serving_url'] + '" alt=""> \
        <div class="road-details-wrapper" data-image-id="' + image.id + '" data-image-url="' + image.image.file_url + '" data-image-serving-url="' + image.image.serving_url + '" data-project="' + image.project_code + '" data-latlng="' + image.latlng + '" id="road-details-wrapper">\
          <div class="surface-wrapper" data-img-id="'+image.id+'"> \
              <span class="selectSurface-label">Surface: </span> \
              <span class="surface-val click_surface_val" id="surface-val" data-img-id="'+image.id+'">' + surface_val + '</span> \
          </div> \
          <div class="select-surface clearfix none" id="select-surface" data-img-id="'+image.id+'">\
            <label class="block" data-surface="concrete"><input type="checkbox" name="concrete" value="concrete" ' + concrete_checked + ' class="inline-block surface-selection"/><img src="/images/icn-concrete.jpg" class="inline-block"/> Concrete</label> \
            <label class="block" data-surface="asphalt"><input type="checkbox" name="asphalt" value="asphalt" ' + asphalt_checked + ' class="inline-block surface-selection"/><img src="/images/icn-asphalt.jpg" class="inline-block"/> Asphalt</label> \
            <label class="block" data-surface="gravel"><input type="checkbox" name="gravel" value="gravel" ' + gravel_checked + ' class="inline-block surface-selection"/><img src="/images/icn-gravel.jpg" class="inline-block"/> Gravel</label> \
            <label class="block" data-surface="earth"><input type="checkbox" name="earth" value="earth" ' + earth_checked + ' class="inline-block surface-selection"/><img src="/images/icn-earth.jpg" class="inline-block"/> Earth</label> \
          </div> \
            <div class="quality-wrapper" data-img-id="'+image.id+'"> \
          <span class="selectQuality-label">Quality: </span> \
          <span class="quality-val click_quality_val" data-img-id="'+image.id+'">' + quality_val + '</span> \
        </div> \
        <div class="select-quality clearfix none" id="select-quality" data-img-id="'+image.id+'">\
            <form style="margin-bottom: 0;"><label class="block" data-quality="concrete"><input type="radio" name="quality" value="good" ' + good_checked + ' class="inline-block quality-selection"/><img src="/images/icn-good.jpg" class="inline-block"/> Good</label> \
            <label class="block" data-quality="asphalt"><input type="radio" name="quality" value="fair" ' + fair_checked + ' class="inline-block quality-selection"/><img src="/images/icn-fair.jpg" class="inline-block"/> Fair</label> \
            <label class="block" data-quality="gravel"><input type="radio" name="quality" value="poor" ' + poor_checked + ' class="inline-block quality-selection"/><img src="/images/icn-poor.jpg" class="inline-block"/> Poor</label> \
            <label class="block" data-quality="earth"><input type="radio" name="quality" value="bad" ' + bad_checked + ' class="inline-block quality-selection"/><img src="/images/icn-bad.jpg" class="inline-block"/> Bad</label></form> \
          </div> \
            <div class="set-width-menu" id="set-width-menu">\
              <ul>\
                <li> <form action="" class="width-form"> <input type="text" placeholder="Set manually in meters..."><input type="submit" value="OK"></form></li> \
                <li><a href="#" class="">Same As Last</a></li> \
              </ul> \
            </div>\
            <a class="width-btn" href="#">Width: <span>' + road_width + '</span></a> \
        </div> \
        <div class="road-class-big" data-id="' + image.id + '">Concrete, Asphalt, Gravel, earth / Good, Fair, Poor, Bad</div> \
        </div> \
        ';
      }
      else {
        html += '<div class="individual-image-wrapper">&nbsp;</div>';
      }
    }
    html += '</div>';
    $('#proj-gallery-lightbox-v').prepend(html);
  }

  // set_image_viewer_overlays();

  display_viewer(grouped_images.length);

  // display_dates_in_viewer(dates);
}




function display_viewer(number_of_slides){
  $("#proj-gallery-lightbox-v").slick({
    slidesToShow: getSlidesToShow(number_of_slides),
    initialSlide: (number_of_slides - 1),
    speed: 0,
    slidesToScroll: 1,
    centerMode: true,
    focusOnSelect: true,
    // adaptiveHeight: true,
    prevArrow: "<button class='left-gallery-nav'><i class='fa fa-chevron-left'></i></button>",
    nextArrow: "<button class='right-gallery-nav'><i class='fa fa-chevron-right'></i></button>",
    variableWidth: true,
    accessibility: true,
  });

  $("#protocol_viewer").css("display","block");
}




function move_forward(){
  var new_index = window.current_image_index + 1;
  if(get_images_by_index(new_index)){
    window.current_image_index += 1;
    display_images();
  }
  else {
    // reached the end. do nothing.
    console.log('reached the end. do nothing.');
  }
}


function move_backward(){
  var new_index = window.current_image_index - 1;

  if(new_index < 0){
    // reached the end. do nothing.
    return;
  }

  if(get_images_by_index(new_index)){
    window.current_image_index -= 1;
    display_images();
  }
  else {
    // no images there. do nothing. weird though.
    console.log("WEIRD BEHAVIOR. Index not at zero, but images not available.");
  }
}


function get_images_by_index(index){
  if(window.current_images[index]){
    return window.current_images[index];
  }
  else {
    return null;
  }
}


function trigger_opacity_of_forward_and_backward_buttons() {
  if (get_images_by_index(window.current_image_index + 1)) {
    $('.btn-move-forward').css('opacity', '1');
  } else {
    $('.btn-move-forward').css('opacity', '0.5');
  }

  if(window.current_image_index <= 0){
    $('.btn-move-backward').css('opacity', '0.5');
  }
  else {
    $('.btn-move-backward').css('opacity', '1');
  }
}




// function set_image_viewer_overlays(){
//   $('.width-form').on('submit', function(e) {
//     e.preventDefault();
//     var image_id = $(this).parents('#road-details-wrapper').attr('data-image-id'),
//         width = $(this).children('input[type="text"]').val();
//     console.log(update_road('WIDTH', image_id, width));
//   });

//   $('.set-width-toggle').on('click', function() {
//     $('.tricycle-form').children('input[type="hidden"]').val($(this).parents('#road-details-wrapper').attr('data-image-id'));
//     $('.img-road-width').attr('src', $(this).parents('#road-details-wrapper').siblings('img').attr('src'));
//   });

//   $(".toggle-road").on("click", function(){
//     var id = $(this).data("toggleroad-id");
//     if($(this).hasClass('this-not-road')) {
//       $(this).removeClass('this-not-road');
//       $(this).addClass('this-road');
//     }else {
//       $(this).removeClass('this-road');
//       $(this).addClass('this-not-road');
//     }
//     $(".road-details-wrapper[data-image-id="+id+"]").toggle();

//   });

//   var surfacehtml = "";
//   var scount = 0;
//   var surfaceArr  = new Array();

//   var selectable_multiple = [
//     ".select-surface label",
//     ".select-surface input[type='checkbox']"
//   ];

//   $(document).on("click",selectable_multiple.join(),function(){
//       var s = $(this).data("surface");

//       console.log(scount + "count");
//       console.log('CHECK', this);
//       if($(this).hasClass('selected')) {
//           // $(this).removeClass('selected');
//            // $(this).find("input[type='checkbox']").prop('checked', false);
//           surfaceArr.remove(s);
//       }else {
//         switch(s){
//             case "concrete":
//               if(surfaceArr.indexOf("concrete") == -1){
//                 surfaceArr.push("concrete");
//                 $(this).find("input[type='checkbox']").prop('checked', true);
//               }
//               else {
//                 surfaceArr.splice(surfaceArr.indexOf("concrete"), 1);
//                 $(this).find("input[type='checkbox']").prop('checked', false);
//               }
//             break;
//             case "asphalt":
//               if(surfaceArr.indexOf("asphalt") == -1){
//                 surfaceArr.push("asphalt");
//                 $(this).find("input[type='checkbox']").prop('checked', true);
//               }
//               else {
//                 surfaceArr.splice(surfaceArr.indexOf("asphalt"), 1);
//                 $(this).find("input[type='checkbox']").prop('checked', false);
//               }
//             break;
//             case "gravel":
//               if(surfaceArr.indexOf("gravel") == -1){
//                 surfaceArr.push("gravel");
//                 $(this).find("input[type='checkbox']").prop('checked', true);
//               }
//               else {
//                 surfaceArr.splice(surfaceArr.indexOf("gravel"), 1);
//                 $(this).find("input[type='checkbox']").prop('checked', false);
//               }
//             break;
//             case "earth":
//               if(surfaceArr.indexOf("earth") == -1){
//                 surfaceArr.push("earth");
//                 $(this).find("input[type='checkbox']").prop('checked', true);
//               }
//               else {
//                 surfaceArr.splice(surfaceArr.indexOf("earth"), 1);
//                 $(this).find("input[type='checkbox']").prop('checked', false);
//               }
//             break;
//         }
//         scount = scount + 1;
//         var k = $(this).firstElementChild;
//         // $(this).find("input[type='checkbox']").prop('checked', true);
//         // $(this).addClass('selected');
//       }
//       console.log(surfaceArr);
//   });

//   $(".slickimg").on("click", function(){
//     var id = $(this).data("img-id");
//     // hide set width menu list item

//     $(".set-width-menu").hide();
//     $(".comments-wrapper").hide();
//     $(".num-comments-wrapper").show();
//     // hide quality list
//     if($(".quality-wrapper[data-img-id="+id+"] .selectboxit-list").css('display') == "block") {
//         $(".quality-wrapper[data-img-id="+id+"] .selectboxit-list").hide();
//     }

//     // display chosen type of surfaces and hide
//     if($(".select-surface[data-img-id="+id+"]").hasClass('display')) {
//       $(".surface-val[data-img-id="+id+"]").html("");
//       if(surfaceArr.length > 1) {
//         for(var i = 0; i < surfaceArr.length; i++) {
//             var b = surfaceArr[i];

//             switch(b) {
//               case "concrete":
//                   surfacehtml+= '<img src="/images/icn-concrete.jpg" class="inline-block"/> ';
//               break;
//               case "asphalt":
//                   surfacehtml+= '<img src="/images/icn-asphalt.jpg" class="inline-block"/> ';
//               break;
//               case "gravel":
//                 surfacehtml+= '<img src="/images/icn-gravel.jpg" class="inline-block"/> ';

//               break;
//               case "earth":
//                 surfacehtml+= '<img src="/images/icn-earth.jpg" class="inline-block"/>';
//               break;
//             }
//         }
//       }else {
//         var s = surfaceArr[0];
//         console.log(s);
//         if(s != undefined) {
//           switch(s){
//               case "concrete":
//                   surfacehtml+= '<span class="inline-block one-surface"><img src="/images/icn-concrete.jpg" class="inline-block"/> Concrete</span> ';
//               break;
//               case "asphalt":
//                 surfacehtml+= '<span class="inline-block one-surface"><img src="/images/icn-asphalt.jpg" class="inline-block"/> Asphalt</span> ';

//               break;
//               case "gravel":
//                   surfacehtml+= '<span class="inline-block one-surface"><img src="/images/icn-gravel.jpg" class="inline-block"/> Gravel</span> ';

//               break;
//               case "earth":
//                   surfacehtml+= '<span class="inline-block one-surface"><img src="/images/icn-earth.jpg" class="inline-block"/> Earth</span>';

//               break;
//           }
//         }else {
//           surfacehtml += 'Click to set';

//         }

//       }
//       console.log(surfacehtml);
//       $(".surface-val[data-img-id="+id+"]").html(surfacehtml);
//       surfacehtml = "";
//       if($(".select-surface[data-img-id="+id+"]").hasClass('display')) {
//         $(".select-surface[data-img-id="+id+"]").removeClass('display');
//         $(".select-surface[data-img-id="+id+"]").addClass('none');
//       }
//     } // end if select surface has class of display


//   });

//   $(".surface-wrapper .surface-val").on("click", function(){
//     var id = $(this).data("img-id");
//     console.log("id");
//    $(".comments-wrapper").hide();
//    $(".num-comments-wrapper").show();

//    // hide quality list
//     if($(".quality-wrapper[data-img-id="+id+"] .selectboxit-list").css('display') == "block") {
//           $(".quality-wrapper[data-img-id="+id+"] .selectboxit-list").hide();
//       }

//     $(".set-width-menu").hide();
//     var selectSurface = $(".select-surface[data-img-id="+id+"]");
//       if(selectSurface.hasClass('none')) {

//         selectSurface.removeClass('none');
//         selectSurface.addClass('display');

//       }else {

//         selectSurface.removeClass('display');
//         selectSurface.addClass('none');

//         $(this).html("");
//         if(surfaceArr.length > 1) {
//           for(var i = 0; i < surfaceArr.length; i++) {
//               var b = surfaceArr[i];

//               switch(b) {
//                 case "concrete":
//                     surfacehtml+= '<img src="/images/icn-concrete.jpg" class="inline-block"/> ';
//                 break;
//                 case "asphalt":
//                     surfacehtml+= '<img src="/images/icn-asphalt.jpg" class="inline-block"/> ';
//                 break;
//                 case "gravel":
//                   surfacehtml+= '<img src="/images/icn-gravel.jpg" class="inline-block"/> ';

//                 break;
//                 case "earth":
//                   surfacehtml+= '<img src="/images/icn-earth.jpg" class="inline-block"/>';
//                 break;
//               }
//           }
//         }else {
//           var s = surfaceArr[0];
//           if(s != undefined) {
//             switch(s){
//                 case "concrete":
//                     surfacehtml+= '<span class="inline-block one-surface"><img src="/images/icn-concrete.jpg" class="inline-block"/> Concrete</span> ';
//                 break;
//                 case "asphalt":
//                   surfacehtml+= '<span class="inline-block one-surface"><img src="/images/icn-asphalt.jpg" class="inline-block"/> Asphalt</span> ';

//                 break;
//                 case "gravel":
//                     surfacehtml+= '<span class="inline-block one-surface"><img src="/images/icn-gravel.jpg" class="inline-block"/> Gravel</span> ';

//                 break;
//                 case "earth":
//                     surfacehtml+= '<span class="inline-block one-surface"><img src="/images/icn-earth.jpg" class="inline-block"/> Earth</span>';

//                 break;
//             }
//           }else {
//             console.log("empty");
//             surfacehtml += "Click to set";
//           }

//         }
//         console.log(surfacehtml);
//         $(this).html(surfacehtml);
//         surfacehtml = "";
//         var slick_active = $(this).parents('.slick-active');
//         var image_id = $(this).parents('.road-details-wrapper').attr('data-image-id');
//         var image_url =  $(this).parents('.road-details-wrapper').attr('data-image-url');
//         var image_serving_url =  $(this).parents('.road-details-wrapper').attr('data-image-serving-url');
//         var image_project = $(this).parents('.road-details-wrapper').attr('data-project');
//         var image_latlng = $(this).parents('.road-details-wrapper').attr('data-latlng');
//         console.log("WAAAAAAAH");
//         console.log(update_road('SURFACE', image_id, surfaceArr, image_serving_url, image_url, image_project, image_latlng, this));
//         surfaceArr = [];
//       } // end of else
//   });

//   $(".width-btn").on("click", function(){
//     $('.set-width-menu').toggle();
//     $(".comments-wrapper").hide();
//     $(".num-comments-wrapper").show();
//     if($(".select-surface").hasClass('display')) {
//       $(".select-surface").removeClass('display');
//       $(".select-surface").addClass('none');
//     }
//   });

//   $(".select-quality").selectBoxIt({
//         showFirstOption: false,
//         nativeMousedown: true
//   });

//   $('.select-surface').on('change', function() {
//     var image_id = $(this).parents('.road-details-wrapper').attr('data-image-id');
//     var image_url = $(this).parents('.road-details-wrapper').attr('data-image-url');
//     var image_project = $(this).parents('.slick-active').children('img').attr('src');
//     var surface = $(this).val();
//     console.log('surface type', image_url);
//     console.log('surface type id', image_id);
//     console.log('surface type project', image_project);
//     console.log(update_road('SURFACE', image_id, surface, image_url));
//   });

//   $('.select-quality').on('change', function() {
//     var image_id = $(this).parents('.road-details-wrapper').attr('data-image-id');
//     var image_url = $(this).parents('.road-details-wrapper').attr('data-image-url');
//     var quality = $(this).val();
//     var image_project = $(this).parents('.road-details-wrapper').attr('data-project');
//     var image_latlng = $(this).parents('.road-details-wrapper').attr('data-latlng');
//     if($(this).parents('.individual-image-wrapper').length) {
//       image_url = $(this).parents('.individual-image-wrapper').children('img').attr('src');
//     }
//     console.log(this);
//     console.log(update_road('QUALITY', image_id, quality, image_serving_url, image_url, image_project, image_latlng, this));
//   });


//   $(".dragTricycle").draggable();

//   $('.road-class').on('click', function() {
//     if(!$(this).hasClass('login-geostore')) {
//       $(this).toggle(function() {
//         var iid = $(this).siblings('.road-class-big');
//         iid.html(road_class_form(iid.attr('data-id')));
//         iid.toggle();
//       });
//     }
//   });

//   $('.road-class-big').on('click', '.road-class-close', function() {
//       $(this).parent().toggle(function() {
//       $(this).siblings('.road-class').toggle();
//     });
//   });

//   $('.road-class-big').on('click', '.road-class-submit', function() {
//     var road_class = $(this).parent().find('input[name="road-class"]:checked').val();
//     var road_quality = $(this).parent().find('input[name="road-quality"]:checked').val();
//     var iid = $(this).parent().attr('data-id');
//     submit_road_class(iid, road_class, road_quality, this);
//     $(this).siblings('.road-class-close').trigger('click');
//   });

//   $('.comment-this-image').on('keydown', function(e) {
//     var key = e.which;
//     if(key == 13) {
//       e.preventDefault();
//       $(this).attr('disabled', '');
//       var comment = $(this).val(),
//       image = $(this).data('image'),
//       project_code = $(this).data('project');
//       name = $(this).data('project-name');
//       id = $(this).data('project-id');
//       post_image_comment(project_code, image, comment, name, id, this);
//     }
//   });
// }

function push_to_array_if_unique(arr, element){
  if(arr.indexOf(element) == -1){
    arr.push(element);
  }
}



function display_timeline(){
  // just use the number of geotagged locations
  var total = window.current_images.length;
  var step = 1;
  var force_break = false;

  var cummulative_distance = 0.00;

  if(total > 34){
    step = parseInt(total/34) + 1;
  }

  $('ul.photo-timeline').empty();

  var i = 0;
  var count = 1;
  while(i < total){
    count++;
    if(count > 1000){
      break;
    }
    var current_date = get_date_to_use_for_timeline(get_object_keys(window.current_images[i]))
    // console.log('current_date', current_date);
    var scale_result = "";

    var new_step = step - 1;

    if(i > new_step) {
        // console.log(new_step, i);
      var tmp_src = window.current_images[i][current_date][0].latlng;
      var tmp = tmp_src.split(',');

      var tmp2_src = window.current_images[i - step][get_date_to_use_for_timeline(get_object_keys(window.current_images[i - step]))][0].latlng;
      var tmp2 = tmp2_src.split(',');

      var scale = new google.maps.LatLng(tmp[0], tmp[1]);
      var scale2 = new google.maps.LatLng(tmp2[0], tmp2[1]);

      var scale_result = getDistance(scale, scale2);


      cummulative_distance += scale_result;

      scale_result = scale_result.toFixed(2) + ' meters';

    }
    else {
      scale_result = 'Start';

    }

    var rtype = '';
    var rquality = '';
    // get any that you can
    for(var j=i; j<i+step; j++){
        if(!window.current_images[j]){
            break;
        }
        var rtype = get_any_surface_type(window.current_images[j][current_date]);
        if(rtype){
            break;
        }
    }
    for(var j=i; j<i+step; j++){
        if(!window.current_images[j]){
            break;
        }
        var rquality = get_any_surface_quality(window.current_images[j][current_date]);
        if(rquality){
            break;
        }
    }

    // console.log("RTYPE", rtype);
    // console.log("RQUALITY", rquality);

    if(i <= window.current_image_index){
      $('ul.photo-timeline').append('<li class="progress-timeline-marker" title="Distance from previous point: ' + scale_result + '" data-info="" data-marker-index="' + i + '"><div class="progress-timeline-line active"></div><i class="img-available"></i><span class="active"></span><div class="road-class-info ' + rquality + ' ' + rtype + '">X</div></li>');
      set_distance_from_start(cummulative_distance);
    }
    else {
      $('ul.photo-timeline').append('<li class="progress-timeline-marker" title="Distance from previous point: ' + scale_result + '" data-info="" data-marker-index="' + i + '"><div class="progress-timeline-line"></div><i class="img-available"></i><span></span><div class="road-class-info ' + rquality + ' ' + rtype + '">X</div></li>');
    }

    if(force_break){
      break;
    }

    if(i < total){
      // there is still space
      i += step;
      if(i >= total){
        // we went above. adjust
        i = total - 1;
        force_break = true;
      }
    }
  }
  console.log('cummulative_distance', cummulative_distance);
  set_distance_until_the_end_of_the_road(cummulative_distance);
}


function get_date_to_use_for_timeline(dates){
  return dates[0];
}



function set_distance_from_start(distance){
  var distance_in_km = distance / 1000;
  if(window.start_kml_length) {
    var first_date = '';
    for(x in window.current_images[window.current_image_index]) {
        first_date = x;
        break;
    }
    distance_in_km = getDistance(window.start_kml_length, convertLatLng(getLatLngFromString(window.current_images[window.current_image_index][first_date][0].latlng))) / 1000;
  }
  $('#distance_from_starting_point').html(distance_in_km.toFixed(2) + ' KM');
}


function set_distance_until_the_end_of_the_road(distance){
    var distance_in_km = window.current_kml_length ? (window.current_kml_length / 1000): (distance / 1000);
    $('#distance_until_the_end_of_the_road').html(distance_in_km.toFixed(2) + ' KM');
}


function create_image(image){
    window.images_database[image.id] = image;
}


function get_image(image_id){
    return window.images_database[image_id];
}


function add_all_selected_images_to_array(project){
    window.current_images_array = new Array();

    if('datasets' in project){
        for(dataset_key in project['datasets']){
            if(project['datasets'].hasOwnProperty(dataset_key)){
                if(project['datasets'][dataset_key].selected){
                    if('images' in project['datasets'][dataset_key]){
                        window.current_images_array.push.apply(window.current_images_array, project['datasets'][dataset_key]['images']);
                    }
                }
            }
        }
    }

    window.current_images_array.sort(function(a, b) {
        return moment(a.datetime, 'YYYY:MM:DD HH:mm:ss') - moment(b.datetime, 'YYYY:MM:DD HH:mm:ss');
    });
}


function group_photos_in_current_images_array(){
  window.current_images = {};
  var dates = [];

  for(var i = 0; i < window.current_images_array.length; i++) {
    var datetime = moment(window.current_images_array[i].datetime, 'YYYY:MM:DD HH:mm:ss').format('YYYY-MM-DD');

    if(dates.indexOf(datetime) == -1) {
      dates.push(datetime);
    }

    if(_.isEmpty(window.current_images)) {
      var temp = new Object();
      temp[datetime] = [];
      temp[datetime].push(window.current_images_array[i]);
      window.current_images = [temp];
      continue;
    }

    var assigned = false;

    for(var j = 0; j < window.current_images.length; j++) {
      for(date in window.current_images[j]){
        // console.log('ASDF', window.current_images[j][date][0].latlng, window.current_images_array[i].latlng);
        if(is_near(window.current_images[j][date][0].latlng, window.current_images_array[i].latlng)){
          if(!(datetime in window.current_images[j])) {
            window.current_images[j][datetime] = [window.current_images_array[i]];
            assigned = true;
            break;
          }

          window.current_images[j][datetime].push(window.current_images_array[i]);
          assigned = true;
          break;
        }
      }
      if(assigned){
        break;
      }
    }
    if(!assigned) {
      var temp = new Object();
      temp[datetime] = [];
      temp[datetime].push(window.current_images_array[i]);
      window.current_images.push(temp);
    }
  }
}



function displayImageViewer2(project_code, index){
    var project =window.projects_database[project_code];
    add_all_selected_images_to_array(project);

    group_photos_in_current_images_array();

    display_images(index);

    setTimeout(function(){
        display_images(index);
    }, 100);
}


/**
* Get slide to show in image slider.
* @param {int} images length - The images length use to iterate slider.
*/
function getSlidesToShow(image_length) {
    return image_length > 3 ? 3: image_length == 0 ? 0:image_length - 1;
}





function get_object_keys(obj){
  var props = new Array();
  for(prop in obj){
    if(obj.hasOwnProperty(prop)){
      props.push(prop);
    }
  }
  return props;
}



function hide_viewers(){
    console.log("HIDE ALL VIEWERS");
    $(".proj-gallery-lightbox-wrapper").hide();
    window.images_are_displayed = false;
    window.is_image_viewer_displayed = false;
    window.special_images_are_displayed = false;
}



function update_road(type, image_id, value, serving_url, url, project_code, latlng) {
  console.log(arguments);
  if(arguments.length == 8) {
    var element = arguments[7];
    if(type == 'QUALITY') {
      $(element).parents('.quality-wrapper').css({'opacity': '0.75', 'pointer-events': 'none'});
    }
    else if(type == 'SURFACE') {
      $(element).parents('.surface-wrapper').css({'opacity': '0.75', 'pointer-events': 'none'});
    }
    var image = $(element).parents('#road-details-wrapper').siblings('.dl-img-btn').attr('href');
  }

  var lat = null;
  var lng = null;

  if(latlng){
    var ll = latlng.split(',');
    var lat = ll[0].trim();
    var lng = ll[1].trim();
  }

  console.log(type, image_id, value, url);
  for(var i = 0; i < value.length; i++) {
    if(value[i].toUpperCase() == 'DIRT'){
        value[i] = 'EARTH';
    }

    if(value[i].toUpperCase() == 'TARMAC'){
        value[i] = 'ASPHALT';
    }
    $.post('/api/v1/data', {'indexed_classification': value[i].toUpperCase(), 'indexed_image_serving_url': serving_url, 'indexed_image_url': url, 'indexed_classification_type': type.toUpperCase(), 'indexed_project_code': project_code, 'indexed_image_id': image_id, 'lat': lat, 'lng': lng, 'type': 'CLASSIFICATION'}, function(data) {
      console.log(data);
      if(element) {
        if(type == 'QUALITY') {
          $(element).parents('.quality-wrapper').css({'opacity': '', 'pointer-events': ''});
        }
        else if(type == 'SURFACE') {
          $(element).parents('.surface-wrapper').css({'opacity': '', 'pointer-events': ''});
        }
      }
      if(data) {
        if('success' in data) {
          if(!data.success) {
            alert(data.message);
          }
        }
      }
    }, 'json');

    // also post to image
    if(type == 'QUALITY') {
        $.post('/api/v1/data/' + image_id, {'indexed_is_road': '1', 'indexed_surface_quality': value[i].toUpperCase()}, function(data) {
          if(element) {
            $(element).parents('.quality-wrapper').css({'opacity': '', 'pointer-events': ''});
          }
            // update image in database here
            var image = get_image(image_id);
            console.log('value', value);
            console.log('iiiiiiii', i);
            if(image){
                image.surface_quality = value[0].toUpperCase();
                create_image(image);
                $(element).html(return_surface_quality_html(image));
                display_timeline();
            }
        });
    }
  }

  if(type == 'SURFACE') {
    var surface_types = value.join();
    var surface_types = surface_types.toUpperCase();

    $.post('/api/v1/data/' + image_id, {'indexed_is_road': '1', 'indexed_surface_type': value[0].toUpperCase(), 'indexed_surface_types': surface_types}, function(data) {
      console.log(data);
      if(element) {
        $(element).parents('.surface-wrapper').css({'opacity': '', 'pointer-events': ''});
      }

        // update image in database here
        var image = get_image(image_id);
        if(image){
            image.surface_type = value[0].toUpperCase();
            image.surface_types = surface_types;
            create_image(image);
            console.log('new value', return_surface_value_html(image));
            $(element).html(return_surface_value_html(image));
            console.log($(element));
            display_timeline();
        }
    });
}
}



function get_any_surface_type(images_array){
    if(images_array){
        for(var i=0; i<images_array.length; i++){
            if(images_array[i].surface_type){
                return images_array[i].surface_type.toLowerCase();
            }
        }
    }
    return '';
}


function get_any_surface_quality(images_array){
    if(images_array){
        for(var i=0; i<images_array.length; i++){
            if(images_array[i].surface_quality){
                return images_array[i].surface_quality.toLowerCase();
            }
        }
    }
    return '';
}


function checkbox_html_for_surface(image, surface_type){
    if(image.surface_types){
        var surface_types = image.surface_types.split(',');
        if(surface_types.indexOf(surface_type) != -1){
            return 'checked="checked"';
        }
    }
    else if(image.surface_type){
        if(image.surface_type == surface_type){
            return 'checked="checked"';
        }
    }

    return '';
}


function checkbox_html_for_quality(image, surface_quality){
    if(image.surface_quality){
        if(image.surface_quality == surface_quality){
            return 'checked="checked"';
        }
    }

    return '';
}

function setKalmanFilter(x, y, z, c) {
    var kalmanX = new KalmanFilter(x, y, z);
    var kalmanY = new KalmanFilter(x, y, z);
    var coordinates = [];
    for(var i = 0; i < c.length; i++) {
        var latlng = c[i].split(',');
        var filteredX = kalmanX.update(parseFloat(latlng[0]));
        var filteredY = kalmanY.update(parseFloat(latlng[1]));
        coordinates.push({lat: filteredX[0], lng: filteredY[0]});
    }
    return coordinates;
}

$('body').on('click', '#smoothen_gps', function() {
    if($(this).is(':checked')) {
        window.kalman_filter = true;
    }
    else {
        window.kalman_filter = false;
    }
});

