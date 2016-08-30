var currentRequest = undefined;

$(document).ready(function (){
	loadPendingAgencyAdmin();
});

$(function(){
	$("#pending-admin-tab").on("shown.bs.tab", function (){
		currentRequest.abort();
		loadPendingAgencyAdmin();
	});
	$("#pending-admin-wo-oo-tab").on("shown.bs.tab", function (){
		currentRequest.abort();
		loadPendingAgencyAdminWithoutOfficeOrder();
	});
	$("#approved-admin-tab").on("shown.bs.tab", function (){
		currentRequest.abort();
		loadApprovedAgencyAdmin();
	});
	$("#disapproved-admin-tab").on("shown.bs.tab", function (){
		currentRequest.abort();
		loadDisapprovedAgencyAdmin();
	});
});

function loadPendingAgencyAdminWithoutOfficeOrder(){
	$("#pending-admin-wo-oo").html(
		$("<h3>", { class: "text-center" }).html(
			$("<i>", { class: "fa fa-2x fa-spin fa-circle-o-notch" })).add(
		$("<h4>", { class: "text-center", text: "Loading Users" })));
	currentRequest = $.ajax({
		url: "/users/registration?ajax=1&status=verified",
		success: function (data){
			if(data){
				try{
					if(data.users.length == 0){
						$("#pending-admin-wo-oo").html(
							$("<h3>", { class: "text-center" }).html(
								$("<i>", { class: "fa fa-2x fa-times" })).add(
							$("<h4>", { class: "text-center", text: "No pending users." })));
					}
					else{
						$("#pending-admin-wo-oo").html($("<div>", { class: "feedbacks-list col-lg-12", id: "pending-admin-wo-oo-feedbacks-list" }));
						for(i=0;i<data.users.length;i++){
							renderUserToTable(data.users[i], "#pending-admin-wo-oo-feedbacks-list");
						}
						if(data.more){
							$("#pending-admin-wo-oo-feedbacks-list").append($("<div>", { class: "row" }).html(
								$("<div>", { class: "text-center col-lg-12" }).html(
									$("<button>", { class: "btn btn-sm btn-default", type: "button", text: " Load More", onclick: "loadMorePendingAgencyAdmin(this, '"+ data.url +"');"}))));
						}
						$("#pending-admin-wo-oo-feedbacks-list").children("hr:last-child").remove();
					}
				}
				catch (err){
					console.log(err);
				}
			}
		},
		error: function (){
			$("#pending-admin-wo-oo").html(
				$("<h3>", { class: "text-center" }).html(
					$("<i>", { class: "fa fa-2x fa-warning" })).add(
				$("<h4>", { class: "text-center", text: "Could not load users." })));
		}
	});
}

function loadPendingAgencyAdmin(){
	$("#pending-admin").html(
		$("<h3>", { class: "text-center" }).html(
			$("<i>", { class: "fa fa-2x fa-spin fa-circle-o-notch" })).add(
		$("<h4>", { class: "text-center", text: "Loading Users" })));
	currentRequest = $.ajax({
		url: "/users/registration?ajax=1&status=verified&office_order=1",
		success: function (data){
			if(data){
				try{
					if(data.users.length == 0){
						$("#pending-admin").html(
							$("<h3>", { class: "text-center" }).html(
								$("<i>", { class: "fa fa-2x fa-times" })).add(
							$("<h4>", { class: "text-center", text: "No pending users." })));
					}
					else{
						$("#pending-admin").html($("<div>", { class: "feedbacks-list col-lg-12", id: "pending-admin-feedbacks-list" }));
						for(i=0;i<data.users.length;i++){
							renderUserToTable(data.users[i], "#pending-admin-feedbacks-list");
						}
						if(data.more){
							$("#pending-admin-feedbacks-list").append($("<div>", { class: "row" }).html(
								$("<div>", { class: "text-center col-lg-12" }).html(
									$("<button>", { class: "btn btn-sm btn-default", type: "button", text: " Load More", onclick: "loadMorePendingAgencyAdmin(this, '"+ data.url +"');"}))));
						}
						$("#pending-admin-feedbacks-list").children("hr:last-child").remove();
					}
				}
				catch (err){
					console.log(err);
				}
			}
		},
		error: function (){
			$("#pending-admin").html(
				$("<h3>", { class: "text-center" }).html(
					$("<i>", { class: "fa fa-2x fa-warning" })).add(
				$("<h4>", { class: "text-center", text: "Could not load users." })));
		}
	});
}

function loadMorePendingAgencyAdmin(obj, url){
	$(obj).prop("disabled", true).prepend($("<i>", { class: "fa fa-fw fa-spin fa-circle-o-notch" }));
	currentRequest = $.ajax({
		url: url,
		success: function (data){
			if(data){
				$(obj).parent("div").parent("div.row").remove();
				try{
					if(data.users.length == 0){
						console.log("No result.");
						console.log(data.users)
					}
					else{
						for(i=0;i<data.users.length;i++){
							renderUserToTable(data.users[i], "#pending-admin-feedbacks-list");
						}
						if(data.more){
							$("#pending-admin-feedbacks-list").append($("<div>", { class: "row" }).html(
								$("<div>", { class: "text-center col-lg-12" }).html(
									$("<button>", { class: "btn btn-sm btn-default", type: "button", text: " Load More", onclick: "loadMorePendingAgencyAdmin(this, '"+ data.url +"');"}))));
						}
						$("#pending-admin-feedbacks-list").children("hr:last-child").remove();
					}
				}
				catch (err){
					console.log(err);
				}
			}
		},
		error: function (){
			$("#pending-admin").html(
				$("<h3>", { class: "text-center" }).html(
					$("<i>", { class: "fa fa-2x fa-warning" })).add(
				$("<h4>", { class: "text-center", text: "Could not load users." })));
		}
	});
}

function loadApprovedAgencyAdmin(){
	$("#approved-admin").html(
		$("<h3>", { class: "text-center" }).html(
			$("<i>", { class: "fa fa-2x fa-spin fa-circle-o-notch" })).add(
		$("<h4>", { class: "text-center", text: "Loading Users" })));
	currentRequest = $.ajax({
		url: "/users/registration?ajax=1&status=approved",
		success: function (data){
			if(data){
				try{
					if(data.users.length == 0){
						$("#approved-admin").html(
							$("<h3>", { class: "text-center" }).html(
								$("<i>", { class: "fa fa-2x fa-times" })).add(
							$("<h4>", { class: "text-center", text: "No approved users." })));
					}
					else{
						$("#approved-admin").html($("<div>", { class: "feedbacks-list col-lg-12", id: "approved-admins-list" }))
						for(i=0;i<data.users.length;i++){
							renderUserToTable(data.users[i], "#approved-admins-list");
						}
						if(data.more){
							$("#approved-admins-list").append($("<div>", { class: "row" }).html(
								$("<div>", { class: "text-center col-lg-12" }).html(
									$("<button>", { class: "btn btn-sm btn-default", type: "button", text: " Load More", onclick: "loadMoreApprovedAgencyAdmin(this, '"+ data.url +"');"}))));
						}
						$("#approved-admins-list").children("hr:last-child").remove();
					}
				}
				catch (err){
					console.log(err)
				}
			}
		},
		error: function (){
			$("#approved-admin").html(
				$("<h3>", { class: "text-center" }).html(
					$("<i>", { class: "fa fa-2x fa-warning" })).add(
				$("<h4>", { class: "text-center", text: "Could not load users." })));
		}
	});
}

function loadMoreApprovedAgencyAdmin(obj, url){
	$(obj).prop("disabled", true).prepend($("<i>", { class: "fa fa-fw fa-spin fa-circle-o-notch" }));
	currentRequest = $.ajax({
		url: url,
		success: function (data){
			if(data){
				$(obj).closest("div.row").remove();
				try{
					if(data.users.length == 0){
						console.log("No result.");
						console.log(data.users)
					}
					else{
						for(i=0;i<data.users.length;i++){
							renderUserToTable(data.users[i], "#approved-admins-list");
						}
						if(data.more){
							$("#approved-admins-list").append($("<div>", { class: "row" }).html(
								$("<div>", { class: "text-center col-lg-12" }).html(
									$("<button>", { class: "btn btn-sm btn-default", type: "button", text: " Load More", onclick: "loadMoreApprovedAgencyAdmin(this, '"+ data.url +"');"}))));
						}
						$("#approved-admins-list").children("hr:last-child").remove();
					}
				}
				catch (err){
					console.log(err);
				}
			}
		},
		error: function (){
			$("#pending-admin").html(
				$("<h3>", { class: "text-center" }).html(
					$("<i>", { class: "fa fa-2x fa-warning" })).add(
				$("<h4>", { class: "text-center", text: "Could not load users." })));
		}
	});
}

function loadDisapprovedAgencyAdmin(){
	$("#disapproved-admin").html(
		$("<h3>", { class: "text-center" }).html(
			$("<i>", { class: "fa fa-2x fa-spin fa-circle-o-notch" })).add(
		$("<h4>", { class: "text-center", text: "Loading Users" })));
	currentRequest = $.ajax({
		url: "/users/registration?ajax=1&status=disapproved",
		success: function (data){
			if(data){
				try{
					if(data.users.length == 0){
						$("#disapproved-admin").html(
							$("<h3>", { class: "text-center" }).html(
								$("<i>", { class: "fa fa-2x fa-times" })).add(
							$("<h4>", { class: "text-center", text: "No disapproved users." })));
					}
					else{
						$("#disapproved-admin").html($("<div>", { class: "feedbacks-list col-lg-12", id: "disapproved-admins-list" }))
						for(i=0;i<data.users.length;i++){
							renderUserToTable(data.users[i], "#disapproved-admins-list");
						}
						if(data.more){
							$("#disapproved-admins-list").append($("<div>", { class: "row" }).html(
								$("<div>", { class: "text-center col-lg-12" }).html(
									$("<button>", { class: "btn btn-sm btn-default", type: "button", text: " Load More", onclick: "loadMoreApprovedAgencyAdmin(this, '"+ data.url +"');"}))));
						}
						$("#disapproved-admins-list").children("hr:last-child").remove();
					}
				}
				catch (err){

				}
			}
		},
		error: function (){
			$("#disapproved-admin").html(
				$("<h3>", { class: "text-center" }).html(
					$("<i>", { class: "fa fa-2x fa-warning" })).add(
				$("<h4>", { class: "text-center", text: "Could not load users." })));
		}
	});
}

function loadMoreDisapprovedAgencyAdmin(obj, url){
	$(obj).prop("disabled", true).prepend($("<i>", { class: "fa fa-fw fa-spin fa-circle-o-notch" }));
	currentRequest = $.ajax({
		url: url,
		success: function (data){
			if(data){
				$(obj).closest("div.row").remove();
				try{
					if(data.users.length == 0){
						console.log("No result.");
						console.log(data.users)
					}
					else{
						for(i=0;i<data.users.length;i++){
							renderUserToTable(data.users[i], "#disapproved-admins-list");
						}
						if(data.more){
							$("#disapproved-admins-list").append($("<div>", { class: "row" }).html(
								$("<div>", { class: "text-center col-lg-12" }).html(
									$("<button>", { class: "btn btn-sm btn-default", type: "button", text: " Load More", onclick: "loadMoreDisapprovedAgencyAdmin(this, '"+ data.url +"');"}))));
						}
						$("#disapproved-admins-list").children("hr:last-child").remove();
					}
				}
				catch (err){
					console.log(err);
				}
			}
		},
		error: function (){
			$("#pending-admin").html(
				$("<h3>", { class: "text-center" }).html(
					$("<i>", { class: "fa fa-2x fa-warning" })).add(
				$("<h4>", { class: "text-center", text: "Could not load users." })));
		}
	});
}

function approveAgencyAdmin(obj, f_id){
	$(obj).prop("disabled", true).children("i").addClass("fa-spin fa-circle-o-notch").removeClass("fa-check");
	$(obj).next("button").prop("disabled", true);
	$.ajax({
		type: "POST",
		url: "/users/registration",
		data: {agency_admin_id: f_id, action: "approve"},
		success: function(data){
			$(obj).prop("disabled", false).children("i").removeClass("fa-spin fa-circle-o-notch").addClass("fa-check");
			$(obj).next("button").prop("disabled", false);
			if($(obj).closest("div.row").parent("div").children("div.row").length == 1){
				$(obj).closest("div.row").slideUp("slow", function (){
					var container = "#pending-admin", label = "pending";
					if($("#disapproved-admin").is(":visible")){
						container = "#disapproved-admin";
						label = "disapproved"
					}
					$(container).html(
					$("<h3>", { class: "text-center" }).html(
						$("<i>", { class: "fa fa-2x fa-times" })).add(
					$("<h4>", { class: "text-center", text: "No "+label+" users." })));
				});
			}
			else{
				$(obj).closest("div.row").slideUp("slow", function (){
					$(obj).closest("div.row").next("hr").remove();
					$(obj).closest("div.row").remove();
				});
			}
		},
		error: function (){
			$(obj).prop("disabled", false).children("i").removeClass("fa-spin fa-circle-o-notch").addClass("fa-check");
			$(obj).next("button").prop("disabled", false);
		}
	});
}

function disapproveAgencyAdmin(obj, f_id){
	$(obj).prop("disabled", true).children("i").removeClass("fa-check").addClass("fa-spin fa-circle-o-notch");
	$(obj).prev("button").prop("disabled", true);
	$.ajax({
		type: "POST",
		url: "/users/registration",
		data: {agency_admin_id: f_id, action: "disapprove"},
		success: function(data){
			$(obj).prop("disabled", false).children("i").removeClass("fa-spin fa-circle-o-notch").addClass("fa-check");
			$(obj).prev("button").prop("disabled", false);
			if($(obj).closest("div.row").parent("div").children("div.row").length == 1){
				$(obj).closest("div.row").slideUp("slow", function (){
					var container = "#pending-admin", label = "pending";
					if($("#approved-admin").is(":visible")){
						container = "#approved-admin";
						label = "approved";
					}
					$(container).html(
						$("<h3>", { class: "text-center" }).html(
							$("<i>", { class: "fa fa-2x fa-times" })).add(
						$("<h4>", { class: "text-center", text: "No "+label+" users." })));
				});
			}
			else{
				$(obj).closest("div.row").next("hr").remove();
				$(obj).closest("div.row").remove();
			}
		},
		error: function (){
			$(obj).prev("button").prop("disabled", false);
			$(obj).prop("disabled", false).children("i").removeClass("fa-spin fa-circle-o-notch").addClass("fa-check");
		}
	});
}

function renderUserToTable(data, container){
	var actionButtons = $("<button>", { class: "btn btn-sm btn-success", onclick: "approveAgencyAdmin(this, '"+data.id+"');", text: " Approve" }).prepend($("<i>", { class: "fa fa-fw fa-check" })).add(
		$("<button>", { class: "btn btn-sm btn-danger", onclick: "disapproveAgencyAdmin(this, '"+data.id+"');", text: " Disapprove"}).prepend($("<i>", { class: "fa fa-fw fa-times" }))),
	actionTaken = $("<div>", { class: "row" }).html(
		$("<div>", { class: "col-lg-12" }).html(
			$("<p>", { text: " " + data.street_address }).prepend($("<strong>", { text: "Address: "})))).add(
	$("<div>", { class: "row" }).html(
		$("<div>", { class: "col-lg-12" }).html(
			$("<p>", { text: " " + data.province }).prepend($("<strong>", { text: "Province: "}))))).add(
	$("<div>", { class: "row" }).html(
		$("<div>", { class: "col-lg-12" }).html(
			$("<p>", { text: " " + data.city }).prepend($("<strong>", { text: "City: "}))))).add(
	$("<div>", { class: "row" }).html(
		$("<div>", { class: "col-lg-12" }).html(
			$("<p>", { text: " " + data.office_order_number }).prepend($("<strong>", { text: "Office Order Number: "})))));
	if(container == "#approved-admins-list"){
		actionButtons = $("<button>", { class: "btn btn-sm btn-danger", onclick: "disapproveAgencyAdmin(this, '"+data.id+"');", text: " Disapprove"}).prepend($("<i>", { class: "fa fa-fw fa-times" }));
		actionTaken = actionTaken.add(
			$("<div>", { class: "row" }).html(
				$("<div>", { class: "col-lg-12" }).html(
					$("<p>", { text: " " + data.approved_by }).prepend($("<strong>", { text: "Approved By: "}))))).add(
			$("<div>", { class: "row" }).html(
				$("<div>", { class: "col-lg-12" }).html(
					$("<p>", { text: " " + data.approved_on }).prepend($("<strong>", { text: "Approved On: "})))));
	}
	else if(container == "#disapproved-admins-list"){
		actionButtons = $("<button>", { class: "btn btn-sm btn-success", onclick: "approveAgencyAdmin(this, '"+data.id+"');", text: " Approve" }).prepend($("<i>", { class: "fa fa-fw fa-check" }));
		actionTaken = actionTaken.add(
			$("<div>", { class: "row" }).html(
				$("<div>", { class: "col-lg-12" }).html(
					$("<p>", { text: " " + data.disapproved_by }).prepend($("<strong>", { text: "Disapproved By: "}))))).add(
			$("<div>", { class: "row" }).html(
				$("<div>", { class: "col-lg-12" }).html(
					$("<p>", { text: " " + data.disapproved_on }).prepend($("<strong>", { text: "Disapproved On: "})))));
	}
	$(container).append(
		$("<div>", { class: "row" }).html(
			$("<div>", { class: "feedbacks-item feedbacks-item col-lg-12" }).html(
				$("<div>", { class: "feedbacks-item-keys text-center col-lg-2" }).html(
					$("<img>", { src: "https://www.gravatar.com/avatar/"+ data.email_md5 +"?s=100"}))
				.add($("<div>", { class: "feedbacks-item-keys col-lg-3" }).html(
					$("<div>", { class: "row" }).html(
						$("<div>", { class: "col-lg-12" }).html(
							$("<p>", { text: " " + data.name }).prepend($("<strong>", { text: "Name: "})))).add(
					$("<div>", { class: "row" }).html(
						$("<div>", { class: "col-lg-12" }).html(
							$("<p>", { text: " " + data.mobile_number }).prepend($("<strong>", { text: "Mobile Number: "}))))).add(
					$("<div>", { class: "row" }).html(
						$("<div>", { class: "col-lg-12" }).html(
							$("<p>", { text: " " + data.email }).prepend($("<strong>", { text: "Email: "}))))).add(
					$("<div>", { class: "row" }).html(
						$("<div>", { class: "col-lg-12" }).html(
							$("<p>", { text: " " + data.registered }).prepend($("<strong>", { text: "Date Registered: "}))))))).add(
				$("<div>", { class: "feedbacks-item-keys col-lg-4" }).html(actionTaken)).add(
				$("<div>", { class: "feedbacks-item-content col-lg-3 text-right" }).html(
			actionButtons)))).add(
		$("<hr>")));
}