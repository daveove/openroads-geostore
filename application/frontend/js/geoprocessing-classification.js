String.prototype.reverse=function(){
  return this.split("").reverse().join("");
}
Number.prototype.withCommas=function(){
  var x=6,y=parseFloat(this).toFixed(2).toString().reverse();
  while(x<y.length){y=y.substring(0,x)+","+y.substring(x);x+=4;}
  return y.reverse();
}
Number.prototype.toCurrency=function(){
  return(arguments[0]?arguments[0]:"$")+this.withCommas();
};

var project = window.project_code;
var table = $('#geoprocessed-images-table').DataTable({
    bFilter: false,
    bPaginate: true,
    pageLength: 50,
    bSort: false,
    dom: 'Bfrtip',
    buttons: ['csvHtml5']
});
var $concretePoints = "#C7CBCC";
var $goodPoints = "#59DF26";
var $badPoints = "#EE1712";
var $poorPoints = "#E09309";
var $fairPoints = "#C6DF23";
var $asphaltPoints = "#434748"
var $gravelPoints = "#3b2104";
var $dirtPoints = "#633503";
var $chartBorderColor = "#efefef";


var thisMap;
var markers = [];

function init(){
    pull_new_classifications_from_server();
    get_geometry_length();
    init_map();
    get_kmls();
    // setInterval(function() { pull_new_classifications_from_server(); }, 10000);
}

function init_map() {
    var map = {
        init: function(){
            var location = new google.maps.LatLng(11.6978351, 122.6217542);
            var canvass = document.getElementById("geotagging-canvass");
            var options = {
                center: location,
                zoom: 6,
                mapTypeId: google.maps.MapTypeId.SATELLITE,
                streetViewControl: false,
                mapTypeControl: false,
            }
            thisMap = new google.maps.Map(canvass, options);
        }
    };
    map.init();
}
window.project_data = {};
get_project_datasets();
window.dataset_code = $('#dataset-select').val();
$('#dataset-select').on('change', function() {
    window.dataset_code = $('#dataset-select').val();
    init();
});
if(window.project_code){
    var base_url ='https://' + system_url + '/api/v1/data?type=CLASSIFICATION&n=100&project_code=' + window.project_code + "&callback=?";
    console.log(base_url);
    $.getJSON('https://' + system_url + '/api/v1/data?&type=PROJECT&code=' + window.project_code + '&callback=?', function(data) {
        if(data.data) {
            window.project_data = data.data[0];
            $('#project-name').text(window.project_data.title);
            $('#project-code').text(window.project_data.code);
            console.log(asset_values['PROGRAMS'][window.project_data.program]);
            $('.approximate-asset-value').html('<b>' + asset_values['PROGRAMS'][window.project_data.program].toCurrency('P ') + '</b>');
            var _asset_values_ = ['CONCRETE-GOOD', 'CONCRETE-FAIR', 'CONCRETE-POOR', 'CONCRETE-BAD', 'ASPHALT-GOOD', 'ASPHALT-FAIR', 'ASPHALT-POOR', 'ASPHALT-BAD', 'GRAVEL-GOOD', 'GRAVEL-FAIR', 'GRAVEL-POOR', 'GRAVEL-BAD', 'EARTH-GOOD', 'EARTH-FAIR', 'EARTH-POOR', 'EARTH-BAD'];
            for(var i = 0; i < _asset_values_.length; i++) {
                $('#computed-' + _asset_values_[i].toLowerCase()).text((asset_values['PROGRAMS'][window.project_data.program] * asset_values['VALUES'][_asset_values_[i]]).toCurrency(' P'));
            }
        }
    });
}
else {
    var base_url = 'https://' + system_url + '/api/v1/data?&type=CLASSIFICATION&n=100&callback=?';
}
var db_ = {};
var images_ = {};
var totals_ = {};
var geometry_length = 0;


function get_geometry_length() {
    $.getJSON('https://' + system_url + '/api/v1/length?callback=?&project=' + window.project_code + '&dataset=' + window.dataset_code, function(data) {
        var length = 0;
        for(var x in data.data) {
            for(var i = 0; i < data.data[x]['length'].length; i++) {
                length += data.data[x]['length'][i];
            }
        }
        geometry_length = length;
        $('.total-temporal-points').html('<b>' + Object.keys(data.data).length + '</b>');
        $('.geometry-length').html('<b>' + length.toFixed(2) + '</b>');
    });
}

function get_project_road() {
    var url = 'https://' + system_url + '.api/v1/data?type=KML&project_code=' + project_code + '&road_type=PROJECT&callback=?';
    console.log('get_project_road()', url);
    $.getJSON(url, function(data) {
        console.log(data[0]);
        get_geometry_length_by_affected_classification(data[0].id);
    });
}

function get_geometry_length_by_affected_classification(kml) {
    var url = '/geoprocessing/kml/download?project_code=' + project_code + '&kml_id=' + kml + '&output=json';
    console.log('get_geometry_length_by_affected_classification()', url);
    $.getJSON(url, function(data) {
        console.log(data);
    });
}

function pull_new_classifications_from_server(){
    pull_new_surface_type_classifications_from_server();
}


function pull_new_surface_type_classifications_from_server(cursor){
    params = '&parent_code=' + window.dataset_code + '&classification_type=SURFACE';
    if(cursor) {
        params += '&cursor=' + cursor;
    }
    console.log(base_url + params);
    $.getJSON(base_url + params, function(data) {
        //console.log(data);
        add_classifications_to_stats_if_new(data.data);
        if(data.cursor && data.cursor.length > 0) {
            pull_new_surface_type_classifications_from_server(data.cursor);
        }
        else {
            pull_new_surface_quality_classifications_from_server();
        }
        if(window.project_code){
            refresh_views();
        }
    });
}


function pull_new_surface_quality_classifications_from_server(cursor){
    params = '&parent_code=' + window.dataset_code + '&classification_type=QUALITY';
    if(cursor) {
        params += '&cursor=' + cursor;
    }
    console.log(base_url + params);
    $.getJSON(base_url + params, function(data) {
        add_classifications_to_stats_if_new(data.data);
        if(data.cursor && data.cursor.length > 0) {
            pull_new_surface_quality_classifications_from_server(data.cursor);
        }
        else {
            setTimeout(function() {
                render_project_summary()
            }, 500);
        }
        if(window.project_code){
            refresh_views();
        }
        else if(!data.cursor || data.cursor.length == 0) {
            // no project code. only render when everything is loaded.
            refresh_views();
            render_map();
        }
    });
}


function refresh_views(){
    // render_quality_stats();
    // render_surface_type_stats();
    render_quality_chart();
    render_surface_chart();
    if(window.project_code){
        // only render table when there is a specific project, coz it lags
        render_table();
        $("#data-table-for-images").show();
        render_map();
    }
    else {
        $("#data-table-for-images").hide();
    }

    render_counts();
}

window.kml_layers = [];
window.kml_data = []


function get_kmls(){
    window.kml_data = [];
    $.getJSON('/api/v1/data?&type=KML&parent_code=' + window.dataset_code, function(data) {
        if(data.data) {
            results = data.data;
            for(var i=0; i<results.length; i++){
                window.kml_data.push(results[i]);
            }
        }
        render_kmls();
    });
}


function render_kmls(){
    // clear all kmls
    unrender_kmls_in_map();

    // iterate over kmls and render each one of them
    for(var i=0; i<window.kml_data.length; i++){
        render_kml_in_map(window.kml_data[i].id);
    }
}


function unrender_kmls_in_map(){
    for(var i=0; i<window.kml_layers.length; i++){
        window.kml_layers[i].setMap(null);
    }
}


function render_kml_in_map(kml_id){
    pathArray = location.href.split( '/' );
    protocol = pathArray[0];
    host = pathArray[2];
    var url = protocol + '//' + host;
    url += '/geoprocessing/kml/download?render=1&parent_code=' + window.dataset_code + '&kml_id=' + kml_id;
    window.kml_layers.push(new google.maps.KmlLayer({    
        url: url,  
        map: thisMap  
    }));
}


function render_map(){
    render_kmls();
    // get_markers_from_db();
}

function get_project_datasets() {
    var dataset_url = 'https://' + system_url + '/api/v1/data?callback=?&n=100&type=DATASET&parent_code=' + window.project_code;
    console.log(dataset_url);
    $.getJSON(dataset_url, function(data) {
        console.log('get_project_datasets', data);
        if(data.data) {
            for(var i = 0; i < data.data.length; i++) {
                var check = $('#dataset-select option[value="' + data.data[i].code + '"]');
                if(check.length == 0) {
                    var option = $('<option>', {'value': data.data[i].code, 'text': data.data[i].title});
                    $('#dataset-select').push(option);
                }
            }
            $('#dataset-select').trigger('change');
        }
    });
}


function render_counts(){
    var db = [];
    var images = [];
    var projects = [];

    for(x in db_) {
        if(db_.hasOwnProperty(x)){
            db.push(db_[x])
        }
    }

    var db_length = db.length;

    for(var i=0; i<db_length; i++){
        if(db[i].project_code && projects.indexOf(db[i].project_code) == -1){
            projects.push(db[i].project_code);
        }

        if(db[i].image_serving_url && images.indexOf(db[i].image_serving_url) == -1){
            images.push(db[i].image_serving_url);
        }
    }
    // render_project_summary();
    $('.total-tags').html('<b>' + db.length + '</b>');
    $('.total-unique-images').html('<b>' + images.length + '</b>');
    $('.total-unique-projects').html('<b>' + projects.length + '</b>');

}


function add_classifications_to_stats_if_new(classifications){
    for(var i = 0; i < classifications.length; i++) {
        db_[classifications[i].id] = classifications[i];
    }
    console.log(Object.keys(db_).length);
}


function render_quality_stats(){
    var counts = get_quality_counts();
    $('.total-good-points').html('<b>' + counts['good'] + '</b>');
    $('.total-fair-points').html('<b>' + counts['fair'] + '</b>');
    $('.total-poor-points').html('<b>' + counts['poor'] + '</b>');
    $('.total-bad-points').html('<b>' + counts['bad'] + '</b>');
}


function get_surface_type_counts(){
    var count_concrete = 0;
    var count_asphalt = 0;
    var count_gravel = 0;
    var count_dirt = 0;

    for(x in db_) {
        try {
            if(db_[x].classification_type == "SURFACE"){
                var surface = db_[x].classification;
                if(!(db_[x].image_id in images_)) {
                    images_[db_[x].image_id] = {}
                }
                images_[db_[x].image_id]['SURFACE'] = surface;
                if(surface == 'CONCRETE'){
                    count_concrete++;
                }
                if(surface == 'ASPHALT'){
                    count_asphalt++;
                }
                if(surface == 'GRAVEL'){
                    count_gravel++;
                }
                if(surface == 'EARTH'){
                    count_dirt++;
                }
                if(surface && surface != 'NA') {
                    if(!('SURFACE' in totals_)) {
                        totals_['SURFACE'] = 0;
                    }
                    totals_['SURFACE']++;
                }
            }
        }
        catch(e){
            console.log(e);
        }
    }


    return {
        'concrete': count_concrete,
        'asphalt': count_asphalt,
        'gravel': count_gravel,
        'dirt': count_dirt
    }
}


function get_quality_counts(){
    var count_good = 0;
    var count_fair = 0;
    var count_poor = 0;
    var count_bad = 0;

    for(x in db_) {
        try {
            if(db_[x].classification_type == "QUALITY"){
                var quality = db_[x].classification;
                if(!(db_[x].image_id in images_)) {
                    images_[db_[x].image_id] = {}
                }
                images_[db_[x].image_id]['QUALITY'] = quality;
                if(quality == 'GOOD'){
                    count_good++;
                }
                if(quality == 'FAIR'){
                    count_fair++;
                }
                if(quality == 'POOR'){
                    count_poor++;
                }
                if(quality == 'BAD'){
                    count_bad++;
                }
                if(quality && quality != 'NA') {
                    if(!('QUALITY' in totals_)) {
                        totals_['QUALITY'] = 0;
                    }
                    totals_['QUALITY']++;
                }
            }
        }
        catch(e){
            console.log(e);
        }
    }

    return {
        'good': count_good,
        'fair': count_fair,
        'poor': count_poor,
        'bad': count_bad
    }
}

function render_project_summary() {
    var counts = {};
    var percentages = {};
    var surfaces = get_surface_type_counts();
    var qualities = get_quality_counts();
    for(surface in surfaces) {
        if(!(surface in percentages)) {
            percentages[surface] = 0;
        }
        percentages[surface] = parseFloat(surfaces[surface]) / parseFloat(totals_['SURFACE']);
    }
    for(quality in qualities) {
        if(!(quality in percentages)) {
            percentages[quality] = 0;
        }
        percentages[quality] = parseFloat(qualities[quality]) / parseFloat(totals_['QUALITY']);
    }
    for(x in images_) {
        var surface = 'na';
        var quality = 'na';
        if('SURFACE' in images_[x]) {
            surface = images_[x]['SURFACE'];
        }
        if('QUALITY' in images_[x]) {
            quality = images_[x]['QUALITY'];
        }
        var _classification_ = surface.toLowerCase() + '-' + quality.toLowerCase();
        if(!(_classification_ in counts)) {
            counts[_classification_] = 0;
        }
        counts[_classification_]++;
    }
    render_project_summary_data(counts, percentages)
}

function render_project_summary_data(counts, percentages) {
    console.log('render_project_summary_data');
    if(geometry_length) {
        for(var x in counts) {
            var surface = x.split('-')[0];
            var quality = x.split('-')[1];
            if(surface == 'earth') {
                surface = 'dirt';
            }
            x = surface + '-' + quality;
            console.log(x);
            var val = parseFloat(percentages[surface]) + parseFloat(percentages[quality]);
            if(!val) {
                $('#' + x + '-percent').html('0');
                $('#' + x + '-km').html('0');
            }
            else {
                $('#' + x + '-percent').html((Math.round((val * 100) * 100) / 100) + ' %');
                $('#' + x + '-km').html((Math.round((val * geometry_length) * 100) / 100) + ' km');
            }
        }
        for(var x in get_surface_type_counts()) {
            var els = $('[id^=' + x + ']');
            var total = {
                'percent': 0,
                'km': 0,
            };
            console.log(total);
            for(var i = 0; i < els.length; i++) {
                if(!els[i].textContent) {
                    continue;
                }
                if(els[i].id.indexOf('-percent') != -1) {
                    total['percent'] += parseFloat(els[i].textContent.replace(' %', ''));
                }
                else if(els[i].id.indexOf('-km') != -1) {
                    total['km'] += parseFloat(els[i].textContent.replace(' KM', ''));
                }
            }
            $('[id$=' + x + '-percent]').html((Math.round(total['percent'] * 100) / 100) + ' %');
            $('[id$=' + x + '-km]').html((Math.round(total['km'] * 100) / 100) + ' km');
        }
        var surfaces = ['concrete', 'asphalt', 'gravel', 'dirt'];
        var qualities = ['good', 'fair', 'poor', 'bad'];
        for(var i = 0; i < qualities.length; i++) {
            var total = {
                'percent': 0,
                'km': 0,
            }
            for(var j = 0; j < surfaces.length; j++) {
                console.log('#' + surfaces[j] + '-' + qualities[i] + '-percent', '#' + surfaces[j] + '-' + qualities[i] + '-km');
                var val_p = parseFloat($('#' + surfaces[j] + '-' + qualities[i] + '-percent')[0].textContent);
                var val_k = parseFloat($('#' + surfaces[j] + '-' + qualities[i] + '-km')[0].textContent);
                if(val_p && val_k) {
                    total['percent'] += val_p;
                    total['km'] += val_k;
                }
            }
            if(total.percent && total.km) {
                console.log('#total-' + qualities[i] + '-percent', total.percent, total.km);
                $('#total-' + qualities[i] + '-percent').html((Math.round(total.percent * 100) / 100) + ' %')
                $('#total-' + qualities[i] + '-km').html((Math.round(total.km * 100) / 100) + ' km')
            }
            console.log(qualities[i], total);
        }
        var _asset_values_ = ['CONCRETE-GOOD', 'CONCRETE-FAIR', 'CONCRETE-POOR', 'CONCRETE-BAD', 'ASPHALT-GOOD', 'ASPHALT-FAIR', 'ASPHALT-POOR', 'ASPHALT-BAD', 'GRAVEL-GOOD', 'GRAVEL-FAIR', 'GRAVEL-POOR', 'GRAVEL-BAD', 'EARTH-GOOD', 'EARTH-FAIR', 'EARTH-POOR', 'EARTH-BAD'];
        var _total_values_ = {
            'CONCRETE': 0.0,
            'ASPHALT': 0.0,
            'GRAVEL': 0.0,
            'EARTH': 0.0,
            'GOOD': 0.0,
            'FAIR': 0.0,
            'POOR': 0.0,
            'BAD': 0.0,
        }
        for(var i = 0; i < _asset_values_.length; i++) {
            var asset_value_name = _asset_values_[i].replace('EARTH', 'DIRT');
            var _KM_ = parseFloat($('#' + asset_value_name.toLowerCase() + '-km').text().replace(' KM', ''));
            var _COMPUTED_ = parseFloat($('#computed-' + _asset_values_[i].toLowerCase()).text().replace('P', '').replace(/,/g, ''));
            var _KMCOMPUTED_ = _KM_ * _COMPUTED_;
            console.log(asset_value_name, _KM_, _COMPUTED_, _KMCOMPUTED_);
            if(!(isNaN(_KMCOMPUTED_))) {
                console.log(_KMCOMPUTED_);
                $('#value-' + _asset_values_[i].toLowerCase()).text(_KMCOMPUTED_.toCurrency('P '));
                $('#value2-' + _asset_values_[i].toLowerCase()).text(_KMCOMPUTED_.toCurrency('P '));
                $('#value2-' + _asset_values_[i].toLowerCase()).attr('title', 'Computed at ' + _COMPUTED_.toCurrency('P ') + ' per KM');
                $('#computed2-' + _asset_values_[i].toLowerCase()).text(_COMPUTED_.toCurrency('P '));
            }
            else {
                $('#value-' + _asset_values_[i].toLowerCase()).text('P 0.00');
            }
        }
        console.log(_total_values_);
        for(var x in _total_values_) {
            for(var i = 0; i < _asset_values_.length; i++) {
                var asset_value_name = _asset_values_[i].replace('DIRT', 'EARTH');
                if(asset_value_name.indexOf(x) != -1) {
                    _total_values_[x] += parseFloat($('#value2-' + asset_value_name.toLowerCase()).text().replace('P ', '').replace(/,/g, ''));
                }
            }
        }
        var total2_total = 0.0;
        for(var x in _total_values_) {
            $('#total2-' + x.toLowerCase()).text(_total_values_[x].toCurrency('P '));
            if(['CONCRETE', 'ASPHALT', 'GRAVEL', 'EARTH'].indexOf(x) != -1) {
                total2_total += _total_values_[x];
            }
        }
        $('#total2-total').text(total2_total.toCurrency('P '));
        render_surface_quality_charts();
    }
    else {
        setTimeout(function() {
            render_project_summary_data(counts, percentages);
        }, 500);
    }
}

function render_surface_quality_charts() {
    var surfaces = ['concrete', 'asphalt', 'gravel', 'dirt'];
    var qualities = ['good', 'fair', 'poor', 'bad'];
    for(var i = 0; i < surfaces.length; i++) {
        var values = {};
        var data = [
            {data: [[0, 1]], color: $goodPoints, label: "GOOD"},
            {data: [[1, 2]], color: $fairPoints, label: "FAIR"},
            {data: [[2, 3]], color: $poorPoints, label: "POOR"},
            {data: [[3, 4]], color: $badPoints, label: "BAD"}
        ];
        for(var j = 0; j < qualities.length; j++) {
            values[qualities[j]] = {}
            values[qualities[j]]['percent'] = parseFloat($('#' + surfaces[i] + '-' + qualities[j] + '-percent').text());
            values[qualities[j]]['km'] = parseFloat($('#' + surfaces[i] + '-' + qualities[j] + '-km').text());
            data[j].data[0][1] = values[qualities[j]]['percent'];
        }
        console.log(values);
        $.plot($("#" + surfaces[i] + "-chart"), data, {
            grid : {
                show : true,
                hoverable : true,
                clickable : true,
                tickColor : $chartBorderColor,
                borderWidth : 0,
                borderColor : $chartBorderColor,
                labelMargin: 20
            },
            xaxis: {
                ticks: [[0,'GOOD'],[1,'FAIR'],[2,'POOR'], [3,'BAD']],
            },
            series: {
                bars : {
                    show : true,
                    barWidth : 0.3,
                    fill: true,
                    align: "center",
                }
            },
            legend : true,
            tooltip : true,
            tooltipOpts : {
                content : function getTooltip(label, x, y) {
                    console.log(values);
                    return '<div class="graph-tooltip">' + values[qualities[j]]['km'] + 'km<br/>' + values[qualities[j]]['percent'] + '%</div>';
                },
                defaultTheme : false
            }
        });
    }
}


function render_surface_type_stats(){

    var counts = get_surface_type_counts();

    $('.total-concrete-points').html('<b>' + counts['concrete'] + '</b>');
    $('.total-asphalt-points').html('<b>' + counts['asphalt'] + '</b>');
    $('.total-gravel-points').html('<b>' + counts['gravel'] + '</b>');
    $('.total-dirt-points').html('<b>' + counts['dirt'] + '</b>');
}


function render_surface_chart(){
    var counts = get_surface_type_counts();
    var data = [
        {data: [[0,counts['concrete']]], color: $concretePoints, label: "CONCRETE"},
        {data: [[1,counts['asphalt']]], color: $asphaltPoints, label: "ASPHALT"},
        {data: [[2,counts['gravel']]], color: $gravelPoints, label: "GRAVEL"},
        {data: [[3,counts['dirt']]], color: $dirtPoints, label: "EARTH"}
    ];
    $.plot($("#surface-chart"), data, {
        grid : {
            show : true,
            hoverable : true,
            clickable : true,
            tickColor : $chartBorderColor,
            borderWidth : 0,
            borderColor : $chartBorderColor,
        },
        xaxis: {
            ticks: [[0,'CONCRETE'],[1,'ASPHALT'],[2,'GRAVEL'], [3,'EARTH']],
        },
        labelWidth: 500,
        alignTicksWithAxis: true,
        tickLength: 100,
        series: {
            bars : {
                show : true,
                barWidth : 0.3,
                fill: 1,
                align: "center"
            }
        },
        legend : true,
        tooltip : true,
        tooltipOpts : {
            content : function getTooltip(label, x, y) {
                return '<div class="graph-tooltip">' + y + ' Points</div>';
            },
            defaultTheme : false
        }
    });
}


function render_quality_chart(){
    var counts = get_quality_counts();
    var data = [
        {data: [[0,counts['good']]], color: $goodPoints, label: "GOOD"},
        {data: [[1,counts['fair']]], color: $fairPoints, label: "FAIR"},
        {data: [[2,counts['poor']]], color: $poorPoints, label: "POOR"},
        {data: [[3,counts['bad']]], color: $badPoints, label: "BAD"}
    ];
    $.plot($("#quality-chart"), data, {
        grid : {
            show : true,
            hoverable : true,
            clickable : true,
            tickColor : $chartBorderColor,
            borderWidth : 0,
            borderColor : $chartBorderColor,
            labelMargin: 20
        },
        xaxis: {
            ticks: [[0,'GOOD'],[1,'FAIR'],[2,'POOR'], [3,'BAD']],
        },
        series: {
            bars : {
                show : true,
                barWidth : 0.3,
                fill: true,
                align: "center",
            }
        },
        legend : true,
        tooltip : true,
        tooltipOpts : {
            content : function getTooltip(label, x, y) {
                return '<div class="graph-tooltip">' + y + ' Points</div>';
            },
            defaultTheme : false
        }
    });

    // if(qualityChart) {
    //  qualityChart.update();
    // }
    // else {
    //  var ctx = document.getElementById("quality_chart").getContext("2d");
    //  var qualityChart = new Chart(ctx).Doughnut(quality_chart_data, {animation : false, segmentStrokeColor : "#3E4350"});
    // }
}


function render_table() {
    table.clear().draw();
    var _db_ = {};
    for(x in db_) {
        if(!(db_[x].image_id in _db_)) {
            _db_[db_[x].image_id] = {}
            _db_[db_[x].image_id].thumb = db_[x].image_serving_url;
            _db_[db_[x].image_id].image = db_[x].image_url;
            _db_[db_[x].image_id].qualities = [];
            _db_[db_[x].image_id].surfaces = [];
            _db_[db_[x].image_id].users = [];
            _db_[db_[x].image_id].dates = [];
        }
        if(db_[x].classification_type == 'SURFACE') {
            _db_[db_[x].image_id].surfaces.push(db_[x].classification);
        }
        if(db_[x].classification_type == 'QUALITY') {
            _db_[db_[x].image_id].qualities.push(db_[x].classification);
        }
        if(_db_[db_[x].image_id].users.indexOf(db_[x].user.name) == -1) {
            _db_[db_[x].image_id].users.push(db_[x].user.name);
        }
        if(_db_[db_[x].image_id].dates.indexOf(moment(db_[x].created).format('MMMM DD, YYYY')) == -1) {
            _db_[db_[x].image_id].dates.push(moment(db_[x].created).format('MMMM DD, YYYY'));
        }
    }    

    // db.sort(function(a, b) {
    //  return moment(b.updated) - moment(a.updated);
    // });

    for(x in _db_) {
        var conflict = false;
        var tr = [];
        tr.push('<a href="' + _db_[x].image + '" data-lightbox="images"><img style="width: 75px;" src="' + _db_[x].thumb + '=s75-c" alt="' + _db_[x].image + '" id="'+ x +'"></a>');
        var qualities = '';
        if(_db_[x].qualities.length > 1) {
            qualities = _db_[x].qualities.join('<br/>');
            conflict = true;
        }
        else if(_db_[x].qualities.length == 1) {
            qualities = _db_[x].qualities[0];
        }
        tr.push(qualities);
        var surfaces = '';
        if(_db_[x].surfaces.length > 1) {
            surfaces = _db_[x].surfaces.join('<br/>');
            conflict = true;
        }
        else if(_db_[x].surfaces.length == 1) {
            surfaces = _db_[x].surfaces[0];
        }
        tr.push(surfaces);
        var users = '';
        if(_db_[x].users.length > 1) {
            users = _db_[x].users.join('<br/>');
        }
        else if(_db_[x].users.length == 1) {
            users = _db_[x].users[0];
        }
        tr.push(users);
        var dates = '';
        if(_db_[x].dates.length > 1) {
            dates = _db_[x].dates.join('<br/>');
        }
        else if(_db_[x].dates.length == 1) {
            dates = _db_[x].dates[0];
        }
        tr.push(dates); 
        var added = table.row.add(tr);
        if(conflict) {
            $(added.node()).addClass('conflict-row');
        }
        table.draw();
    }
}

function get_markers_from_db() {
    // get all existing markers from all classifications
    remove_markers_from_map();
    for(x in db_) {
        if(db_[x].lat && db_[x].lng) {
            var lat = db_[x].lat;
            var lng = db_[x].lng;
            if(lat && lng) {
                var lat_lng = new google.maps.LatLng(lat, lng);
                if(db_[x].classification_type == 'SURFACE') {
                    switch(db_[x].classification) {
                        case 'CONCRETE':
                            add_a_concrete_marker(lat_lng, db_[x].id);
                            break;
                        case 'ASPHALT':
                            add_a_tarmac_marker(lat_lng, db_[x].id);
                            break;
                        case 'GRAVEL':
                            add_a_gravel_marker(lat_lng, db_[x].id);
                            break;
                        case 'EARTH':
                            add_an_earth_marker(lat_lng, db_[x].id);
                            break;
                    }
                }
                if(db_[x].classification_type == 'QUALITY') {
                    switch(db_[x].classification) {
                        case 'GOOD':
                            add_a_good_marker(lat_lng, db_[x].id);
                            break;
                        case 'FAIR':
                            add_a_fair_marker(lat_lng, db_[x].id);
                            break;
                        case 'POOR':
                            add_a_poor_marker(lat_lng, db_[x].id);
                            break;
                        case 'BAD':
                            add_a_bad_marker(lat_lng, db_[x].id);
                            break;
                    }
                }
            }
        }
    }
    render_markers_on_map();
}

function remove_markers_from_map(){
    // setMap(null) on all markers
    for(var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = [];
}

function add_a_good_marker(latlng, data_id) {
    var marker = new google.maps.Marker({
        position: latlng,
        icon: '/images/icn-good2.png',
    })
    marker.addListener('click', function() {
        $("#" + data_id).click();
    });
    markers.push(marker);
}

function add_a_fair_marker(latlng, data_id) {
    var marker = new google.maps.Marker({
        position: latlng,
        icon: '/images/icn-fair2.png',
    });
    marker.addListener('click', function() {
        $("#" + data_id).click();
    });
    markers.push(marker);
}

function add_a_poor_marker(latlng, data_id) {
    var marker = new google.maps.Marker({
        position: latlng,
        icon: '/images/icn-poor2.png',
    });
    marker.addListener('click', function() {
        $("#" + data_id).click();
    });
    markers.push(marker);
}

function add_a_bad_marker(latlng, data_id) {
    var marker = new google.maps.Marker({
        position: latlng,
        icon: '/images/icn-bad2.png',
    });
    marker.addListener('click', function() {
        $("#" + data_id).click();
    });
    markers.push(marker);
}

function add_a_concrete_marker(latlng, data_id) {
    var marker = new google.maps.Marker({
        position: latlng,
        icon: '/images/icn-concrete2.png',
    });
    marker.addListener('click', function() {
        $("#" + data_id).click();
    });
    markers.push(marker);
}

function add_a_tarmac_marker(latlng, data_id) {
    var marker = new google.maps.Marker({
        position: latlng,
        icon: '/images/icn-tarmac2.png',
    });
    marker.addListener('click', function() {
        $("#" + data_id).click();
    });
    markers.push(marker);
}

function add_a_gravel_marker(latlng, data_id) {
    var marker = new google.maps.Marker({
        position: latlng,
        icon: '/images/icn-gravel2.png',
    });
    marker.addListener('click', function() {
        $("#" + data_id).click();
    });
    markers.push(marker);
}

function add_an_earth_marker(latlng, data_id) {
    var marker = new google.maps.Marker({
        position: latlng,
        icon: '/images/icn-dirt2.png',
    });
    marker.addListener('click', function() {
        $("#" + data_id).click();
    });
    markers.push(marker);
}

function render_markers_on_map(){
    // loop through db and call_marker
    var markerCluster = new MarkerClusterer(thisMap, markers);
    markerCluster.setMaxZoom(14);
}

init();

$('#btn-project-summary-table, #btn-project-summary-graph').on('click', function() {
    $('#project-summary-table-container, #project-summary-graph-container').toggleClass('hidden');
    $('#btn-project-summary-table, #btn-project-summary-graph').toggleClass('active');
});

$('#asset-values-modal-close, #asset-values-modal-show').on('click', function() {
    $('#asset-values-modal').toggleClass('hidden');
    $('body').toggleClass('noscroll');
});
$('#btn-csv-download').on('click', function() {
    $('a.dt-button.buttons-csv.buttons-html5').trigger('click');
});