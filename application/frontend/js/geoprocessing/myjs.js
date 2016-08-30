$(document).ready(function(){

    keyBoard_shortcut();

	window.current_image_index = 0;

	function loadNextImage(){
		window.current_image_index++;

		if(window.list_of_images.length > window.current_image_index){
			load_Image(window.current_image_index);
		}
        else {
            show_done();
        }

		window.location.hash = window.current_image_index;
	}


    function show_done(){
        $('#geoprocessing_controls').hide();
        $('#go_back_button').show();
    }

	var imgIndex = 0; //index of every image
	var imgLength;  //  variable of the length of image json array
	var cur = window.location.href.split("&");
	var proj = cur[0].split("=");

    var coa_base_url = '';
    // var coa_base_url = 'http://coageostore.appspot.com';

	$("#projID").text(window.project_code);

	var proj_cursor = cur[1];
	try {
		var curVal = proj_cursor.split("=");
	}
	catch(e){
		var curVal = ['','']
	}

	window.list_of_images = [];


	var dataIndex;
	var url = coa_base_url + "/api/v1/data?type=IMAGE&project_code=" + window.project_code;
	console.log(url);
	$.ajax({
		  url:url, //this can be any file with json array
		  type:'get',
		  dataType: 'json',
		  success: function(json) {
			var cursorErr = 0;
			for(var i = 0;i < json.data.length; i++)
			{
				window.list_of_images.push(json.data[i]);
				cursorErr ++;
			}
			if (cursorErr > 0) {
				loadNextBatch(json.cursor);
			}else{
				$("#projectImg").html('<h4><i>No Images found..</i></h4>');
				disable_if_noImage_found();
			}

		  }
	});

    var project_code;
    var latlng;
    var image_url;
    var image_serving_url;

	function load_Image(i){
		var image = window.list_of_images[i];
		$("#projectImg").html('<img class="imageID" data-parentcode="' +image.parent_code + '" data-datasetcode="' + image.dataset_code + '" rel="'+image.id+'" src="'+image.image.serving_url +'" /><div style="text-align:center">' + (window.current_image_index + 1) + ' of ' + window.list_of_images.length + '</div>');

		project_code = image.project_code;
		latlng = image.latlng;
		image_url = image.image.file_url;
        image_serving_url = image.image.serving_url;
	}


    function preload(sources){
      var images = [];
      for (i = 0, length = sources.length; i < length; ++i) {
        images[i] = new Image();
        images[i].src = sources[i];
        console.log('prefetching', sources[i]);
      }
    }


    function prefetchImages(){
        var sources = [];
        for(var i=0; i<window.list_of_images.length; i++){
            sources.push(window.list_of_images[i].image.serving_url);
        }
        preload(sources);
    }


	var count = 1;
	function loadNextBatch(cursor){
		count++;
		if(cursor){
			$.ajax({
				  url: coa_base_url + "/api/v1/data?type=IMAGE&project_code=" + window.project_code + "&cursor=" + cursor, //this can be any file with json array
				  type:'get',
				  dataType: 'json',
				  success: function(json) {
					for(var i = 0;i < json.data.length; i++)
					{
						window.list_of_images.push(json.data[i]);
					}
					loadNextBatch(json.cursor);
				  }
			});
		}
		else {
			if(window.location.hash){
				window.current_image_index = parseInt(window.location.hash.replace('#', ''));
			}
			load_Image(window.current_image_index);
            prefetchImages();
		}
	}

	function disable_if_noImage_found(){
		isRoad_or_notRoad()
	}

	function isRoad_or_notRoad () {
		$("#isRoad").attr('disabled', 'disabled');
		$("#isNotRoad").attr('disabled', 'disabled');
	}

	function keyBoard_shortcut () {
		$(window).keydown(function(e) {
		switch (e.keyCode) {
			case 49:
				$("#isRoad").click();
				return;
			case 50:
				$("#isNotRoad").click();
				return;
			case 81:
                $("#concrete").click();
				return;
			case 87:
				$("#asphalt").click();
				return;
			case 69:
				$("#gravel").click();
				return;
			case 82:
				$("#earth").click();
				return;
			case 65:
				$("#good").click();
				return;
			case 83:
				$("#fair").click();
				return;
			case 68:
				$("#poor").click();
				return;
			case 70:
				$("#bad").click();
				return;
			case 13:
				$("#subnext").click();
				return;
			default:
				break;
	  		}
		});
	}

	function disable_all()
	{
		$("#isRoad").attr('checked', false);
		$("#isNotRoad").attr('checked', false);
		$("#isRoad").attr('disabled', true);
		$("#isNotRoad").attr('disabled', true);
		$(".surface_type").attr('checked', false);
		$(".surface_type").attr('disabled', true);
		$(".surface_qty").attr('checked', false);
		$(".surface_qty").attr('disabled', true);
		$(this).attr('disabled', true);
	}


	$("#subnext").click(function(){
        if(!$("#subnext").prop('disabled')){
            var imgID = $('.imageID').attr('rel');

            if($('#isRoad').is(':checked')){
                var parent_code = $("#projectImg .imageID").data('parentcode') ? $("#projectImg .imageID").data('parentcode') : '';

                if(!parent_code){
                    parent_code = $("#projectImg .imageID").data('datasetcode');
                }

                if(parent_code == 'undefined'){
                    parent_code = $("#projectImg .imageID").data('datasetcode');
                }

                if(parent_code == 'null'){
                    parent_code = $("#projectImg .imageID").data('datasetcode');
                }

                if($('.surface_type').is(':checked'))
                {
                    var surface_type = $('.surface_type:checked:first').val();
                    surface_type = surface_type.toUpperCase();
                }

                if($(".surface_qty").is(':checked'))
                {
                    var surface_quality = $('.surface_qty:checked:first').val();
                    surface_quality = surface_quality.toUpperCase();
                }

                var lat = latlng.split(',')[0];
                var lng = latlng.split(',')[1];

                $.ajax({
                    url:"/api/v1/data",
                    type:'post',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        indexed_type:'CLASSIFICATION',
                        indexed_image_id: imgID,
                        indexed_parent_code: parent_code,
                        indexed_project_code: project_code,
                        indexed_lat: lat,
                        indexed_lng: lng,
                        indexed_image_url: image_url,
                        indexed_image_serving_url: image_serving_url,
                        indexed_classification_type: 'SURFACE',
                        indexed_is_road: '1',
                        indexed_classification: surface_type
                    })
                });

                $.ajax({
                    url:"/api/v1/data",
                    type:'post',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        indexed_type:'CLASSIFICATION',
                        indexed_image_id: imgID,
                        indexed_parent_code: parent_code,
                        indexed_project_code: project_code,
                        indexed_lat: lat,
                        indexed_lng: lng,
                        indexed_image_url: image_url,
                        indexed_image_serving_url: image_serving_url,
                        indexed_classification_type: 'QUALITY',
                        indexed_is_road: '1',
                        indexed_classification: surface_quality
                    })
                });

                $.ajax({
                    url:"/api/v1/data/" + imgID,
                    type:'post',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        indexed_is_road: '1',
                        indexed_surface_type: surface_type,
                        indexed_surface_quality: surface_quality
                    })
                });
            }
            if ($('#isNotRoad').is(':checked')) {

                $.ajax({
                    url:"/api/v1/data",
                    type:'post',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        indexed_type:'CLASSIFICATION',
                        indexed_image_id: imgID,
                        indexed_parent_code: parent_code,
                        indexed_project_code: project_code,
                        indexed_lat: lat,
                        indexed_lng: lng,
                        indexed_image_url: image_url,
                        indexed_image_serving_url: image_serving_url,
                        indexed_classification_type: 'SURFACE',
                        indexed_is_road: '0',
                        indexed_classification: 'NA'
                    })
                });

                $.ajax({
                    url:"/api/v1/data",
                    type:'post',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        indexed_type:'CLASSIFICATION',
                        indexed_image_id: imgID,
                        indexed_parent_code: parent_code,
                        indexed_project_code: project_code,
                        indexed_lat: lat,
                        indexed_lng: lng,
                        indexed_image_url: image_url,
                        indexed_image_serving_url: image_serving_url,
                        indexed_classification_type: 'QUALITY',
                        indexed_is_road: '0',
                        indexed_classification: 'NA'
                    })
                });

                $.ajax({
                    url:"/api/v1/data/" + imgID,
                    type:'post',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        indexed_is_road: '0',
                        indexed_surface_type: 'NA',
                        indexed_surface_quality: 'NA'
                    })
                });
            }

            if(window.current_image_index == (window.list_of_images.length - 1)){
                // last image
                $.ajax({
                    url:"/api/v1/data/" + project_code,
                    type:'post',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        indexed_has_classification: '1'
                    })
                });
            }


            $("#isRoad").attr('checked', false);
            $("#isNotRoad").attr('checked', false);
            $(".surface_type").attr('checked', false);
            $(".surface_type").attr('disabled', true);
            $(".surface_qty").attr('checked', false);
            $(".surface_qty").attr('disabled', true);
            $(this).attr('disabled', true);

            loadNextImage();
        }
	});

	//event when selecting not a road option
	$("#isNotRoad").click(function(){
		 $('.surface_type').attr('disabled','disabled');
		 $('.surface_type').attr('checked', false);
		 $('.surface_qty').attr('disabled','disabled');
		 $('.surface_qty').attr('checked', false);
		 $("#subnext").attr('disabled', false)
	});

	//event when selecting the road option
	$("#isRoad").click(function(){
		 $('.surface_type').attr('disabled',false);
		 $("#subnext").attr('disabled', 'disabled');
	});

	var checked = 0;
	var selected = 0;

	//event when selecting the surface type
	$(".surface_type").change(function(){

		if($(".surface_type:checked").length > 0)
		{
			$('.surface_qty').attr('disabled',false);
			checked = 1;
		}else{
			checked = 0;
			$('.surface_qty').attr('checked', false);
			$('.surface_qty').attr('disabled','disabled');
			$('#subnext').attr('disabled',true);
		}


	});


	//event when selecting the surface quality
	$(".surface_qty").click(function(){

        setTimeout(function(){
            if($(".surface_qty:checked").length > 0 && checked > 0)
            {
                $("#subnext").attr('disabled', false);
            }else{
                $('.surface_qty').attr('checked', false);
                $('.surface_qty').attr('disabled','disabled');
            }
        }, 10);

	});

	// $(window).keydown(function(e) {
	// console.log(e);
	// switch (e.keyCode) {
	// 	case 49:
	// 		$("#isRoad").prop("checked", true);
	// 		return;
	// 	case 50:
	// 		$("#isNotRoad").prop("checked", true);
	// 		return;
	// 	case 81:
	// 		$("#concrete").prop("checked", true);
	// 		return;
	// 	case 87:
	// 		$("#asphalt").prop("checked", true);
	// 		return;
	// 	case 69:
	// 		$("#gravel").prop("checked", true);
	// 		return;
	// 	case 82:
	// 		$("#earth").prop("checked", true);
	// 		return;
	// 	case 65:
	// 		$("#good").prop("checked", true);
	// 		return;
	// 	case 83:
	// 		$("#fair").prop("checked", true);
	// 		return;
	// 	case 68:
	// 		$("#poor").prop("checked", true);
	// 		return;
	// 	case 70:
	// 		$("#bad").prop("checked", true);
	// 		return;
	// 	default:
	// 		break;
 //  	}
	// });

});

