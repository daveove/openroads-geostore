
  window.current_images2 = {};
  window.images_are_displayed2 = false;



  function submit_road_class2(iid, road_class, road_quality, node) {
    var node = $(node).parent().siblings('.road-class')
    console.log(node);
    $.post('/api/v1/road-class', {'id': iid, 'class': road_class, 'quality': road_quality}, function(data) {
      var response = JSON.parse(data['data']);
      console.log(response);
      $(node).html('<i class="fa fa-road"></i> ' + response['road_class'] + '<br/><i class="fa fa-star"></i> ' + response['road_quality']);
    }, 'json');
  }

  function road_class_form2(iid) {
    /*$.getJSON('http://open-data-network.appspot.com/api/v1/data/' + iid + '?callback=?', function(data) {
      if(('road_qualtiy' in data.data && !('road_quality' in data.data)) || (!('road_class' in data.data) && !('road_quality' in data.data))) {
        $.post('/api/v1/update-road', {'image-id': iid}, function(response) {
          console.log(JSON.parse(response.data));
        })
      }
    });*/
    html = '<div class="road-class-close">&times;</div>';
    html += '<b>Class</b>';
    html += '<div class="radio-group">';
    html += '<label><input type="radio" name="road-class" value="Concrete"> Concrete</label>';
    html += '<label><input type="radio" name="road-class" value="Asphalt"> Asphalt</label>';
    html += '<label><input type="radio" name="road-class" value="Gravel"> Gravel</label>';
    html += '<label><input type="radio" name="road-class" value="Dirt"> Earth</label>';
    html += '</div>';
    html += '</div>';
    html += '<div>';
    html += '<b>Quality</b>';
    html += '<div class="radio-group">';
    html += '<label><input type="radio" name="road-quality" value="Good"> Good</label>';
    html += '<label><input type="radio" name="road-quality" value="Fair"> Fair</label>';
    html += '<label><input type="radio" name="road-quality" value="Poor"> Poor</label>';
    html += '<label><input type="radio" name="road-quality" value="Bad"> Bad</label>';
    html += '</div>';
    html += '</div>';
    html += '<button class="road-class-submit">Submit</button>'
    return html;
  }


  var rad2 = function(x) {
    return x * Math.PI / 180;
  };

  var getDistance2 = function(p1, p2) {
    var R = 6378137; // Earth’s mean radius in meter
    var dLat = rad2(p2.lat() - p1.lat());
    var dLong = rad2(p2.lng() - p1.lng());
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(rad2(p1.lat())) * Math.cos(rad2(p2.lat())) *
            Math.sin(dLong / 2) * Math.sin(dLong / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d; // returns the distance in meter
  };

  Number.prototype.formatMoney = function(c, d, t){
  var n = this,
      c = isNaN(c = Math.abs(c)) ? 2 : c,
      d = d == undefined ? "." : d,
      t = t == undefined ? "," : t,
      s = n < 0 ? "-" : "",
      i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
      j = (j = i.length) > 3 ? j % 3 : 0;
     return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
   };

  String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
  };

  $.fn.filterNode = function(name) {
    return this.find('*').filter(function() {
      return this.nodeName === name;
    });
  };

  String.prototype.title = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
  }

  Array.prototype.remove = function() {
      var what, a = arguments, L = a.length, ax;
      while (L && this.length) {
          what = a[--L];
          while ((ax = this.indexOf(what)) !== -1) {
              this.splice(ax, 1);
          }
      }
      return this;
  };
  $(document).ready(function() {
    $('ul.menu-bar-nav').css('float', 'right');
    initialize_viewer();
    show_loader_with_timeout();

    $('body').on('click', '.btn-move-forward', function(e){
      move_forward();
    });

    $('body').on('click', '.btn-move-backward', function(e){
      move_backward();
    });

    $('body').on('click', '#special_left', function(e){
      move_special_left();
    });

    $('body').on('click', '#special_right', function(e){
      move_special_right();
    });

    $('body').on('click', '#proj-gallery', function(e){
      display_images();
      display_images();
    });

    $("body").on('click', '.progress-timeline-marker', function(e){
        display_images($(this).data('marker-index'));
    });

    $("body").on("click", ".close-btn img", function(){
      hide_viewers();
    });



  });


  function initialize_viewer(){
    history.pushState("", document.title, window.location.pathname);
    get_all_projects();

    $('#proj-gallery-lightbox-v').slick();
    if(window.location.href.indexOf('#') != -1) {
      from_url = true;
      var url = window.location.href.split('#');
      var project = url[url.length - 1].split('%');
      try{
        if(project[1]){
          var id = project[1].split('@')[0];
        }
      }
      catch(e){
        console.log(e);
      }
      var project = project[0];
      console.log(project);
      if(project == 'gaa') {
        select_program('GAA');
      }
      else if(project == 'bub') {
        select_program('BUB');
      }
      else if(project == 'prdp') {
        select_program('PRDP');
      }
      else if(project == 'trip') {
        select_program('TRIP');
      }
      else if(project == 'coacpa') {
        select_program('CPA');
      }
    }
  }



  window.current_images_array2 = [];
  window.current_resource_images2 = [];





  /**
  * Get distance of two latlong coordinates in kilometers.
  * @param {Number} lat1 - The first latitude value to be compared.
  * @param {Number} lon1 - The first longitude value to be compared.
  * @param {Number} lat2 - The second latitude value to be compared.
  * @param {Number} lon2 - The second latitude value to be compared.
  * @return {Number} d - The distance in kilometers.
  */
  function getDistanceFromLatLonInKm2(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad2(lat2-lat1);  // deg2rad below
  var dLon = deg2rad2(lon2-lon1);
  var a =
  Math.sin(dLat/2) * Math.sin(dLat/2) +
  Math.cos(deg2rad2(lat1)) * Math.cos(deg2rad2(lat2)) *
  Math.sin(dLon/2) * Math.sin(dLon/2)
  ;
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c; // Distance in km
  return d;
  }

  /**
  * Converts a degree value to radius.
  * @param {Number} deg - The degree value to be converted.
  * @return {Number} radius - The radius converted from degrees.
  */
  function deg2rad2(deg) {
    return deg * (Math.PI/180)
  }

  /**
  * Checks if give coordinates are near each other by 10 meters.
  * @param {String} latlong1 - The first latlong coordinates to be compared.
  * @param {String} latlong2 - The second latlong coordinates to be compared.
  */
  function is_near(latlong1, latlong2){
    // console.log('is_near', latlong1, latlong2);
    lat1 = parseFloat(latlong1.split(",")[0]);
    lon1 = parseFloat(latlong1.split(",")[1]);
    lat2 = parseFloat(latlong2.split(",")[0]);
    lon2 = parseFloat(latlong2.split(",")[1]);
    var km_distance = getDistanceFromLatLonInKm2(lat1,lon1,lat2,lon2);
  // console.log("KM Distance: " + km_distance);
  if(km_distance <= 0.010){
    return true;
  }
  else {
    return false;
  }
  }




  // /**
  // * Creates markers on the timeline. Clicking on a specific marker will go to the index of the marker. (Note: not all markers on the map is shown on the timeline.)
  // * @param {String} project_code - The project code to used to load the project.
  // */
  // function create_timeline_markers(project_code) {
  //   project = window.projects_database[project_code];
  //   round = Math.round(project.image_groups[project.current_date].length / 31);
  //   if(round < 1){
  //     round = 1;
  //   }
  //   round_ = 0;
  //   for(var i = 0; i < project.image_groups[project.current_date].length; i += round) {
  //     $('ul.photo-timeline').append('<li data-latlng="' + project.image_groups[project.current_date][i][0].latlong + '" data-marker-index="' + round_ + '"><div class="progress-timeline-line"></div><i class="img-available"></i><span></span></li>');
  //     round_ += round;
  //   }
  //   var totalLi = $(".photo-timeline li:last-child").index();
  //   var liWidth = Math.floor(775 / totalLi);
  //   $('.photo-timeline li[data-marker-index]').css('width', liWidth + 'px');
  //   $('ul.photo-timeline li[data-marker-index]').on('click', function() {
  //     var index = $(this).index();
  //     // alert(index + " index");
  //     var totalLi = $(".photo-timeline li:last-child").index();
  //     // alert(totalLi + "total li");
  //     var width =  100 ;
  //     var n = (totalLi / index) - 5;
  //     // alert(n + "n orig");
  //     if(n < 1) {
  //       n = 2;
  //     }
  //     var index_ = parseInt($(this).attr('data-marker-index'));
  //     window.history.pushState({"pageTitle":project['prdp_project_name']}, project['prdp_project_name'], '/#prdp%' + project_code + '@' + index_);
  //     $('.point-number').text(index_);
  //     var staatlng = new google.maps.LatLng(window.projects_database[project_code].image_groups[project.current_date][0][0].latlong.split(',')[0], window.projects_database[project_code].image_groups[project.current_date][0][0].latlong.split(',')[1]);
  //   var curlatlng = new google.maps.LatLng(window.projects_database[project_code].image_groups[project.current_date][index_][0].latlong.split(',')[0], window.projects_database[project_code].image_groups[project.current_date][index_][0].latlong.split(',')[1]);
  //     $('.latlng-point').text((getDistance2(staatlng, curlatlng) / 1000).toFixed(2) + ' KM');
  //     $('.photo-timeline li').each(function() {
  //       if(parseInt($(this).attr('data-marker-index')) <= index_) {
  //         $(this).find('.progress-timeline-line').addClass('active');
  //       }
  //       else {
  //         $(this).find('.progress-timeline-line').removeClass('active');
  //       }
  //     });
  //     // alert(n + "n");
  //     var percentage = (index * 3) + n;
  //     // alert(percentage + "percentage");
  //     // alert(percentage);
  //     if(index !== totalLi) {
  //       $(".photo-timeline .percentage").animate({
  //         width: percentage + "%"
  //         }, 500);
  //     }
  //     else {
  //       $(".photo-timeline .percentage").animate({
  //         width: "100%"
  //         }, 500);
  //     }
  //     var index = parseInt($(this).attr('data-marker-index'));
  //     viewer_move_forward(project_code, index);
  //   });
  // }

  /**
  * Generates the project starting marker based on the image markers.
  * @param {String} project_code - The project code to used to load the project.
  */
  function generate_start_marker(project_code) {
    var project = projects_database[project_code];
    if(project.images) {
      var m = new google.maps.Marker({
        position: new google.maps.LatLng(project.images[0].latlong.split(',')[0], project.image_groups[0][0].latlong.split(',')[1]),
        map: thisMap,
        icon: '/images/start-marker.png',
        title: latlong,
        secret: index,
      });
    }
  }

  /**
  * Generates the project ending marker based on the image markers.
  * @param {String} project_code - The project code to used to load the project.
  */
  function generate_end_marker(project_code) {
    var project = projects_database[project_code],
        mrkrs = [];
    if(project.images) {
      project.sort(function(a, b) {
        return moment(b.datetime) - moment(a.datetime);
      });
      var end = project.images.length - 1;
      var m = new google.maps.Marker({
        position: new google.maps.LatLng(project.images[end].latlong.split(',')[0], project.images[end].latlong.split(',')[1]),
        map: thisMap,
        icon: '/images/start-marker.png',
        title: latlong,
        secret: index,
      });
    }
  }

  /**
  * Adds all the loaded project images to the viewer.
  * @param {String} project_code - The project code to used to load the project.
  */
  function add_images(project_code) {
    project = window.projects_database[project_code];
    if('images' in project) {
      if(project.images.length > 4) {
        var count = 0;
        while(count < 4) {
          if('image' in project.images[count]) {
            $('#proj-gallery').append('<div><img src="' + project.images[count].image['serving_url'] + '" alt=""></div>');
          }
          count++;
        }
      }
      else {
      }
    }
    setTimeout(function() {
      $("#proj-gallery").slick({
        infinite: false,
        slidesToShow: 3,
        slidesToScroll: 3,
        draggable: false
      });
    }, 250);
    $('#proj-gallery-lightbox-v').empty();
    $('#proj-gallery-lightbox-v').removeClass('slick-initialized slick-slider');
    for(var i = 0; i < project.images.length; i++) {
      comments = '';
      comments_count = 0;
      if(project.comments) {
        for(var j = 0; j < project.comments.length; j++) {
          if(project.comments[j].image_url) {
            if(project.comments[j].image_url == project.images[i].image['serving_url']) {
              comments_count++;
              comments += '<div class="comment-item block"> \
              <span class="user"> <img src="images/user-avatar_07.png" alt="" class="user-avatar">' + project.comments[j].user + ' posted</span> \
              <p class="">' + project.comments[j].message + '</p> \
              <span class="datetime">' + moment(project.comments[j].created).format('h:mma - MMM D, YYYY') + '</span> \
              </div>';
            }
          }
        }
      }
      var road_class = (project.images[i].road_class) ? project.images[i].road_class : 'To be set';
      var road_quality = (project.images[i].road_quality) ? project.images[i].road_quality : 'To be set';
      var html = '<div> \
      <a href="javascript:void(0);" class="num-comments-wrapper login-geostore"><label for="">Leave feedback</label></a>\
      <div class="comments-wrapper"> \
      <label for="leave a feedback" class="block">Leave feedback</label> \
      <textarea name="" id="" cols="20" rows="5" data-project="' + project_code + '" data-image="' + project.images[i].image['serving_url'] + '" data-project-name="' + project.prdp_project_name + '" data-project-type="prdp" data-project-id="' + project.id + '" class="comment-this-image block" placeholder="Type and press enter..."></textarea> \
      <div class="comments-list">' + comments + '</div> \
      <span class="close-comments-panel">Close this</span> \
      </div> \
      <img src="' + project.images[i].image['serving_url'] + '" alt=""> \
      <div class="road-class login-geostore"><i class="fa fa-road"></i> ' + road_class + '<br/><i class="fa fa-star"></i> ' + road_quality + '</div> \
      <div class="road-class-big" data-id="' + project.images[i].id + '">Concrete, Asphalt, Gravel, Dirt / Good, Fair, Poor, Bad</div> \
      </div>';
      $('#proj-gallery-lightbox-v').append(html);
    }
    $('.road-class').on('click', function() {
      if(!$(this).hasClass('login-geostore')) {
        $(this).toggle(function() {
          var iid = $(this).siblings('.road-class-big');
          iid.html(road_class_form2(iid.attr('data-id')));
          iid.toggle();
        });
      }
    });
    $('.road-class-big').on('click', '.road-class-close', function() {
        $(this).parent().toggle(function() {
        $(this).siblings('.road-class').toggle();
      });
    });
    $('.road-class-big').on('click', '.road-class-submit', function() {
      var road_class = $(this).parent().find('input[name="road-class"]:checked').val();
      var road_quality = $(this).parent().find('input[name="road-quality"]:checked').val();
      var iid = $(this).parent().attr('data-id');
      submit_road_class2(iid, road_class, road_quality, this);
      $(this).siblings('.road-class-close').trigger('click');
    });
    $('.photo-gallery-num span').text('+' + (project.images.length - 4)).show();
    $('.comment-this-image').on('keydown', function(e) {
      var key = e.which;
      if(key == 13) {
        e.preventDefault();
        $(this).attr('disabled', '');
        var comment = $(this).val(),
        image = $(this).data('image'),
        project_code = $(this).data('project');
        name = $(this).data('project-name');
        id = $(this).data('project-id');
        post_image_comment(project_code, image, comment, name, id, this);
      }
    });
    $("#proj-gallery-lightbox-v").slick({
      slidesToShow: getSlidesToShow(project.images.length),
      speed: 0,
      slidesToScroll: 1,
      centerMode: true,
      focusOnSelect: true,
      // adaptiveHeight: true,
      prevArrow: "<button class='left-gallery-nav'><i class='fa fa-chevron-left'></i></button",
      nextArrow: "<button class='right-gallery-nav'><i class='fa fa-chevron-right'></i></button",
      variableWidth: true,
      accessibility: true,
    });
    $('a.num-comments-wrapper, div.road-class').attr('data-url', 'https://open-data-network.appspot.com/login/authorize?r=' + url + 'login');
    if(user.token) {
      $('a.num-comments-wrapper, div.road-class').removeClass('login-geostore');
    }
    $('script[src="https://open-data-network.appspot.com/js/geostore-login.js"]').remove();
    $('body').append('<script src="https://open-data-network.appspot.com/js/geostore-login.js"></script>');
  }

  function setOpacity(data_length) {
    if (parseInt($('.btn-move-forward').attr('data-marker-index')) <= 0) {
      $('.btn-move-forward').css('opacity', '0.8');
    } else {
      $('.btn-move-forward').css('opacity', '1');
    }

    if (parseInt($('.btn-move-backward').attr('data-marker-index')) >= data_length) {
      $('.btn-move-backward').css('opacity', '0.8');
    } else {
      $('.btn-move-backward').css('opacity', '1');
    }

  }


  /**
  * Get slide to show in image slider.
  * @param {int} images length - The images length use to iterate slider.
  */
  function getSlidesToShow(image_length) {
    return image_length > 3 ? 3: image_length == 0 ? 0:image_length - 1;
  }



  document.onkeydown = function(e) {
    key = e.which;
    if(key == 40) {
      if(!$('.btn-move-backward').attr('disabled')) {
        $('.btn-move-backward').trigger('click');
      }
    }
    else if(key == 27) {
      if($('#proj-gallery-lightbox-wrapper').is(':visible')) {
        $('.close-btn').trigger('click');
      }
    }
    else if(key == 38) {
      if(!$('.btn-move-forward').attr('disabled')) {
        $('.btn-move-forward').trigger('click');
      }
    }
    else if(key == 39) {
        if(window.special_images_are_displayed2){
            move_special_right();
        }
        else {
            $('#proj-gallery-lightbox-v').slick('slickNext');
        }
    }
    else if(key == 37) {
        if(window.special_images_are_displayed2){
            move_special_left();
        }
        else {
            $('#proj-gallery-lightbox-v').slick('slickPrev');
        }
    }
  }


function update_road(type, id, value, url, project, latlng) {
  console.log(arguments);
  if(arguments.length == 7) {
    var element = arguments[6];
    if(type == 'QUALITY') {
      $(element).parents('.quality-wrapper').css({'opacity': '0.75', 'pointer-events': 'none'});
    }
    else if(type == 'SURFACE') {
      $(element).parents('.surface-wrapper').css({'opacity': '0.75', 'pointer-events': 'none'});
    }
    var image = $(element).parents('#road-details-wrapper').siblings('.dl-img-btn').attr('href');
  }
  console.log(type, id, value, url);
  for(var i = 0; i < value.length; i++) {
    $.post('/api/v1/' + type.toLowerCase(), {'id': id, 'value': value[i], 'url': url, 'project': project, 'latlng': latlng, 'image': image}, function(data) {
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
  }
}



function do_nothing(){
  // do nothing
}


$('.feedback-type-select .feedback-coming-soon').on('hover', function() {
  $(this).children('b').css('display', 'block');
});


window.current_image_index = 0;

function display_images(index){
    if(window.special_images_are_displayed2){
        // do onothing
        console.log("SPECIAL IMAGES ARE DISPLAYED. DO NOTHING.");
        return;
    }
  // take grouped_images and render on a nice slick view
  // start from index
  window.images_are_displayed2 = true;

  if(index || index === 0){
    console.log(index);
    window.current_image_index = index;
  }

  var images_grouped_by_date = window.current_images2[window.current_image_index];

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


window.special_images_are_displayed2 = false;

window.current_special_image_index = 0;

function display_special_findings_viewer(index){
    // take grouped_images and render on a nice slick view
    // start from index
    window.special_images_are_displayed2 = true;

    if(index || index === 0){
        console.log(index);
        window.current_special_image_index = index;
    }

    $("#proj-gallery-lightbox-v-special").empty();

    var image = window.current_resource_images2[window.current_special_image_index];

    var html = '<div class="special-image-wrapper"> \
    <h2 class="special_viewer_title">Special Findings & Observations</h2> \
    <img src="' + image['file']['serving_url'] + '=s1000" alt=""> \
    <div class="special_showing_number">Showing ' + (window.current_special_image_index+1) + ' of ' + window.current_resource_images2.length + '</div> \
    <div class="download_special_image"><a href="' + image.original_file_url + '" target="_blank" class="fa fa-download tooltip" title="Download Image">&nbsp; Download Image</a></div> \
    </div>';
    $('#proj-gallery-lightbox-v-special').prepend(html);
    $("#special_left, #special_right").removeClass("invisible");
    if(window.current_special_image_index == 0){
        // no more left;
        $("#special_left").addClass("invisible");
    }
    if(window.current_special_image_index == window.current_resource_images2.length - 1){
        // no more right
        $("#special_right").addClass("invisible");
    }

    display_special_viewer();
}


function move_special_left(){
    if(window.current_special_image_index >= 1){
        window.current_special_image_index -= 1;
        display_special_findings_viewer();
    }
}


function move_special_right(){
    if(window.current_special_image_index < (window.current_resource_images2.length - 1)){
        window.current_special_image_index += 1;
        display_special_findings_viewer();
    }
}


function reset_viewer(){
  $("#proj-gallery-lightbox-v").slick('unslick');
  $("#proj-gallery-lightbox-v").empty();
}


function display_single_date_images(images){
  // takes one sets of images, and displays them.
  console.log("SINGLE", images);

  reset_viewer();

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

    surface_val = return_surface_value_type(road_class);

    var comments = '';

    var html = '<div class="individual-image-wrapper"> \
    <div class="date-time-image"><span>Location:</span> <b>' + image.latlong + '</b><br/><span>Time:</span> <b>' + moment(image.datetime).format('MMMM DD, YYYY H:mm A') + '</b></div> \
    <a href="' + image['image'].file_url + '" target="_blank" class="fa fa-download dl-img-btn tooltip" title="Download Image">&nbsp;</a> \
    <a href="javascript:void(0);" class="num-comments-wrapper login-geostore"><label for="">Leave feedback</label></a>\
    <div class="comments-wrapper"> \
    <label for="leave a feedback" class="block">Leave feedback</label> \
    <textarea name="" id="" cols="20" rows="5" data-project="' + code + '" data-image="' + image.image.serving_url + '" data-project-type="prdp" data-project-id="' + project.id + '" class="comment-this-image block" placeholder="Type and press enter..."></textarea> \
    <div class="comments-list">' + comments + '</div> \
    <span class="close-comments-panel">Close this</span> \
    </div> \
    <img src="' + image['image']['serving_url'] + '" alt=""> \
    <span class="this-road toggle-road" data-toggleroad-id="'+ image.id+'")"></span> \
    <div class="road-details-wrapper" data-image-id="' + image.id + '" data-image-url="' + image.image.serving_url + '" id="road-details-wrapper">\
      <div class="surface-wrapper" data-img-id="'+image.id+'"> \
          <span class="selectSurface-label">Surface: </span> \
          <span class="surface-val" id="surface-val" data-img-id="'+image.id+'">' + surface_val + '</span> \
      </div> \
      <div class="select-surface clearfix none" id="select-surface" data-img-id="'+image.id+'">\
        <span class="block" data-surface="concrete"><input type="checkbox" name="concrete" value="concrete" class="inline-block"/><img src="/images/icn-concrete.jpg" class="inline-block"/> Concrete</span> \
        <span class="block" data-surface="tarmac"><input type="checkbox" name="tarmac" value="tarmac" class="inline-block"/><img src="/images/icn-tarmac.jpg" class="inline-block"/> Asphalt</span> \
        <span class="block" data-surface="gravel"><input type="checkbox" name="gravel" value="gravel" class="inline-block"/><img src="/images/icn-gravel.jpg" class="inline-block"/> Gravel</span> \
        <span class="block" data-surface="dirt"><input type="checkbox" name="dirt" value="dirt" class="inline-block"/><img src="/images/icn-dirt.jpg" class="inline-block"/> Earth</span> \
      </div> \
        <div class="quality-wrapper" data-img-id="'+image.id+'"> \
          <span class="selectQuality-label">Quality: </span> \
          <select id="selectQuality" name="surface" class="select-quality" multiple> \
           <option value="">' + road_quality.title() + '</option> \
          <option value="Good" data-iconurl="/images/icn-good.jpg"> Good</option> \
          <option value="Fair" data-iconurl="/images/icn-fair.jpg"> Fair </option> \
          <option value="Poor" data-iconurl="images/icn-poor.jpg"> Poor </option> \
          <option value="Bad" data-iconurl="/images/icn-bad.jpg">Bad</option> \
          </select> \
        </div> \
        <div class="set-width-menu" id="set-width-menu">\
          <ul>\
            <li> <form action="" class="width-form"> <input type="text" placeholder="Set manually in meters..."><input type="submit" value="OK"></form></li> \
            <li><a href="#" class="">Same As Last</a></li> \
          </ul> \
        </div>\
        <a class="width-btn" href="#">Width: <span>' + road_width + '</span></a> \
    </div> \
    <div class="road-class-big" data-id="' + image.id + '">Concrete, Asphalt, Gravel, Dirt / Good, Fair, Poor, Bad</div> \
    </div>';
    $('#proj-gallery-lightbox-v').prepend(html);
  }

  set_image_viewer_overlays();

  display_viewer(images.length);

  // create array of dates
  var dates = new Array();
  push_to_array_if_unique(dates, moment(images[0].datetime).format('YYYY-MM-DD')); // just get the first image.
  display_dates_in_viewer(dates);

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

function return_surface_value_type(surface_type) {
  surface_val = (surface_type != 'Click to set') ? surface_type : 'Click to set';
  if(surface_type == 'concrete') {
    surface_val = '<span class="inline-block one-surface"><img src="/images/icn-concrete.jpg" class="inline-block"/> Concrete</span>';
  }
  else if(surface_type == 'tarmac') {
    surface_val = '<span class="inline-block one-surface"><img src="/images/icn-tarmac.jpg" class="inline-block"/> Asphalt</span>';
  }
  else if(surface_type == 'gravel') {
    surface_val = '<span class="inline-block one-surface"><img src="/images/icn-gravel.jpg" class="inline-block"/> Gravel</span>';
  }
  else if(surface_type == 'dirt') {
    surface_val = '<span class="inline-block one-surface"><img src="/images/icn-dirt.jpg" class="inline-block"/> Earth</span>';
  }
  return surface_val;
}

function display_multiple_date_images(images_grouped_by_date){
  // takes multiple sets of images and displays them all
  console.log("MULTIPLE", images_grouped_by_date);

  reset_viewer();

  var grouped_images = new Array();
  var last_index = 0;
  var date_count = 0;

  while(last_index < 100){
    var current_batch = new Array();
    for(date in images_grouped_by_date){
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
          push_to_array_if_unique(dates, moment(grouped_images[i][j].datetime).format('YYYY-MM-DD'));
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
        surface_val = return_surface_value_type(road_class);

        var comments = '';

        html += '<div class="individual-image-wrapper"> \
        <div class="date-time-image"><span>Location:</span> <b>' + image.latlong + '</b><br/><span>Time:</span> <b>' + moment(image.datetime).format('MMMM DD, YYYY H:mm A') + '</b></div> \
        <a href="' + image['image'].file_url + '" target="_blank" class="fa fa-download dl-img-btn tooltip" title="Download Image">&nbsp;</a> \
        <a href="javascript:void(0);" class="num-comments-wrapper login-geostore"><label for="">Leave feedback</label></a>\
        <div class="comments-wrapper"> \
        <label for="leave a feedback" class="block">Leave feedback</label> \
        <textarea name="" id="" cols="20" rows="5" data-project="' + code + '" data-image="' + image.image.serving_url + '" data-project-type="prdp" data-project-id="' + project.id + '" class="comment-this-image block" placeholder="Type and press enter..."></textarea> \
        <div class="comments-list">' + comments + '</div> \
        <span class="close-comments-panel">Close this</span> \
        </div> \
        <img src="' + image['image']['serving_url'] + '" alt=""> \
        <span class="this-road toggle-road" data-toggleroad-id="'+ image.id+'")"></span> \
        <div class="road-details-wrapper" data-image-id="' + image.id + '" data-image-url="' + image.image.serving_url + '" id="road-details-wrapper">\
          <div class="surface-wrapper" data-img-id="'+image.id+'"> \
              <span class="selectSurface-label">Surface: </span> \
              <span class="surface-val" id="surface-val" data-img-id="'+image.id+'">' + surface_val + '</span> \
          </div> \
          <div class="select-surface clearfix none" id="select-surface" data-img-id="'+image.id+'">\
            <span class="block" data-surface="concrete"><input type="checkbox" name="concrete" value="concrete" class="inline-block"/><img src="/images/icn-concrete.jpg" class="inline-block"/> Concrete</span> \
            <span class="block" data-surface="tarmac"><input type="checkbox" name="tarmac" value="tarmac" class="inline-block"/><img src="/images/icn-tarmac.jpg" class="inline-block"/> Asphalt</span> \
            <span class="block" data-surface="gravel"><input type="checkbox" name="gravel" value="gravel" class="inline-block"/><img src="/images/icn-gravel.jpg" class="inline-block"/> Gravel</span> \
            <span class="block" data-surface="dirt"><input type="checkbox" name="dirt" value="dirt" class="inline-block"/><img src="/images/icn-dirt.jpg" class="inline-block"/> Earth</span> \
          </div> \
            <div class="quality-wrapper" data-img-id="'+image.id+'"> \
              <span class="selectQuality-label">Quality: </span> \
              <select id="selectQuality" name="surface" class="select-quality" multiple> \
               <option value="">' + road_quality.title() + '</option> \
              <option value="Good" data-iconurl="/images/icn-good.jpg"> Good</option> \
              <option value="Fair" data-iconurl="/images/icn-fair.jpg"> Fair </option> \
              <option value="Poor" data-iconurl="images/icn-poor.jpg"> Poor </option> \
              <option value="Bad" data-iconurl="/images/icn-bad.jpg">Bad</option> \
              </select> \
            </div> \
            <div class="set-width-menu" id="set-width-menu">\
              <ul>\
                <li> <form action="" class="width-form"> <input type="text" placeholder="Set manually in meters..."><input type="submit" value="OK"></form></li> \
                <li><a href="#" class="">Same As Last</a></li> \
              </ul> \
            </div>\
            <a class="width-btn" href="#">Width: <span>' + road_width + '</span></a> \
        </div> \
        <div class="road-class-big" data-id="' + image.id + '">Concrete, Asphalt, Gravel, Dirt / Good, Fair, Poor, Bad</div> \
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

  set_image_viewer_overlays();

  display_viewer(grouped_images.length);

  display_dates_in_viewer(dates);
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


function display_special_viewer(){
  $("#special_findings_viewer").css("display","block");
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
  if(window.current_images2[index]){
    return window.current_images2[index];
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



function countProperties(obj) {
    var count = 0;

    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            ++count;
    }

    return count;
}


function get_random_value_from_list(arr){
  return arr[Math.floor(Math.random() * arr.length)];
}


window.current_selected_projects = new Array();
function set_current_projects(codes){
  window.current_selected_projects = new Array();
  window.current_selected_projects = codes;
}

function this_is_a_selected_project(code){
  if(window.current_selected_projects.indexOf(code.toLowerCase()) > -1){
    return true;
  }
  else {
    return false;
  }
}


window.last_color_shade_index_prdp = -1;
window.last_color_shade_index_trip = -1;
window.last_color_shade_index_subproject = -1;
window.last_color_shade_index_coa_report = -1;
window.last_color_shade_index_coa_project = -1;
window.last_color_shade_index_gaa = -1;
window.last_color_shade_index_bub = -1;

function reset_road_color_shades(){
  window.last_color_shade_index_prdp = -1;
  window.last_color_shade_index_trip = -1;
  window.last_color_shade_index_subproject = -1;
  window.last_color_shade_index_coa_report = -1;
  window.last_color_shade_index_coa_project = -1;
  window.last_color_shade_index_gaa = -1;
  window.last_color_shade_index_bub = -1;
}

window.prdp_color_shades = [
  '#1281BC',
  '#65CAFF',
  '#18AFFF',
  '#32657F',
  '#148CCC'
];


window.trip_color_shades = [
  '#E4A438',
  '#FFD48B',
  '#FFB73F',
  '#CC9332',
  '#7F6A46'
];


window.gaa_color_shades = [
  '#17A51A',
  '#70FF73',
  '#24FF28',
  '#1CCC20',
  '#387F3A'
];


window.coa_project_color_shades = [
  '#82BCFF',
  '#CEE5FF',
  '#82BCFF',
  '#6896CC',
  '#67737F'
];


window.coa_report_color_shades = [
  '#E4A438',
  '#FFD48B',
  '#FFB73F',
  '#CC9332',
  '#7F6A46'
];


function get_a_color_shade(program){
  var program = program.toLowerCase();
  if(program == 'da'){
    window.last_color_shade_index_prdp += 1;
    if(window.last_color_shade_index_prdp >= 5){
      window.last_color_shade_index_prdp = 0;
    }
    return window.prdp_color_shades[window.last_color_shade_index_prdp];
  }
  else if(program == 'trip'){
    window.last_color_shade_index_trip += 1;
    if(window.last_color_shade_index_trip >= 5){
      window.last_color_shade_index_trip = 0;
    }
    return window.trip_color_shades[window.last_color_shade_index_trip];
  }
  else if(program == 'gaa'){
    window.last_color_shade_index_gaa += 1;
    if(window.last_color_shade_index_gaa >= 5){
      window.last_color_shade_index_gaa = 0;
    }
    return window.gaa_color_shades[window.last_color_shade_index_gaa];
  }
  else if(program == 'coa-cpa'){
    window.last_color_shade_index_coa_project += 1;
    if(window.last_color_shade_index_coa_project >= 5){
      window.last_color_shade_index_coa_project = 0;
    }
    return window.coa_project_color_shades[window.last_color_shade_index_coa_project];
  }
  else if(program == 'coa_report'){
    window.last_color_shade_index_coa_report += 1;
    if(window.last_color_shade_index_coa_report >= 5){
      window.last_color_shade_index_coa_report = 0;
    }
    return window.coa_report_color_shades[window.last_color_shade_index_coa_report];
  }
  else {
    console.log("color schemes not defined", program);
  }
}



function set_image_viewer_overlays(){

  $(".toggle-road").on("click", function(){
    var id = $(this).data("toggleroad-id");
    if($(this).hasClass('this-not-road')) {
      $(this).removeClass('this-not-road');
      $(this).addClass('this-road');
    }else {
      $(this).removeClass('this-road');
      $(this).addClass('this-not-road');
    }
    $(".road-details-wrapper[data-image-id="+id+"]").toggle();

  });

  var surfacehtml = "";
  var scount = 0;
  var surfaceArr  = new Array();

  var selectable_multiple = [
    ".select-surface label",
    ".select-surface input[type='checkbox']"
  ];

  $(document).on("click",selectable_multiple.join(),function(){
      var s = $(this).data("surface");

      console.log(scount + "count");
      console.log('CHECK', this);
      if($(this).hasClass('selected')) {
          // $(this).removeClass('selected');
           // $(this).find("input[type='checkbox']").prop('checked', false);
          surfaceArr.remove(s);
      }else {
        switch(s){
            case "concrete":
              if(surfaceArr.indexOf("concrete") == -1){
                surfaceArr.push("concrete");
                $(this).find("input[type='checkbox']").prop('checked', true);
              }
              else {
                surfaceArr.splice(surfaceArr.indexOf("concrete"), 1);
                $(this).find("input[type='checkbox']").prop('checked', false);
              }
            break;
            case "tarmac":
              if(surfaceArr.indexOf("tarmac") == -1){
                surfaceArr.push("tarmac");
                $(this).find("input[type='checkbox']").prop('checked', true);
              }
              else {
                surfaceArr.splice(surfaceArr.indexOf("tarmac"), 1);
                $(this).find("input[type='checkbox']").prop('checked', false);
              }
            break;
            case "gravel":
              if(surfaceArr.indexOf("gravel") == -1){
                surfaceArr.push("gravel");
                $(this).find("input[type='checkbox']").prop('checked', true);
              }
              else {
                surfaceArr.splice(surfaceArr.indexOf("gravel"), 1);
                $(this).find("input[type='checkbox']").prop('checked', false);
              }
            break;
            case "dirt":
              if(surfaceArr.indexOf("dirt") == -1){
                surfaceArr.push("dirt");
                $(this).find("input[type='checkbox']").prop('checked', true);
              }
              else {
                surfaceArr.splice(surfaceArr.indexOf("dirt"), 1);
                $(this).find("input[type='checkbox']").prop('checked', false);
              }
            break;
        }
        scount = scount + 1;
        var k = $(this).firstElementChild;
        // $(this).find("input[type='checkbox']").prop('checked', true);
        // $(this).addClass('selected');
      }
      console.log(surfaceArr);
  });

  $(".slickimg").on("click", function(){
    var id = $(this).data("img-id");
    // hide set width menu list item

    $(".set-width-menu").hide();
    $(".comments-wrapper").hide();
    $(".num-comments-wrapper").show();
    // hide quality list
    if($(".quality-wrapper[data-img-id="+id+"] .selectboxit-list").css('display') == "block") {
        $(".quality-wrapper[data-img-id="+id+"] .selectboxit-list").hide();
    }

    // display chosen type of surfaces and hide
    if($(".select-surface[data-img-id="+id+"]").hasClass('display')) {
      $(".surface-val[data-img-id="+id+"]").html("");
      if(surfaceArr.length > 1) {
        for(var i = 0; i < surfaceArr.length; i++) {
            var b = surfaceArr[i];

            switch(b) {
              case "concrete":
                  surfacehtml+= '<img src="/images/icn-concrete.jpg" class="inline-block"/> ';
              break;
              case "tarmac":
                  surfacehtml+= '<img src="/images/icn-tarmac.jpg" class="inline-block"/> ';
              break;
              case "gravel":
                surfacehtml+= '<img src="/images/icn-gravel.jpg" class="inline-block"/> ';

              break;
              case "dirt":
                surfacehtml+= '<img src="/images/icn-dirt.jpg" class="inline-block"/>';
              break;
            }
        }
      }else {
        var s = surfaceArr[0];
        console.log(s);
        if(s != undefined) {
          switch(s){
              case "concrete":
                  surfacehtml+= '<span class="inline-block one-surface"><img src="/images/icn-concrete.jpg" class="inline-block"/> Concrete</span> ';
              break;
              case "tarmac":
                surfacehtml+= '<span class="inline-block one-surface"><img src="/images/icn-tarmac.jpg" class="inline-block"/> Asphalt</span> ';

              break;
              case "gravel":
                  surfacehtml+= '<span class="inline-block one-surface"><img src="/images/icn-gravel.jpg" class="inline-block"/> Gravel</span> ';

              break;
              case "dirt":
                  surfacehtml+= '<span class="inline-block one-surface"><img src="/images/icn-dirt.jpg" class="inline-block"/> Earth</span>';

              break;
          }
        }else {
          surfacehtml += 'Click to set';

        }

      }
      console.log(surfacehtml);
      $(".surface-val[data-img-id="+id+"]").html(surfacehtml);
      surfacehtml = "";
      if($(".select-surface[data-img-id="+id+"]").hasClass('display')) {
        $(".select-surface[data-img-id="+id+"]").removeClass('display');
        $(".select-surface[data-img-id="+id+"]").addClass('none');
      }
    } // end if select surface has class of display


  });

  $(".surface-wrapper .surface-val").on("click", function(){
    var id = $(this).data("img-id");
    console.log("id");
   $(".comments-wrapper").hide();
   $(".num-comments-wrapper").show();

   // hide quality list
    if($(".quality-wrapper[data-img-id="+id+"] .selectboxit-list").css('display') == "block") {
          $(".quality-wrapper[data-img-id="+id+"] .selectboxit-list").hide();
      }

    $(".set-width-menu").hide();
    var selectSurface = $(".select-surface[data-img-id="+id+"]");
      if(selectSurface.hasClass('none')) {

        selectSurface.removeClass('none');
        selectSurface.addClass('display');

      }else {

        selectSurface.removeClass('display');
        selectSurface.addClass('none');

        $(this).html("");
        if(surfaceArr.length > 1) {
          for(var i = 0; i < surfaceArr.length; i++) {
              var b = surfaceArr[i];

              switch(b) {
                case "concrete":
                    surfacehtml+= '<img src="/images/icn-concrete.jpg" class="inline-block"/> ';
                break;
                case "tarmac":
                    surfacehtml+= '<img src="/images/icn-tarmac.jpg" class="inline-block"/> ';
                break;
                case "gravel":
                  surfacehtml+= '<img src="/images/icn-gravel.jpg" class="inline-block"/> ';

                break;
                case "dirt":
                  surfacehtml+= '<img src="/images/icn-dirt.jpg" class="inline-block"/>';
                break;
              }
          }
        }else {
          var s = surfaceArr[0];
          if(s != undefined) {
            switch(s){
                case "concrete":
                    surfacehtml+= '<span class="inline-block one-surface"><img src="/images/icn-concrete.jpg" class="inline-block"/> Concrete</span> ';
                break;
                case "tarmac":
                  surfacehtml+= '<span class="inline-block one-surface"><img src="/images/icn-tarmac.jpg" class="inline-block"/> Asphalt</span> ';

                break;
                case "gravel":
                    surfacehtml+= '<span class="inline-block one-surface"><img src="/images/icn-gravel.jpg" class="inline-block"/> Gravel</span> ';

                break;
                case "dirt":
                    surfacehtml+= '<span class="inline-block one-surface"><img src="/images/icn-dirt.jpg" class="inline-block"/> Earth</span>';

                break;
            }
          }else {
            console.log("empty");
            surfacehtml += "Click to set";
          }

        }
        console.log(surfacehtml);
        $(this).html(surfacehtml);
        surfacehtml = "";
        var slick_active = $(this).parents('.slick-active');
        var image_id = $(this).parents('.road-details-wrapper').attr('data-image-id');
        var image_url =  $(this).parents('.road-details-wrapper').attr('data-image-url');
        var image_project = $(slick_active).find('textarea').attr('data-project');
        var image_latlng = $($(this).parents('.individual-image-wrapper').find('.date-time-image').children('b')[0]).text();
        console.log("WAAAAAAAH");
        console.log(update_road('SURFACE', image_id, surfaceArr, image_url, image_project, image_latlng, this));
        surfaceArr = [];
      } // end of else
  });

  $(".width-btn").on("click", function(){
    $('.set-width-menu').toggle();
    $(".comments-wrapper").hide();
    $(".num-comments-wrapper").show();
    if($(".select-surface").hasClass('display')) {
      $(".select-surface").removeClass('display');
      $(".select-surface").addClass('none');
    }
  });

  $(".select-quality").selectBoxIt({
        showFirstOption: false,
        nativeMousedown: true
  });

  $('.select-surface').on('change', function() {
    var image_id = $(this).parents('.road-details-wrapper').attr('data-image-id');
    var image_url = $(this).parents('.road-details-wrapper').attr('data-image-url');
    var image_project = $(this).parents('.slick-active').children('img').attr('src');
    var surface = $(this).val();
    console.log('surface type', image_url);
    console.log('surface type id', image_id);
    console.log('surface type project', image_project);
    console.log(update_road('SURFACE', image_id, surface, image_url));
  });

  $('.select-quality').on('change', function() {
    var image_id = $(this).parents('.road-details-wrapper').attr('data-image-id');
    var image_url = $(this).parents('.road-details-wrapper').attr('data-image-url');
    var quality = $(this).val();
    var image_project = $(this).parents('.slick-active').find('textarea').attr('data-project');
    var image_latlng = $($(this).parents('.slick-active').find('.date-time-image').children('b')[0]).text();
    if($(this).parents('.individual-image-wrapper').length) {
      image_url = $(this).parents('.individual-image-wrapper').children('img').attr('src');
    }
    console.log(this);
    console.log(update_road('QUALITY', image_id, quality, image_url, image_project, image_latlng, this));
  });


  $(".dragTricycle").draggable();

  $('.road-class').on('click', function() {
    if(!$(this).hasClass('login-geostore')) {
      $(this).toggle(function() {
        var iid = $(this).siblings('.road-class-big');
        iid.html(road_class_form2(iid.attr('data-id')));
        iid.toggle();
      });
    }
  });

  $('.road-class-big').on('click', '.road-class-close', function() {
      $(this).parent().toggle(function() {
      $(this).siblings('.road-class').toggle();
    });
  });

  $('.road-class-big').on('click', '.road-class-submit', function() {
    var road_class = $(this).parent().find('input[name="road-class"]:checked').val();
    var road_quality = $(this).parent().find('input[name="road-quality"]:checked').val();
    var iid = $(this).parent().attr('data-id');
    submit_road_class2(iid, road_class, road_quality, this);
    $(this).siblings('.road-class-close').trigger('click');
  });

  $('.comment-this-image').on('keydown', function(e) {
    var key = e.which;
    if(key == 13) {
      e.preventDefault();
      $(this).attr('disabled', '');
      var comment = $(this).val(),
      image = $(this).data('image'),
      project_code = $(this).data('project');
      name = $(this).data('project-name');
      id = $(this).data('project-id');
      post_image_comment(project_code, image, comment, name, id, this);
    }
  });
}


function display_dates_in_viewer(dates){

  // console.log("DATES", dates);
  setTimeout(function(){
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
    $('.chosen-date').val(dates);
    $('.chosen-date').trigger('chosen:updated');
  }, 10);
}


function push_to_array_if_unique(arr, element){
  if(arr.indexOf(element) == -1){
    arr.push(element);
  }
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


window.current_date_for_images = null;


function display_timeline(){
  // just use the number of geotagged locations
  var total = window.current_images2.length;
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
    var current_date = get_date_to_use_for_timeline(get_object_keys(window.current_images2[i]))
    var scale_result = "";

    var new_step = step - 1;

    if(i > new_step) {
      var tmp_src = window.current_images2[i][current_date][0].latlong;
      var tmp = tmp_src.split(',');

      var tmp2_src = window.current_images2[i - step][get_date_to_use_for_timeline(get_object_keys(window.current_images2[i - step]))][0].latlong
      var tmp2 = tmp2_src.split(',');

      var scale = new google.maps.LatLng(tmp[1], tmp[0]);
      var scale2 = new google.maps.LatLng(tmp2[1], tmp2[0]);

      var scale_result = getDistance2(scale, scale2);

      cummulative_distance += scale_result;

      scale_result = scale_result.toFixed(2) + ' meters';
    }
    else {
      scale_result = 'Start';
    }

    // console.log(window.current_images2[i][current_date][0].road_class[0]);
    if(window.current_images2[i][current_date][0].road_class) {
      var rtype = window.current_images2[i][current_date][0].road_class.toLowerCase(),
          rquality = window.current_images2[i][current_date][0].road_quality.toLowerCase(),
          road_class = window.current_images2[i][current_date][0].road_class[0];
      if(window.current_images2[i][current_date][0].surface) {
        rtype = window.current_images2[i][current_date][0].surface.toLowerCase();
      }
      if(window.current_images2[i][current_date][0].quality) {
        rquality = window.current_images2[i][current_date][0].quality.toLowerCase();
      }
      if(i <= window.current_image_index){
          $('ul.photo-timeline').append('<li class="progress-timeline-marker" title="' + scale_result + '" data-info="" data-marker-index="' + i + '"><div class="progress-timeline-line active"></div><i class="img-available"></i><span class="active"></span><div class="road-class-info ' + rquality + ' ' + rtype + '">' + road_class + '</div></li>');
          set_distance_from_start(cummulative_distance);
      }
      else {
          $('ul.photo-timeline').append('<li class="progress-timeline-marker" title="' + scale_result + '" data-info="" data-marker-index="' + i + '"><div class="progress-timeline-line"></div><i class="img-available"></i><span></span><div class="road-class-info ' + rquality + ' ' + rtype + '">' + road_class + '</div></li>');
      }
    }
    else {
      if(window.current_images2[i][current_date][0].surface) {
        var rtype = window.current_images2[i][current_date][0].surface.toLowerCase(),
            rquality = '';
        if(window.current_images2[i][current_date][0].quality) {
          rquality = window.current_images2[i][current_date][0].quality.toLowerCase();
        }
        $('ul.photo-timeline').append('<li class="progress-timeline-marker" title="' + scale_result + '" data-info="" data-marker-index="' + i + '"><div class="progress-timeline-line"></div><i class="img-available"></i><span></span><div class="road-class-info ' + rquality + ' ' + rtype + '">X</div></li>');
      }
      else {
        if(i <= window.current_image_index){
          $('ul.photo-timeline').append('<li class="progress-timeline-marker" title="' + scale_result + '" data-info="" data-marker-index="' + i + '"><div class="progress-timeline-line active"></div><i class="img-available"></i><span class="active"></span><div class="road-class-info">X</div></li>');
          set_distance_from_start(cummulative_distance);
        }
        else {
          $('ul.photo-timeline').append('<li class="progress-timeline-marker" title="' + scale_result + '" data-info="" data-marker-index="' + i + '"><div class="progress-timeline-line"></div><i class="img-available"></i><span></span><div class="road-class-info">X</div></li>');
        }
      }
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
  set_distance_until_the_end_of_the_road(cummulative_distance);
}


function get_date_to_use_for_timeline(dates){
  return dates[0];
}


Array.max = function( array ){
    return Math.max.apply( Math, array );
};


function highlight_timeline_markers(){
  window.current_image_index

}


function put_all_project_images_in_array(array_of_projects){
  window.current_images_array2 = new Array();
  for(var i=0; i<array_of_projects.length; i++){
    if('images' in array_of_projects[i]){
      for(var j=0; j<array_of_projects[i]['images'].length; j++){
        window.current_images_array2.push(array_of_projects[i]['images'][j]);
      }
    }
  }
  window.current_images_array2.sort(function(a, b) {
    return moment(a.datetime) - moment(b.datetime);
  });
}


function put_all_project_resources_in_array(array_of_projects){
    window.current_resource_images2 = [];

    for(var i=0; i<array_of_projects.length; i++){
        if('resources' in array_of_projects[i]){
          for(var j=0; j<array_of_projects[i]['resources'].length; j++){
            if(array_of_projects[i]['resources'][j].original_file_url.endsWith('.jpg') || array_of_projects[i]['resources'][j].original_file_url.endsWith('.jpeg')) {
                window.current_resource_images2.push(array_of_projects[i]['resources'][j]);
            }
          }
        }
    }
    window.current_resource_images2.sort(function(a, b) {
    return moment(a.datetime) - moment(b.datetime);
    });
}


function group_photos_in_current_images_array(){
  window.current_images2 = {};
  var dates = [];

  for(var i = 0; i < window.current_images_array2.length; i++) {
    var datetime = moment(window.current_images_array2[i].datetime).format('YYYY-MM-DD');

    if(dates.indexOf(datetime) == -1) {
      dates.push(datetime);
    }

    if(_.isEmpty(window.current_images2)) {
      var temp = new Object();
      temp[datetime] = [];
      temp[datetime].push(window.current_images_array2[i]);
      window.current_images2 = [temp];
      continue;
    }

    var assigned = false;

    for(var j = 0; j < window.current_images2.length; j++) {
      for(date in window.current_images2[j]){
        // console.log('ASDF', window.current_images2[j][date][0].latlong, window.current_images_array2[i].latlong);
        if(is_near(window.current_images2[j][date][0].latlong, window.current_images_array2[i].latlong)){
          if(!(datetime in window.current_images2[j])) {
            window.current_images2[j][datetime] = [window.current_images_array2[i]];
            assigned = true;
            break;
          }

          window.current_images2[j][datetime].push(window.current_images_array2[i]);
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
      temp[datetime].push(window.current_images_array2[i]);
      window.current_images2.push(temp);
    }
  }
}


function set_distance_from_start(distance){
  var distance_in_km = distance / 1000;
  $('#distance_from_starting_point').html(distance_in_km.toFixed(2) + ' KM');
}


function set_distance_until_the_end_of_the_road(distance){
  var distance_in_km = distance / 1000;
  $('#distance_until_the_end_of_the_road').html(distance_in_km.toFixed(2) + ' KM');
}



function hide_viewers(){
    console.log("HIDE ALL VIEWERS");
    $(".proj-gallery-lightbox-wrapper").hide();
    window.images_are_displayed2 = false;
    window.special_images_are_displayed2 = false;
}


