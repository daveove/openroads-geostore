var currentRequest = undefined;

$(document).ready(function (){
	loadPendingAgencyAdmin();
});

$(function(){
	$("#pending-admin-tab").on("shown.bs.tab", function (){
		currentRequest.abort();
		loadPendingAgencyAdmin();
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

function loadPendingAgencyAdmin(){
	$("#pending-admin").html(
		$("<h3>", { class: "text-center" }).html(
			$("<i>", { class: "fa fa-2x fa-spin fa-circle-o-notch" })).add(
		$("<h4>", { class: "text-center", text: "Loading Agency Admin Users" })));
	currentRequest = $.ajax({
		url: "/agency/admins?ajax=1&status=verified",
		success: function (data){
			if(data){
				try{
					if(data.users.length == 0){
						$("#pending-admin").html(
							$("<h3>", { class: "text-center" }).html(
								$("<i>", { class: "fa fa-2x fa-times" })).add(
							$("<h4>", { class: "text-center", text: "No pending agency admin users." })));
					}
					else{
						$("#pending-admin").html($("<div>", { class: "feedbacks-list col-lg-12", id: "pending-admin-feedbacks-list" }))
						var counter = 0;
						for(i=0;i<data.users.length;i++){
							counter += 1;
							$("#pending-admin-feedbacks-list").append(
								$("<div>", { class: "row" }).html(
									$("<div>", { class: "feedbacks-item feedbacks-item"+counter+" col-lg-12" }).html(
										$("<div>", { class: "feedbacks-item-keys text-center col-lg-2" }).html(
											$("<img>", { src: "https://www.gravatar.com/avatar/"+ data.users[i].email_md5 +"?s=100"}))
										.add($("<div>", { class: "feedbacks-item-keys col-lg-3" }).html(
											$("<div>", { class: "row" }).html(
												$("<div>", { class: "col-lg-12" }).html(
													$("<p>", { text: " " + data.users[i].name }).prepend($("<strong>", { text: "Name: "})))).add(
											$("<div>", { class: "row" }).html(
												$("<div>", { class: "col-lg-12" }).html(
													$("<p>", { text: " " + data.users[i].mobile_number }).prepend($("<strong>", { text: "Mobile Number: "}))))).add(
											$("<div>", { class: "row" }).html(
												$("<div>", { class: "col-lg-12" }).html(
													$("<p>", { text: " " + data.users[i].email }).prepend($("<strong>", { text: "Email: "}))))).add(
											$("<div>", { class: "row" }).html(
												$("<div>", { class: "col-lg-12" }).html(
													$("<p>", { text: " " + (data.users[i].designation || "NA") }).prepend($("<strong>", { text: "Designation: "}))))).add(
											$("<div>", { class: "row" }).html(
												$("<div>", { class: "col-lg-12" }).html(
													$("<p>", { text: " " + data.users[i].registered }).prepend($("<strong>", { text: "Date Registered: "}))))))).add(
										$("<div>", { class: "feedbacks-item-keys col-lg-4" }).html(
											$("<div>", { class: "row" }).html(
												$("<div>", { class: "col-lg-12" }).html(
													$("<p>", { text: " " + data.users[i].department }).prepend($("<strong>", { text: "Department: "})))).add(
											$("<div>", { class: "row" }).html(
												$("<div>", { class: "col-lg-12" }).html(
													$("<p>", { text: " " + data.users[i].agency }).prepend($("<strong>", { text: "Agency: "}))))).add(
											$("<div>", { class: "row" }).html(
												$("<div>", { class: "col-lg-12" }).html(
													$("<p>", { text: " " + data.users[i].region }).prepend($("<strong>", { text: "Region: "}))))).add(
											$("<div>", { class: "row" }).html(
												$("<div>", { class: "col-lg-12" }).html(
													$("<p>", { text: " " + data.users[i].operating_unit }).prepend($("<strong>", { text: "Operating Unit: "}))))))).add(
										$("<div>", { class: "feedbacks-item-content col-lg-3 text-right" }).html(
											$("<button>", { class: "btn btn-sm btn-success", onclick: "approveAgencyAdmin(this, '"+data.users[i].id+"');", text: " Approve" }).prepend($("<i>", { class: "fa fa-fw fa-check" })).add(
								$("<button>", { class: "btn btn-sm btn-danger", onclick: "disapproveAgencyAdmin(this, '"+data.users[i].id+"');", text: " Disapprove"}).prepend($("<i>", { class: "fa fa-fw fa-times" }))))))).add(
								$("<hr>")));
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
				$("<h4>", { class: "text-center", text: "Could not load agency admin users." })));
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
							$("#pending-admin-feedbacks-list").append(
								$("<div>", { class: "row" }).html(
									$("<div>", { class: "feedbacks-item feedbacks-item col-lg-12" }).html(
										$("<div>", { class: "feedbacks-item-keys text-center col-lg-2" }).html(
											$("<img>", { src: "https://www.gravatar.com/avatar/"+ data.users[i].email_md5 +"?s=100"}))
										.add($("<div>", { class: "feedbacks-item-keys col-lg-3" }).html(
											$("<div>", { class: "row" }).html(
												$("<div>", { class: "col-lg-12" }).html(
													$("<p>", { text: " " + data.users[i].name }).prepend($("<strong>", { text: "Name: "})))).add(
											$("<div>", { class: "row" }).html(
												$("<div>", { class: "col-lg-12" }).html(
													$("<p>", { text: " " + data.users[i].mobile_number }).prepend($("<strong>", { text: "Mobile Number: "}))))).add(
											$("<div>", { class: "row" }).html(
												$("<div>", { class: "col-lg-12" }).html(
													$("<p>", { text: " " + data.users[i].email }).prepend($("<strong>", { text: "Email: "}))))).add(
											$("<div>", { class: "row" }).html(
												$("<div>", { class: "col-lg-12" }).html(
													$("<p>", { text: " " + (data.users[i].designation || "NA") }).prepend($("<strong>", { text: "Designation: "}))))).add(
											$("<div>", { class: "row" }).html(
												$("<div>", { class: "col-lg-12" }).html(
													$("<p>", { text: " " + data.users[i].registered }).prepend($("<strong>", { text: "Date Registered: "}))))))).add(
										$("<div>", { class: "feedbacks-item-keys col-lg-4" }).html(
											$("<div>", { class: "row" }).html(
												$("<div>", { class: "col-lg-12" }).html(
													$("<p>", { text: " " + data.users[i].department }).prepend($("<strong>", { text: "Department: "})))).add(
											$("<div>", { class: "row" }).html(
												$("<div>", { class: "col-lg-12" }).html(
													$("<p>", { text: " " + data.users[i].agency }).prepend($("<strong>", { text: "Agency: "}))))).add(
											$("<div>", { class: "row" }).html(
												$("<div>", { class: "col-lg-12" }).html(
													$("<p>", { text: " " + data.users[i].region }).prepend($("<strong>", { text: "Region: "}))))).add(
											$("<div>", { class: "row" }).html(
												$("<div>", { class: "col-lg-12" }).html(
													$("<p>", { text: " " + data.users[i].operating_unit }).prepend($("<strong>", { text: "Operating Unit: "}))))))).add(
										$("<div>", { class: "feedbacks-item-content col-lg-3 text-right" }).html(
											$("<button>", { class: "btn btn-sm btn-success", onclick: "approveAgencyAdmin(this, '"+data.users[i].id+"');", text: " Approve" }).prepend($("<i>", { class: "fa fa-fw fa-check" })).add(
								$("<button>", { class: "btn btn-sm btn-danger", onclick: "disapproveAgencyAdmin(this, '"+data.users[i].id+"');", text: " Disapprove"}).prepend($("<i>", { class: "fa fa-fw fa-times" }))))))).add(
								$("<hr>")));
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
				$("<h4>", { class: "text-center", text: "Could not load agency admin users." })));
		}
	});
}

function loadApprovedAgencyAdmin(){
	$("#approved-admin").html(
		$("<h3>", { class: "text-center" }).html(
			$("<i>", { class: "fa fa-2x fa-spin fa-circle-o-notch" })).add(
		$("<h4>", { class: "text-center", text: "Loading Agency Admin Users" })));
	currentRequest = $.ajax({
		url: "/agency/admins?ajax=1&status=approved",
		success: function (data){
			if(data){
				try{
					if(data.users.length == 0){
						$("#approved-admin").html(
							$("<h3>", { class: "text-center" }).html(
								$("<i>", { class: "fa fa-2x fa-times" })).add(
							$("<h4>", { class: "text-center", text: "No approved agency admin users." })));
					}
					else{
						$("#approved-admin").html($("<div>", { class: "feedbacks-list col-lg-12", id: "approved-admins-list" }))
						for(i=0;i<data.users.length;i++){
							$("#approved-admins-list").append(
								$("<div>", { class: "row" }).html(
									$("<div>", { class: "feedbacks-item feedbacks-item col-lg-12" }).html(
										$("<div>", { class: "feedbacks-item-keys text-center col-lg-2" }).html(
											$("<img>", { src: "https://www.gravatar.com/avatar/"+ data.users[i].email_md5 +"?s=100"}))
										.add($("<div>", { class: "feedbacks-item-keys col-lg-3" }).html(
											$("<div>", { class: "row" }).html(
												$("<div>", { class: "col-lg-12" }).html(
													$("<p>", { text: " " + data.users[i].name }).prepend($("<strong>", { text: "Name: "})))).add(
											$("<div>", { class: "row" }).html(
												$("<div>", { class: "col-lg-12" }).html(
													$("<p>", { text: " " + data.users[i].mobile_number }).prepend($("<strong>", { text: "Mobile Number: "}))))).add(
											$("<div>", { class: "row" }).html(
												$("<div>", { class: "col-lg-12" }).html(
													$("<p>", { text: " " + data.users[i].email }).prepend($("<strong>", { text: "Email: "}))))).add(
											$("<div>", { class: "row" }).html(
												$("<div>", { class: "col-lg-12" }).html(
													$("<p>", { text: " " + (data.users[i].designation || "NA") }).prepend($("<strong>", { text: "Designation: "}))))).add(
											$("<div>", { class: "row" }).html(
												$("<div>", { class: "col-lg-12" }).html(
													$("<p>", { text: " " + data.users[i].registered }).prepend($("<strong>", { text: "Date Registered: "}))))).add(
											$("<div>", { class: "row" }).html(
												$("<div>", { class: "col-lg-12" }).html(
													$("<p>", { text: " " + data.users[i].approved_by }).prepend($("<strong>", { text: "Approved By: "}))))).add(
											$("<div>", { class: "row" }).html(
												$("<div>", { class: "col-lg-12" }).html(
													$("<p>", { text: " " + data.users[i].approved_on }).prepend($("<strong>", { text: "Approved On: "}))))))).add(
										$("<div>", { class: "feedbacks-item-keys col-lg-4" }).html(
											$("<div>", { class: "row" }).html(
												$("<div>", { class: "col-lg-12" }).html(
													$("<p>", { text: " " + data.users[i].department }).prepend($("<strong>", { text: "Department: "})))).add(
											$("<div>", { class: "row" }).html(
												$("<div>", { class: "col-lg-12" }).html(
													$("<p>", { text: " " + data.users[i].agency }).prepend($("<strong>", { text: "Agency: "}))))).add(
											$("<div>", { class: "row" }).html(
												$("<div>", { class: "col-lg-12" }).html(
													$("<p>", { text: " " + data.users[i].region }).prepend($("<strong>", { text: "Region: "}))))).add(
											$("<div>", { class: "row" }).html(
												$("<div>", { class: "col-lg-12" }).html(
													$("<p>", { text: " " + data.users[i].operating_unit }).prepend($("<strong>", { text: "Operating Unit: "}))))))).add(
										$("<div>", { class: "feedbacks-item-content col-lg-3 text-right" }).html(
								$("<button>", { class: "btn btn-sm btn-danger", onclick: "disapproveAgencyAdmin(this, '"+data.users[i].id+"');", text: " Disapprove"}).prepend($("<i>", { class: "fa fa-fw fa-times" })))))).add(
								$("<hr>")));
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
				$("<h4>", { class: "text-center", text: "Could not load agency admin users." })));
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
							$("#approved-admins-list").append(
								$("<div>", { class: "row" }).html(
									$("<div>", { class: "feedbacks-item feedbacks-item col-lg-12" }).html(
										$("<div>", { class: "feedbacks-item-keys text-center col-lg-2" }).html(
											$("<img>", { src: "https://www.gravatar.com/avatar/"+ data.users[i].email_md5 +"?s=100"}))
										.add($("<div>", { class: "feedbacks-item-keys col-lg-3" }).html(
											$("<div>", { class: "row" }).html(
												$("<div>", { class: "col-lg-12" }).html(
													$("<p>", { text: " " + data.users[i].name }).prepend($("<strong>", { text: "Name: "})))).add(
											$("<div>", { class: "row" }).html(
												$("<div>", { class: "col-lg-12" }).html(
													$("<p>", { text: " " + data.users[i].mobile_number }).prepend($("<strong>", { text: "Mobile Number: "}))))).add(
											$("<div>", { class: "row" }).html(
												$("<div>", { class: "col-lg-12" }).html(
													$("<p>", { text: " " + data.users[i].email }).prepend($("<strong>", { text: "Email: "}))))).add(
											$("<div>", { class: "row" }).html(
												$("<div>", { class: "col-lg-12" }).html(
													$("<p>", { text: " " + (data.users[i].designation || "NA") }).prepend($("<strong>", { text: "Designation: "}))))).add(
											$("<div>", { class: "row" }).html(
												$("<div>", { class: "col-lg-12" }).html(
													$("<p>", { text: " " + data.users[i].registered }).prepend($("<strong>", { text: "Date Registered: "}))))).add(
											$("<div>", { class: "row" }).html(
												$("<div>", { class: "col-lg-12" }).html(
													$("<p>", { text: " " + data.users[i].approved_by }).prepend($("<strong>", { text: "Approved By: "}))))).add(
											$("<div>", { class: "row" }).html(
												$("<div>", { class: "col-lg-12" }).html(
													$("<p>", { text: " " + data.users[i].approved_on }).prepend($("<strong>", { text: "Approved On: "}))))))).add(
										$("<div>", { class: "feedbacks-item-keys col-lg-4" }).html(
											$("<div>", { class: "row" }).html(
												$("<div>", { class: "col-lg-12" }).html(
													$("<p>", { text: " " + data.users[i].department }).prepend($("<strong>", { text: "Department: "})))).add(
											$("<div>", { class: "row" }).html(
												$("<div>", { class: "col-lg-12" }).html(
													$("<p>", { text: " " + data.users[i].agency }).prepend($("<strong>", { text: "Agency: "}))))).add(
											$("<div>", { class: "row" }).html(
												$("<div>", { class: "col-lg-12" }).html(
													$("<p>", { text: " " + data.users[i].region }).prepend($("<strong>", { text: "Region: "}))))).add(
											$("<div>", { class: "row" }).html(
												$("<div>", { class: "col-lg-12" }).html(
													$("<p>", { text: " " + data.users[i].operating_unit }).prepend($("<strong>", { text: "Operating Unit: "}))))))).add(
										$("<div>", { class: "feedbacks-item-content col-lg-3 text-right" }).html(
								$("<button>", { class: "btn btn-sm btn-danger", onclick: "disapproveAgencyAdmin(this, '"+data.users[i].id+"');", text: " Disapprove"}).prepend($("<i>", { class: "fa fa-fw fa-times" })))))).add(
								$("<hr>")));
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
				$("<h4>", { class: "text-center", text: "Could not load agency admin users." })));
		}
	});
}

function loadDisapprovedAgencyAdmin(){
	$("#disapproved-admin").html(
		$("<h3>", { class: "text-center" }).html(
			$("<i>", { class: "fa fa-2x fa-spin fa-circle-o-notch" })).add(
		$("<h4>", { class: "text-center", text: "Loading Agency Admin Users" })));
	currentRequest = $.ajax({
		url: "/agency/admins?ajax=1&status=disapproved",
		success: function (data){
			if(data){
				try{
					if(data.users.length == 0){
						$("#disapproved-admin").html(
							$("<h3>", { class: "text-center" }).html(
								$("<i>", { class: "fa fa-2x fa-times" })).add(
							$("<h4>", { class: "text-center", text: "No disapproved agency admin users." })));
					}
					else{
						$("#disapproved-admin").html($("<div>", { class: "feedbacks-list col-lg-12", id: "disapproved-admins-list" }))
						var counter = 0;
						for(i=0;i<data.users.length;i++){
							counter += 1;
							$("#disapproved-admins-list").append(
								$("<div>", { class: "row" }).html(
									$("<div>", { class: "feedbacks-item feedbacks-item col-lg-12" }).html(
										$("<div>", { class: "feedbacks-item-keys text-center col-lg-2" }).html(
											$("<img>", { src: "https://www.gravatar.com/avatar/"+ data.users[i].email_md5 +"?s=100"}))
										.add($("<div>", { class: "feedbacks-item-keys col-lg-3" }).html(
											$("<div>", { class: "row" }).html(
												$("<div>", { class: "col-lg-12" }).html(
													$("<p>", { text: " " + data.users[i].name }).prepend($("<strong>", { text: "Name: "})))).add(
											$("<div>", { class: "row" }).html(
												$("<div>", { class: "col-lg-12" }).html(
													$("<p>", { text: " " + data.users[i].mobile_number }).prepend($("<strong>", { text: "Mobile Number: "}))))).add(
											$("<div>", { class: "row" }).html(
												$("<div>", { class: "col-lg-12" }).html(
													$("<p>", { text: " " + data.users[i].email }).prepend($("<strong>", { text: "Email: "}))))).add(
											$("<div>", { class: "row" }).html(
												$("<div>", { class: "col-lg-12" }).html(
													$("<p>", { text: " " + (data.users[i].designation || "NA") }).prepend($("<strong>", { text: "Designation: "}))))).add(
											$("<div>", { class: "row" }).html(
												$("<div>", { class: "col-lg-12" }).html(
													$("<p>", { text: " " + data.users[i].registered }).prepend($("<strong>", { text: "Date Registered: "}))))).add(
											$("<div>", { class: "row" }).html(
												$("<div>", { class: "col-lg-12" }).html(
													$("<p>", { text: " " + data.users[i].approved_by }).prepend($("<strong>", { text: "Approved By: "}))))).add(
											$("<div>", { class: "row" }).html(
												$("<div>", { class: "col-lg-12" }).html(
													$("<p>", { text: " " + data.users[i].approved_on }).prepend($("<strong>", { text: "Approved On: "}))))))).add(
										$("<div>", { class: "feedbacks-item-keys col-lg-4" }).html(
											$("<div>", { class: "row" }).html(
												$("<div>", { class: "col-lg-12" }).html(
													$("<p>", { text: " " + data.users[i].department }).prepend($("<strong>", { text: "Department: "})))).add(
											$("<div>", { class: "row" }).html(
												$("<div>", { class: "col-lg-12" }).html(
													$("<p>", { text: " " + data.users[i].agency }).prepend($("<strong>", { text: "Agency: "}))))).add(
											$("<div>", { class: "row" }).html(
												$("<div>", { class: "col-lg-12" }).html(
													$("<p>", { text: " " + data.users[i].region }).prepend($("<strong>", { text: "Region: "}))))).add(
											$("<div>", { class: "row" }).html(
												$("<div>", { class: "col-lg-12" }).html(
													$("<p>", { text: " " + data.users[i].operating_unit }).prepend($("<strong>", { text: "Operating Unit: "}))))))).add(
										$("<div>", { class: "feedbacks-item-content col-lg-3 text-right" }).html(
								$("<button>", { class: "btn btn-sm btn-success", onclick: "approveAgencyAdmin(this, '"+data.users[i].id+"');", text: "Approve" }))))).add(
								$("<hr>")));
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
				$("<h4>", { class: "text-center", text: "Could not load agency admin users." })));
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
							$("#disapproved-admins-list").append(
								$("<div>", { class: "row" }).html(
									$("<div>", { class: "feedbacks-item feedbacks-item col-lg-12" }).html(
										$("<div>", { class: "feedbacks-item-keys text-center col-lg-2" }).html(
											$("<img>", { src: "https://www.gravatar.com/avatar/"+ data.users[i].email_md5 +"?s=100"}))
										.add($("<div>", { class: "feedbacks-item-keys col-lg-3" }).html(
											$("<div>", { class: "row" }).html(
												$("<div>", { class: "col-lg-12" }).html(
													$("<p>", { text: " " + data.users[i].name }).prepend($("<strong>", { text: "Name: "})))).add(
											$("<div>", { class: "row" }).html(
												$("<div>", { class: "col-lg-12" }).html(
													$("<p>", { text: " " + data.users[i].mobile_number }).prepend($("<strong>", { text: "Mobile Number: "}))))).add(
											$("<div>", { class: "row" }).html(
												$("<div>", { class: "col-lg-12" }).html(
													$("<p>", { text: " " + data.users[i].email }).prepend($("<strong>", { text: "Email: "}))))).add(
											$("<div>", { class: "row" }).html(
												$("<div>", { class: "col-lg-12" }).html(
													$("<p>", { text: " " + (data.users[i].designation || "NA") }).prepend($("<strong>", { text: "Designation: "}))))).add(
											$("<div>", { class: "row" }).html(
												$("<div>", { class: "col-lg-12" }).html(
													$("<p>", { text: " " + data.users[i].registered }).prepend($("<strong>", { text: "Date Registered: "}))))).add(
											$("<div>", { class: "row" }).html(
												$("<div>", { class: "col-lg-12" }).html(
													$("<p>", { text: " " + data.users[i].approved_by }).prepend($("<strong>", { text: "Approved By: "}))))).add(
											$("<div>", { class: "row" }).html(
												$("<div>", { class: "col-lg-12" }).html(
													$("<p>", { text: " " + data.users[i].approved_on }).prepend($("<strong>", { text: "Approved On: "}))))))).add(
										$("<div>", { class: "feedbacks-item-keys col-lg-4" }).html(
											$("<div>", { class: "row" }).html(
												$("<div>", { class: "col-lg-12" }).html(
													$("<p>", { text: " " + data.users[i].department }).prepend($("<strong>", { text: "Department: "})))).add(
											$("<div>", { class: "row" }).html(
												$("<div>", { class: "col-lg-12" }).html(
													$("<p>", { text: " " + data.users[i].agency }).prepend($("<strong>", { text: "Agency: "}))))).add(
											$("<div>", { class: "row" }).html(
												$("<div>", { class: "col-lg-12" }).html(
													$("<p>", { text: " " + data.users[i].region }).prepend($("<strong>", { text: "Region: "}))))).add(
											$("<div>", { class: "row" }).html(
												$("<div>", { class: "col-lg-12" }).html(
													$("<p>", { text: " " + data.users[i].operating_unit }).prepend($("<strong>", { text: "Operating Unit: "}))))))).add(
										$("<div>", { class: "feedbacks-item-content col-lg-3 text-right" }).html(
								$("<button>", { class: "btn btn-sm btn-danger", onclick: "disapproveAgencyAdmin(this, '"+data.users[i].id+"');", text: " Disapprove"}).prepend($("<i>", { class: "fa fa-fw fa-times" })))))).add(
								$("<hr>")));
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
				$("<h4>", { class: "text-center", text: "Could not load agency admin users." })));
		}
	});
}

function approveAgencyAdmin(obj, f_id){
	$(obj).prop("disabled", true);
	$(obj).next("button").prop("disabled", true);
	$.ajax({
		type: "POST",
		url: "/agency/admins",
		data: {agency_admin_id: f_id, action: "approve"},
		success: function(data){
			$(obj).prop("disabled", false);
			$(obj).next("button").prop("disabled", false);
			if($(obj).closest("div.row").parent("div").children("div.row").length == 1){
				$(obj).closest("div.row").slideUp("slow", function (){
					$("#pending-admin").html(
					$("<h3>", { class: "text-center" }).html(
						$("<i>", { class: "fa fa-2x fa-times" })).add(
					$("<h4>", { class: "text-center", text: "No pending agency admin users." })));
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
			$(obj).prop("disabled", false);
			$(obj).next("button").prop("disabled", false);
		}
	});
}

function disapproveAgencyAdmin(obj, f_id){
	$(obj).prop("disabled", true);
	$(obj).prev("button").prop("disabled", true);
	$.ajax({
		type: "POST",
		url: "/agency/admins",
		data: {agency_admin_id: f_id, action: "disapprove"},
		success: function(data){
			$(obj).prop("disabled", false);
			$(obj).prev("button").prop("disabled", false);
			if($(obj).closest("div.row").parent("div").children("div.row").length == 1){
				$("#for-review").html(
					$("<h3>", { class: "text-center" }).html(
						$("<i>", { class: "fa fa-2x fa-times" })).add(
					$("<h4>", { class: "text-center", text: "No pending agency admin users." })));
			}
			else{
				$(obj).closest("div.row").next("hr").remove();
				$(obj).closest("div.row").remove();
			}
		},
		error: function (){
			$(obj).prev("button").prop("disabled", false);
			$(obj).prop("disabled", false);
		}
	});
}