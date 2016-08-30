/*******
CALLING EASYTAB FUNCTION
*******/

// $("#search-queries").easytabs({
// 	cache: false,
// 	updateHash: false
// });
// $("#proj-details").easytabs({
// 	cache: false,
// 	updateHash: false
// });

// $(".detail-container").easytabs({
// 	cache: false,
// 	updateHash: false,
//     tabActiveClass: "active"
// });


/*var tabContainers = $(".detail-container > .details-tab");
$('.detail-container .details-links-tab li').click(function () {
   var hash = $(this).children().attr('href');
    tabContainers.hide().filter(hash).show();

    $(".detail-container .details-links-tab li").removeClass('active');
   $(this).addClass('active');

    return false;
}).filter(':first').click();*/


/** open the project details */
$("#view-details").click(function(){
    $("#proj-details").show();
});

$('.ok-dismiss-btn').on('click', function() {
  // $('#proj-details, .view-details').show();
  $('.start-view')./*css('display', 'none').*/addClass('animated fadeOutUp');
  setTimeout(function() {
    $('.start-view-container').css('display', 'none');
  }, 500);
});

$('.programs-checkbox-label').on('click', function() {
  var chk = $(this).attr('for');
  if(chk == 'chk1') {
    $('#program_select_da').trigger('click');
  }
  else if(chk == 'chk2') {
    $('#program_select_bub').trigger('click');
  }
  else if(chk == 'chk3') {
    $('#program_select_trip').trigger('click');
  }
  else if(chk == 'chk4') {
    $('#program_select_gaa').trigger('click');
  }
  else if(chk == 'chk5') {
    $('#program_select_cpa').trigger('click');
  }
  /*if(!$('#' + chk).is(':checked')) {
    if(chk == 'chk1') {
      $('#program_select_da').prop('checked', true);
    }
    else if(chk == 'chk2') {
      $('#program_select_bub').prop('checked', true);
    }
    else if(chk == 'chk3') {
      $('#program_select_trip').prop('checked', true);
    }
    else if(chk == 'chk4') {
      $('#program_select_gaa').prop('checked', true);
    }
    else if(chk == 'chk5') {
      $('#program_select_cpa').prop('checked', true);
    }
  }
  else {
    if(chk == 'chk1') {
      $('#program_select_da').prop('checked', false);
    }
    else if(chk == 'chk2') {
      $('#program_select_bub').prop('checked', false);
    }
    else if(chk == 'chk3') {
      $('#program_select_trip').prop('checked', false);
    }
    else if(chk == 'chk4') {
      $('#program_select_gaa').prop('checked', false);
    }
    else if(chk == 'chk5') {
      $('#program_select_cpa').prop('checked', false);
    }
  }*/
});
/** closing the project detail*/
$(".proj-details #btn-close").click(function(){
    $(".proj-details").hide();
    $("#view-details").show();
});


/** open the comment panel from the gallery slider */
$(document).on("click",".proj-gallery-lightbox-v .slick-active .num-comments-wrapper",function(e){
  if(window.user.token) {
    $("#proj-gallery-lightbox-v").slick('slickSetOption', 'draggable', false, false);
    $(this).parent().find(".comments-wrapper").show();
    $(this).hide();
  }
});

/** closing the comment panel from the gallery slider */
$(document).on("click",".proj-gallery-lightbox-v .slick-active .close-comments-panel",function(){
  $(this).parent().hide();
  $(".proj-gallery-lightbox-v .slick-active .num-comments-wrapper").show();
  $("#proj-gallery-lightbox-v").slick('slickSetOption', 'draggable', true, false);
  //console.log(div + "this parent");
  //find(".num-comments-wrapper").show();
});
// close the photo gallery lightbox

/** disable scrolling for comments and timeline tab **/
$("body").on("click",".proj-comments-link, .proj-timeline-link",function(){

    // $(".proj-tab-content").css("overflow","hidden");
});
$("body").on("click",".proj-details-link",function(){
    $(".proj-tab-content").css("overflow","");
});

$(document).ready(function(){
    // slick initialization for the detail photo thumbnails
    /*$("#proj-gallery").slick({
          infinite: false,
          slidesToShow: 3,
          slidesToScroll: 3,
          draggable: false
    });*/
    //slick initialization for lightbox project gallery
    /*$("#proj-gallery-lightbox-v").slick({
          slidesToShow: 3,
          slidesToScroll: 1,
          centerMode: true,
          focusOnSelect: true,
          adaptiveHeight: true,
          prevArrow: "<button class='left-gallery-nav'><i class='fa fa-chevron-left'></i></button",
          nextArrow: "<button class='right-gallery-nav'><i class='fa fa-chevron-right'></i></button",
          variableWidth: true,
          accessibility: true,
    });*/

});
/** opens proj gallery lightbox v **/
$("#proj-gallery").on("click",".slick-slide",function(){
        var indexes = $('#proj-gallery').attr('data-viewer-index').split('<>');
        marker_click_trigger_final(indexes[0], indexes[1], indexes[2]);
        /*$(".proj-gallery-lightbox-wrapper").css("display","block");
        $("#proj-gallery-lightbox-v").slick('slickGoTo', index);*/
});

$("ul.googlemap-type li").on('click',function(){
    var type = $(this).attr("id");
    switch(type){
        case 'satellite':
            thisMap.setMapTypeId(google.maps.MapTypeId.SATELLITE);
            break;
        case 'terrain':
            thisMap.setMapTypeId(google.maps.MapTypeId.TERRAIN);
            break;
        case 'hybrid':
            thisMap.setMapTypeId(google.maps.MapTypeId.HYBRID);
            break;
        case 'roadmap':
            thisMap.setMapTypeId(google.maps.MapTypeId.ROADMAP);
            break;
        case 'osm':
            thisMap.setMapTypeId("OSM");
            break;
    }
});

// $(".photo-timeline li").click(function(){
//   var index = $(this).index();
//   alert(index + " index");
//   var totalLi = $(".photo-timeline li:last-child").index();
//   // alert(totalLi + "total li");
//  var width =  100 ;
//  var n = (totalLi / index) - 5;
//  // alert(n + "n orig");
//  if(n < 1) {
//   n = 2;
//  }
//  // alert(n + "n");
//  var percentage = (index * 3) + n;

//   // alert(percentage + "percentage");
//   // alert(percentage);
//   if(index !== totalLi) {
//     $(".photo-timeline .percentage").animate({
//       width: percentage + "%"
//     }, 500);
//   }else {

//     $(".photo-timeline .percentage").animate({
//       width: "100%"
//     }, 500);
//   }

// });
$('.legend-toggle').on('click', function() {
  $(this).toggleClass('active');
  $('.legend').toggle();
  if($(this).hasClass('active')) {
    $(this).text('Hide Legend');
  }
  else {
    $(this).text('Show Legend');
  }
});
$('.layers-toggle').on('click', function() {
  $(this).toggleClass('active');
  $('.choose-map-type').toggle();
});

$('.elevation-toggle').on('click', function() {
  $(this).toggleClass('active');
  $('#elevation_profile').toggle();
});


/*$('.chosen-location').on('change', function() {
  $('.proj-list .proj-item').removeClass('hidden');
  var locations = $(this).val();
  if(locations) {
    $('.proj-list .proj-item').each(function() {
      var location = $(this).find('.proj-location').text();
      if(locations.indexOf(location) == -1) {
        $(this).addClass('hidden');
      }
      else {
        $(this).removeClass('hidden');
      }
    });
  }
});*/
/*$('.chosen-scope').on('change', function() {
  var scopes = $(this).val();
  if(scopes) {
    $('.proj-list .proj-item:visible').each(function() {
      var scope = $(this).find('h4').text().toLowerCase()
      if(scopes.indexOf('construction') != -1) {
        if(scope.indexOf('const') == -1 || scope.indexOf('concreting') == -1) {
          $(this).addClass('hidden');
        }
      }
      else if(scopes.indexOf('improvement') != -1) {
        if(scope.indexOf('improvement') == -1) {
          $(this).addClass('hidden');
        }
      }
      else if(scopes.indexOf('rehabilitation') != -1) {
        if(scope.indexOf('rehab') == -1) {
          $(this).addClass('hidden');
        }
      }
      else if(scopes.indexOf('upgrading') != -1) {
        if(scope.indexOf('upgrading') == -1) {
          $(this).addClass('hidden');
        }
      }
      else if(scopes.indexOf('widening') != -1) {
        if(scope.indexOf('widening') == -1) {
          $(this).addClass('hidden');
        }
      }
    });
  }
  else {
    $('.proj-list .proj-item').removeClass('hidden');
  }
});*/
// $('.year-filter').on('change', function() {
//   var year = $(this).val();
//   if(year != 'all') {
//     $('.proj-list .proj-item').each(function() {
//       if($(this).find('.proj-desc').text().indexOf(year) == -1) {
//         $(this).addClass('hidden');
//       }
//       else {
//         $(this).removeClass('hidden');
//       }
//     });
//   }
//   else {
//     $('.proj-list .proj-item').removeClass('hidden');
//   }
// });
$('.title-barss .title-bar').on('click', function() {
  if($('.title-barss').is(':visible')) {
    $('.title-barss').hide();
  }
});