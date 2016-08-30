window.data_objects = {};


/**
 * Get all the projects from their respective agency/program and load them in the dashboard's table.
 * @param {string} program - Indicates the current loaded agency/program.
 * @param {string} cursor - Fetch the next records if a cursor is passed.
 */
function get_projects(program, cursor) {
	var url = config.url + '&agency=DA&program=PRDP';
	if(program == 'bub') {
		var url = config.url + '&agency=DPWH&program=BUB';
	}
	else if(program == 'gaa') {
		var url = config.url + '&agency=DPWH&program=GAA';
	}
	else if(program == 'local') {
		var url = config.url + '&agency=LOCAL&program=LOCAL';
	}
	else if(program == 'trip') {
		var url = config.url + '&agency=DOT&program=TRIP';
	}
	else if(program == 'coa') {
		var url = config.url + '&coa=1';
	}
	else if(program == 'all') {
		url = config.url;
	}
	else {
		url = config.url + '&program=' + config.program.toUpperCase();
	}
	if(cursor) {
		url += '&cursor=' + cursor;
	}
	console.log('get_projects', url);
	$.getJSON(url, function(data) {
		var next = data.cursor;
		data = data.data;
		for(var i = 0; i < data.length; i++) {
			if(data[i].code) {
				var program_url = 'da';
				switch(data[i].program.toLowerCase()) {
					case 'bub':
						program_url = 'bub';
						break;
					case 'gaa':
						program_url = 'gaa';
						break;
					case 'local':
						program_url = 'local';
						break;
					case 'trip':
						program_url = 'trip';
						break;
					case 'coa':
						program_url = 'coa';
						break;
				}
				if(data[i].coa) {
					program_url = 'coa';
				}
				var location = '';
				if(data[i].province) {
					location += data[i].province;
				}
				if(data[i].municipality) {
					location += ', ' + data[i].municipality;
				}
				row = [
					data[i].code,
					data[i].title,
					location,
					data[i].agency + ' (' + data[i].program + ')',
					'NO',
					'<div style="width: 141px;"><a href="/projects/' + program_url  + '/' + data[i].code + '" class="btn btn-xs btn-success">Update</a> <a href="/viewer?project_id=' + data[i].id + '" class="btn btn-xs btn-success">View on Map</a></div>'
				];
				if(data[i].has_kml == '1' || data[i].has_image == '1') {
					row[4] = 'YES';
				}
				var strip_fields = [
					'coa', 'created', 'created_timestamp', 'created_timestamp_utc', 'data', 'id',
					'has_classification', 'has_kml', 'has_image', 'permission',
					'type', 'updated', 'updated_timestamp', 'updated_timestamp_utc', 'user'
				];
				for(var j = 0; j < strip_fields.length; j++) {
					delete data[i][strip_fields[j]];
				}
				if('meta' in data[i]) {
					for(x in data[i].meta) {
						data[i][x] = data[i].meta[x]
					}
					delete data[i].meta;
				}
				config.db.push(data[i]);
			}
			else {
				continue;
			}
			table.row.add(row);
		}
		table.draw();
		if(next) {
			get_projects(program, next);
		}
		else {
			$('#loading-projects').fadeOut();
		}
	});
}

/**
 * Get the project dataset's KMLs to be listed.
 * @param {string} program - Indicates the current loaded agency/program.
 * @param {string} project - Indicates the project code to be loaded.
 * @param {string} dataset - The dataset code that contains the KMLs.
 * @param {string} cursor - The next page's cursor if ever remaining data still exists.
 * @param {string} subproject - The subproject code if the dataset is inside the subproject.
 */
function get_dataset_kmls(program, project, dataset, cursor, subproject) {
	var api = config.url + '/api/v1/data?callback=?&n=100&type=KML&parent_code=' + dataset;
	if(cursor) {
		api += '&cursor=' + cursor;
	}
	console.log('get_dataset_kmls', api);
	$.getJSON(api, function(data) {
		if(data.data.length == 0) {
			return;
		}
		for(var i = 0; i < data.data.length; i++) {
			var filename = decodeURIComponent(data.data[i].original_file_url.split('/')[data.data[i].original_file_url.split('/').length - 1]);
			filename = filename.replace('.kmz', '').replace('.kml', '').replace('.KML', '').replace('.KMZ', '');
			try {
				var last_kml = parseInt(filename.split('-')[filename.split('-').length - 1]);
				if(last_kml > config.last_kml) {
            		config.last_kml = last_kml;
				}
			}
			catch(e) {
				console.log('KML FILENAME NOT VALID');
			}
            $('#dataset-kmls ul').append('<div class="col-sm-6 col-md-6"><a class="thumbnail swipebox kml-file" data-original_url="' + data.data[i].original_file_url + '" data-data_id="' + data.data[i].id + '" data-permission="' + data.data[i].permission + '" href="/images/file-icon.png" title="'  + decodeURIComponent(data.data[i].kml.file_url.split('/')[data.data[i].kml.file_url.split('/').length - 1]) +  '"><img src="/images/file-icon-small.png">' + decodeURIComponent(data.data[i].kml.file_url.split('/')[data.data[i].kml.file_url.split('/').length - 1]) + '</a></div>');
			// $('#dataset-kmls ul').append('<li><a href="' + data.data[i].kml.file_url + '">' + decodeURIComponent(data.data[i].kml.file_url.split('/')[data.data[i].kml.file_url.split('/').length - 1]) + '</a></li>');
            window.data_objects[data.data[i].id] = data.data[i];
		}
		if(data.cursor) {
			subproject ? get_dataset_kmls(program, project, dataset, data.cursor, subproject) : get_dataset_kmls(program, project, dataset, data.cursor);
		}
	});
}


/**
 * Get the project dataset's images to be previewed.
 * @param {string} program - Indicates the current loaded agency/program.
 * @param {string} project - Indicates the project code to be loaded.
 * @param {string} dataset - The dataset code that contains the images.
 * @param {string} cursor - The next page's cursor if ever remaining data still exists.
 * @param {string} subproject - The subproject code if the dataset is inside the subproject.
 */
function get_dataset_images(program, project, dataset, cursor, subproject) {
	var api = config.url + '/api/v1/data?callback=?&n=100&type=IMAGE&parent_code=' + dataset;
	if(cursor) {
		api += '&cursor=' + cursor;
	}
	console.log('get_dataset_images', api);
	$.getJSON(api, function(data) {
		for(var i = 0; i < data.data.length; i++) {
			$('#dataset-photos').append('<div class="col-sm-6 col-md-3"><a class="thumbnail swipebox" data-original_url="' + data.data[i].original_file_url + '" data-data_id="' + data.data[i].id + '" data-permission="' + data.data[i].permission + '" href="' + data.data[i].image.serving_url + '" title="'  + decodeURIComponent(data.data[i].image.file_url.split('/')[data.data[i].image.file_url.split('/').length - 1]) +  '"><img src="' + data.data[i].image.serving_url + '=s100-c"/></a></div>');
            window.data_objects[data.data[i].id] = data.data[i];
		}
		if(data.cursor) {
			subproject ? get_dataset_images(program, project, dataset, data.cursor, subproject) : get_dataset_images(program, project, dataset, data.cursor);
		}
	});
}


function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}


function get_dataset_files(program, project, dataset, cursor, subproject) {
    var api = '/api/v1/data?callback=?&n=100&type=FILE&parent_code=' + dataset;
    if(cursor) {
        api += '&cursor=' + cursor;
    }
    console.log('get_dataset_files', api);
    $.getJSON(api, function(data) {
        for(var i = 0; i < data.data.length; i++) {
            var filename = decodeURIComponent(data.data[i].file.file_url.split('/')[data.data[i].file.file_url.split('/').length - 1]);
            config.files.push(filename);
            if(endsWith(data.data[i].original_file_url, '.jpg') || endsWith(data.data[i].original_file_url, '.jpeg')){
                $('#dataset-files').append('<div class="col-sm-6 col-md-3"><a class="thumbnail swipebox" data-original_url="' + data.data[i].original_file_url + '" data-data_id="' + data.data[i].id + '" data-permission="' + data.data[i].permission + '" href="' + data.data[i].file.serving_url + '" title="'  + decodeURIComponent(data.data[i].original_file_url.split('/')[data.data[i].original_file_url.split('/').length - 1]) +  '"><img src="' + data.data[i].file.serving_url + '=s100-c"/></a></div>');
            }
            else {
                $('#dataset-files').append('<div class="col-sm-6 col-md-4"><a class="thumbnail swipebox" href="/images/file-icon.png" data-original_url="' + data.data[i].original_file_url + '" data-data_id="' + data.data[i].id + '" data-permission="' + data.data[i].permission + '" title="'  + decodeURIComponent(data.data[i].file.file_url.split('/')[data.data[i].file.file_url.split('/').length - 1]) + '"><img src="/images/file-icon-small.png" />' + (filename.length > 10 ? filename.trunc(10) : filename) + '</a></div>'); // CUT FILENAME IF LENGTH IS GREATER THAN 10
            }
            window.data_objects[data.data[i].id] = data.data[i];
        }
        if(data.cursor) {
            subproject ? get_dataset_files(program, project, dataset, data.cursor, subproject) : get_dataset_files(program, project, dataset, data.cursor);
        }
    });
}


/**
 * Get the specific project from the given agency/program and the code.
 * @param {string} program - Indicates the current loaded agency/program.
 * @param {string} code - Indicates the project code to be loaded.
 */
function get_project(program, code) {
	var url = config.url + '/api/v1/data?callback=?&type=PROJECT&code=' + code;

	console.log('get_project', url)
	$.getJSON(url, function(data) {
		data = data.data[0];
		if(data) {
			if(data.code) {
				config.loaded['name'] = data.title;
				config.loaded['year'] = data.year;
				config.loaded['region'] = data.region;
				config.loaded['id'] = data.code;
				config.loaded['province'] = data.province;
				config.loaded['municipality'] = data.municipality;
				config.loaded['description'] = data.description;
				config.loaded['meta'] = data.meta;
				config.loaded['program'] = data.program;
				config.loaded['agency'] = data.agency;
				config.loaded['contract_cost'] = data.contract_cost;
				config.loaded['total_project_cost'] = data.total_project_cost;
			}
			$('input[name="data"]').val(data.id);
			$('input[name="title"]').val(config.loaded.name);
            if(config.loaded.region){
                $('select[name="region"]').val(config.loaded.region).trigger('change');
            }
            if(config.loaded.year){
                $('select[name="year"]').val(config.loaded.year).trigger('change');
            }
			$('textarea[name="description"]').val(config.loaded.description);
			$('input[name="code"]').val(config.loaded.id);
			if(config.loaded.province) {
				$('select[name="province"]').val(config.loaded.province.toUpperCase()).trigger('change');
			}
			if(config.loaded.municipality) {
				$('select[name="municipality"]').val(config.loaded.municipality.toUpperCase()).trigger('change');
			}
			$('input[name="contract-cost"]').val(config.loaded.contract_cost);
			$('input[name="total-project-cost"]').val(config.loaded.total_project_cost);
			$('input').trigger('keyup');
			preview_subproject();
			// load_project_meta(config.loaded.meta);
			data.coa = false;
			if(data.coa) {
				var html = '<div class="col-xs-6"> \
					<div class="form-group"> \
						<label>Tagged under Agency</label> \
						<select class="form-control" name="agency" disabled="" onchange="set_programs();"></select> \
					</div> \
				</div> \
				<div class="col-xs-6"> \
					<div class="form-group"> \
						<label>Tagged under </label> \
						<select class="form-control" name="program" disabled=""></select> \
					</div> \
				</div>';
				$('.select-agency-program-label').show();
				$('#select-agency-program').empty().append(html);
				$('select[name="agency"], select[name="program"]').select2();
				$('select[name="agency"]').trigger('change');
			}
		}
		else {
			alert('Invalid Project! Redirecting you to projects list.');
			window.location.href = '/projects/' + program;
		}
	});
}

/**
 * Get the specific subproject from the given agency/program, project code and the subproject code.
 * @param {string} program - Indicates the current loaded agency/program.
 * @param {string} code - Indicates the project code to be loaded.
 * @param {string} subproject - Indicates the subproject code to be loaded.
 */
function get_subproject(program, code, subproject) {
	var url = '/api/v1/data?callback=?&type=SUBPROJECT&code=' + subproject + '&parent_code=' + code;

	console.log('get_subproject', url)
	$.getJSON(url, function(data) {
		data = data.data[0];
		if(data) {
			if(data.code) {
				config.loaded['name'] = data.title;
				config.loaded['region'] = data.region;
				config.loaded['year'] = data.year;
				config.loaded['id'] = data.code;
				config.loaded['province'] = data.province;
				config.loaded['municipality'] = data.municipality;
				config.loaded['description'] = data.description;
				config.loaded['meta'] = data.meta;
			}
			$('input[name="data"]').val(data.id);
			$('input[name="title"]').val(config.loaded.name);
			$('select[name="region"]').val(config.loaded.region).trigger('change');
			$('select[name="year"]').val(config.loaded.year).trigger('change');
			$('textarea[name="description"]').val(config.loaded.description);
			$('input[name="code"]').val(config.loaded.id);
			$('select[name="province"]').val(config.loaded.province.toUpperCase()).trigger('change');
			$('select[name="municipality"]').val(config.loaded.municipality.toUpperCase()).trigger('change');
			$('input').trigger('keyup');
			preview_subproject();
			// load_project_meta(config.loaded.meta);
		}
		else {
			alert('Invalid Subproject! Redirecting you to parent project.');
			window.location.href = '/projects/' + program + '/' + code;
		}
	});
}


function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}


function load_project_meta(meta) {
	tbody = '<tbody>';
    var has_meta = false;
	for(x in meta) {
		if(meta[x]) {
            has_meta = true;
			tbody += '<tr>';
			tbody += '<td>' + toTitleCase(x.replace(/_/g, ' ')) + '</td>';
			tbody += '<td><b>' + meta[x] + '</b></td>';
			tbody += '</tr>';
		}
	}
	tbody += '</tbody>';
    if(has_meta){
        $('.meta-information').html(tbody);
    }
    else {
        $('#more-information-title').hide();
    }
}

/**
 * Get the specific project dataset(s) from the given agency/program and the code.
 * @param {string} program - Indicates the current loaded agency/program.
 * @param {string} parent - This is the parent project code of the dataset.
 * @param {string} code - The dataset code.
 */
function get_dataset(program, parent, code, subproject) {
	var url = '/api/v1/data?callback=?&type=DATASET&code=' + code;
	if(subproject) {
		url += '&project_code=' + parent + '&parent_code=' + subproject;
	}
	else {
		url += '&parent_code=' + parent;
	}
	console.log('get_dataset', url);
	$.getJSON(url, function(data) {
		data = data.data[0];
		if(!data) {
			return;
		}
		$('input[name="title"]').val(data.title);
		$('textarea[name="description"]').val(data.description);
		$('input[name="data"]').val(data.id);
		$('input[name="dataset-id"]').val(data.id);
		$('textarea[name="data-collectors"]').val(data.data_collectors);
		$('ol.breadcrumb li:last-child a').text(data.title);
		if(data.data_collectors) {
			$('.dropzone-container').slideDown();
		}
		fill_project_data_id(parent, program);
		if(subproject) {
			fill_subproject_data_id(subproject, parent, program);
			get_dataset_images(program, parent, code, null, subproject);
			get_dataset_kmls(program, parent, code, null, subproject);
            get_dataset_files(program, parent, code, null, subproject);
		}
		else {
			get_dataset_images(program, parent, code);
            get_dataset_files(program, parent, code);
			get_dataset_kmls(program, parent, code);
		}
		config.loaded = data;
        get_environment_for_dataset(data.id);

        get_redflags(data.id);
	});
}


function get_redflags(dataset_id){
    var url = config.url + '/api/v1/redflags?callback=?&dataset_id=' + dataset_id;
    $.getJSON(url, function(data) {
        if(data.data) {
            var redflags = data.data;
            html_content = '<h4 class="background"><span><i class="glyphicon glyphicon-flag"></i> Red Flags</span></h4>';
            for(var i=0; i<redflags.length; i++){
                html_content += '<li class="redflag-text">' + redflags[i].redflag_description + '</li>';
            }
            if(redflags.length){
                $("#red-flags-wrapper").html(html_content);
            }
        }
    });
}


function fill_subproject_data_id(code, parent, program) {
	var url = config.url + '/api/v1/data?callback=?&type=SUBPROJECT&code=' + code + '&parent_code=' + parent;
	console.log('fill_subproject_data_id', url)
	$.getJSON(url, function(data) {
		if(data.data) {
			$('input[name="subproject-id"]').val(data.data[0].id);
		}
	});
}

function fill_project_data_id(code, program) {
	var url = config.url + '/api/v1/data?callback=?&type=PROJECT&code=' + code;

	console.log('fill_project_data_id', url);
	$.getJSON(url, function(data) {
		if(data.data) {
			$('input[name="project-id"]').val(data.data[0].id);
		}
	});
}

/**
 * Get the specific project dataset(s) from the given agency/program and the code.
 * @param {string} program - Indicates the current loaded agency/program.
 * @param {string} code - Indicates the project code to be passed as a parameter to the api.
 * @param {string} cursor - Pass the next cursor key if there are other data to be fetched.
 * @param {string} cursor - Pass the next cursor key if there are other data to be fetched.
 */
function get_project_datasets(program, code, cursor, subproject) {
	var url = config.url + '/api/v1/data?callback=?&type=DATASET&n=100';
	if(subproject) {
		url += '&parent_code=' + subproject + '&project_code=' + code;
	}
	else {
		url += '&parent_code=' + code;
	}

	if(cursor) {
		url += '&cursor=' + cursor;
	}
	console.log('get_project_datasets', url);
	$.getJSON(url, function(data) {
		console.log(data);
		for(var i = 0; i < data.data.length; i++) {
			li = '<li>';
			if(subproject) {
				li += '<a href="/projects/' + program + '/' + code + '/subproject/' + subproject + '/dataset/' + data.data[i].code + '">' + data.data[i].title ;
			}
			else {
				li += '<a href="/projects/' + program + '/' + code + '/dataset/' + data.data[i].code + '">' + data.data[i].title;
			}
			li += '<span class="pull-right">' + moment(data.data[i].created).format('MM/DD/YYYY') + '</span>';
			li += '</a></li>';
			$('ul.datasets-list').append(li);
		}
		if(data.cursor) {
			if(subproject) {
				get_project_datasets(program, code, data.cursor, subproject);
			}
			else {
				get_project_datasets(program, code, data.cursor);
			}
		}
	});
}

/**
 * Get the project subproject(s) from the given agency, program, and the code.
 * @param {string} program - Indicates the current loaded agency/program.
 * @param {string} code - Indicates the project code to be passed as a parameter to the api.
 * @param {string} cursor - Pass the next cursor key if there are other data to be fetched.
 */
function get_project_subprojects(program, code, cursor) {
	var url = '/api/v1/data?callback=?&type=SUBPROJECT&parent_code=' + code;

	console.log('get_project_subprojects', url);
	$.getJSON(url, function(data) {
		for(var i = 0; i < data.data.length; i++) {
			li = '<li>';
			data.data[i].title ?
				li += '<a href="/projects/' + program + '/' + code + '/subproject/' + data.data[i].code + '">' + data.data[i].title.trunc(45):
				li += '<a href="/projects/' + program + '/' + code + '/subproject/' + data.data[i].code + '">' + data.data[i].code;
			li += '<span class="pull-right">' + moment(data.data[i].created).format('MM/DD/YYYY') + '</span>';
			li += '</a></li>';
			$('ul.subprojects-list').append(li);
		}
		if(data.next) {
			get_project_datasets(program, code, data.next);
		}
	})
}

/**
 * Preview the project's details and what it looks like on the viewer before submitting.
 */
function preview_subproject(update_code) {
	if(update_code) {
    	update_project_code();
	}

	var details = {
		'span.preview-type': 'select[name="region"]',
		'span.preview-id': 'input[name="code"]',
		'span.preview-name': 'input[name="title"]',
		'span.preview-status': 'select[name="year"]',
		'div.preview-description': 'textarea[name="description"]',
		'span.preview-pso': 'input[name="cluster"]',
		'span.preview-region': 'select[name="region"]',
		'span.preview-province': 'select[name="province"]',
		'span.preview-municipality': 'select[name="municipality"]',
		'span.preview-estimated-cost': 'input[name="estimated"]',
		'span.preview-actual-cost': 'input[name="actual"]',
		'span.preview-sp-status': 'input[name="percent"]',
		'span.preview-date': 'input[name="ntp-date"]',
		'span.preview-contract-cost': 'input[name="contract-cost"]',
		'span.preview-total-project-cost': 'input[name="total-project-cost"]',
	}
	for(x in details) {
		$(x).text($(details[x]).val());
	}
	
	// $('input[type="submit"]').attr('disabled', '');
    $("#sample-label").hide();
	/*$('span.preview-estimated-cost').text('P ' + parseInt($('input[name="estimated"]').val().replace(',', '')).money());
	$('span.preview-actual-cost').text('P ' + parseInt($('input[name="actual"]').val().replace(',', '')).money());*/

}


function convertToSlug(Text){
    var text = Text
        .toLowerCase()
        .replace(/[^\w ]+/g,'')
        .replace(/ +/g,'-');

    return text.toUpperCase();
}


// PROGRAM-REGION-PROVINCE-MUNICIPALITY-YR-XXXX;

function check_project_code(code, loop) {
	$('#project-code-field').val('');
	var url = config.url + '/api/v1/data?callback=?&type=PROJECT&code=' + code + '-' + loop;
	$.getJSON(url, function(data) {
		if(data.data.length) {
			check_project_code(code, loop + 1);
		}
		else {
        	$('#project-code-field').val(code + '-' + loop);
        	$('span.preview-id').text(code + '-' + loop);
    		($('input[name="code"]').val()) ? $('input[type="submit"]').removeAttr('disabled') : $('input[type="submit"]').attr('disabled', '');
		}
    });
}

function update_project_code(){
    if(!window.there_is_a_project_already){
        var agency = $('select[name="agency"] option:selected').text();
        var program = $('select[name="program"] option:selected').text();
        // var program = config.program ? config.program.toUpperCase() : 'XXXX';
        var region = $('select[name="region"]').val();
        var province = $('select[name="province"]').val();
        var municipality = $('select[name="municipality"]').val();
        var year = $('select[name="year"]').val() ? convertToSlug($('select[name="year"]').val()) : '0000';
        region = $('select[name="region"] option[value="' + region + '"]').attr('data-psgc');
        region = region ? region : '0000';
        province = $('select[name="province"] option[value="' + province + '"]').attr('data-psgc');
        province = province ? province.replace(region, '').substr(0, 2) : '0000';
        municipality = $('select[name="municipality"] option[value="' + municipality + '"]').attr('data-psgc');
        municipality = municipality ? municipality.replace((region + province).substr(0, 4), '') : '0000';
        var code = program + "-" + region + '-' + province + '-' + municipality + '-' + year;
        // $('#project-code-field').val(code);
    	check_project_code(code, 1);
    }
}


function get_environments(cursor) {
    console.log('GET WORKSPACES');
	var url = '/api/v1/workspaces';
	if(cursor) {
		url += '&cursor=' + cursor;
	}
	$.getJSON(url, function(data) {
		var next = data.cursor;
		var data = data.data;
		if(data) {
			for(var i = 0; i < data.length; i++) {
				var option = '<option value="' + data[i].key + '">' + data[i].title + '</option>';
				$('select[name="environment_key"]').append(option);
			}
			if(next) {
				get_environments(next);
			}
		}
	});
}

function get_environment_for_dataset(dataset_code) {
    $("#environment_picker").hide();

    console.log('GET WORKSPACE FOR DATASET');
    var url = config.url + '/api/v1/data/' + dataset_code + '?show_environments=1&callback=?';

    console.log(url);
    $.getJSON(url, function(data) {
        if(data) {
            console.log('environment', data);
            if(data.data.environment_object){
                $("#environment_title").text(data.data.environment_object.title);
                $("#environment_title").attr('href', '/workspace?current_workspace=' + data.data.environment_object.id);
                $("#environment_status").hide();
            }
            $("#environment_status").text(data.data.permission);
            $("#dataset_environment").show();
        }
    });
}

function get_psgc() {
	var url = '/api/v1/psgc';
	var locations = {}
	$.getJSON(url, function(data) {
		for(var i = 0; i < data.length; i++) {
			if(data[i].type == 'PROVINCE') {
				locations[data[i].code + '<>' + data[i].name.replace(' (Not a Province)', '').replace(' (Capital)', '')] = [];
			}
			else {
				for(x in locations) {
					if(x.startsWith(data[i].code.substr(0, 4))) {
						locations[x].push(data[i].code + '<>' + data[i].name.replace(' (Not a Province)', '').replace(' (Capital)', ''));
					}
				}
			}
		}
		for(x in locations) {
			config.locations[x] = locations[x];
			// config.locations[x.substr(x.indexOf('<>') + 2)] = locations[x];
		}
		// select_province();
	});
}

function select_province() {
	$('select[name="municipality"]').select2();
	$('select[name="province"]').select2().select2('destroy').empty().append('<option disabled selected>SELECT PROVINCE</option>');
	for(x in config.locations) {
		var region = $('select[name="region"] option:selected').attr('data-psgc');
		if(region == x.substr(0, x.indexOf('<>')).substr(0, 2)) {
			option = '<option data-psgc="' + x.substr(0, x.indexOf('<>')) + '" value="' + x.substr(x.indexOf('<>') + 2) + '">' + x.substr(x.indexOf('<>') + 2) + '</option>';
			$('select[name="province"]').append(option);
		}
	}
	$('select[name="province"]').removeAttr('disabled').select2({
		/*sorter: function(results, container, query) {
            if(query){
                if(query.term) {
                    return results.sort();
                }
            }
			return results.sort();
		}*/
	});
}

function select_municipality() {
	var province = $('select[name="province"] option[value="' + $('select[name="province"]').val() + '"]').attr('data-psgc') + '<>' + $('select[name="province"]').val();
	$('select[name="municipality"]').select2().select2('destroy').empty();
	$('select[name="municipality"]').append('<option disabled selected>SELECT MUNICIPALITY</option>');
	try {
		for(var i = 0; i < config.locations[province].length; i++) {
			var municipality = config.locations[province][i];
			var option = '<option data-psgc="' + municipality.substr(0, municipality.indexOf('<>')) + '" value="' + municipality.substr(municipality.indexOf('<>') + 2) + '">' + municipality.substr(municipality.indexOf('<>') + 2) + '</option>';
			$('select[name="municipality"]').append(option);
		}
	}
	catch(e) {
		console.log('PROVINCE NOT FOUND');
	}
	$('select[name="municipality"]').removeAttr('disabled').select2({
		/*sorter: function(results, container, query) {
            if(query){
                if(query.term) {
                    return results.sort();
                }
            }
			return results.sort();
		}*/
	});
}

function set_programs() {
	var programs = {
		'COA': ['CPA'],
		'DA': ['PRDP'],
		'DPWH': ['BUB', 'GAA'],
		'DOT': ['TRIP'],
		'LOCAL': ['LOCAL'],
	};
	if($('select[name="agency"]').children().length == 0) {
		$('select[name="agency"]').empty();
		for(x in programs) {
			$('select[name="agency"]').append($('<option>', {'value': x}).html(x));
		}
		$('select[name="agency"]').val((!config.loaded.agency ? $('select[name="agency"] option:first-child').val() : config.loaded.agency)).trigger('change').removeAttr('disabled');
	}
	else {
		$('select[name="program"]').empty();
		var agency = $('select[name="agency"]').val();
		if(!agency) {
			console.log('HAS AGENCY');
			agency = config.loaded.agency;
		}
		console.log(agency);
		for(var i = 0; i < programs[agency].length; i++) {
			$('select[name="program"]').append($('<option>', {'value': programs[agency][i]}).html(programs[agency][i]));
		}
		$('select[name="program"]').removeAttr('disabled').val((!config.loaded.program ? $('select[name="program"] option:first-child').val() : config.loaded.program)).trigger('change');
	}
}

function get_programs_by_agency(agency) {
	var url = '/api/v1/programs/' + agency + '?callback=?';
	$.getJSON(url, function(data) {
		var select = $('select[name="program"]');
		select.empty().attr('disabled', '');
		for(var i = 0; i < data.data.length; i++) {
			put_program_in_select(data.data[i]);
		}
		select.select2().trigger('change');
		if(select.children().length) {
			select.removeAttr('disabled');
		}
	});
}

function put_program_in_select(program) {
	var select = $('select[name="program"]');
	var option = '<option value="' + program.slug + '">';
	option += program.name;
	option += '</option>';
	select.append(option);
}

String.prototype.trunc = String.prototype.trunc || function(n) {
	return (this.length > n) ? this.substr(0, n - 1) + '&hellip;' : this;
};

String.prototype.startsWith = function(prefix) {
	return this.indexOf(prefix) === 0;
}

String.prototype.toProperCase = function () {
	return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

$('.nav').on('click', 'li', function() {
	var tab = $(this).children('a').attr('id').toLowerCase();
	$('.nav li').removeClass('active');
	$(this).addClass('active');
	$('#dashboard-tab-contents>div').addClass('hidden')
	if(tab == 'photos-tab') {
        console.log('yey');
		$('#dataset-photos').removeClass('hidden');
	}
	else if(tab == 'kml-tab') {
		$('#dataset-kmls').removeClass('hidden');
	}
	else if(tab == 'files-tab') {
		$('#dataset-files').removeClass('hidden');
	}
});