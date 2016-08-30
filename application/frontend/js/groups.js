/*
    Create a new environment.
*/
function newUserGroup(obj){
    $("body").append(
        $("<div>", { class: "modal fade", id: "newTeamModal", "tabindex": "-1", "role": "dialog", "aria-labelledby": "newTeamModalLabel", "aria-hidden": "true" }).html(
            $("<div>", { class: "modal-dialog" }).html(
                $("<form>", { class: "form-horizontal", method: "POST", id: "newTeamForm" }).html(
                    $("<div>", { class: "modal-content" }).html(
                        $("<div>", { class: "modal-header" }).html(
                            $("<button>", { class: "close", "data-dismiss": "modal", type: "button", "aria-hidden": "true", text: "×" }).add(
                            $("<h3>", { class: "modal-title", id: "newTeamModalLabel", text: "Create New User Group" }))
                        ).add(
                            $("<div>", { class: "modal-body" }).html(
                                $("<div>", { class: "form-group" }).html(
                                    $("<label>", { class: "control-label col-xs-4", for: "teamName", text: "User Group Name " }).append(
                                        $("<span>", { class: "text-danger", text: "*"})).add(
                                    $("<div>", { class: "col-xs-7" }).html(
                                        $("<input>", { class: "form-control text-uppercase", id: "teamName", name: "group_name", placeholder: "User Group Name", type: "text", required: "" })))).add(
                                $("<div>", { class: "form-group" }).html(
                                    $("<label>", { class: "control-label col-xs-4", for: "teamDescription", text: "User Group Description " }).append(
                                        $("<span>", { class: "text-danger", text: "*"})).add(
                                    $("<div>", { class: "col-xs-7" }).html(
                                        $("<textarea>", { class: "form-control", id: "teamDescription", name: "group_description", placeholder: "A short description about the user group", rows: "5", required: "" }))))).add(
                                $("<div>", { class: "form-group" }).html(
                                    $("<label>", { class: "control-label col-xs-4", for: "inviteMembers", text: "Invite Members " }).append(
                                        $("<span>", { class: "text-danger", text: "*"})).add(
                                    $("<div>", { class: "col-xs-7" }).html(
                                        $("<textarea>", { class: "form-control", id: "inviteMembers", name: "group_member_emails", placeholder: "User emails separated by comma", rows: "3", required: ""}).add(
                                        $("<p>", { class: "help-block", text: "Enter the email address of the users that you want to invite and separate it by comma."}))))))
                            )
                        ).add(
                            $("<div>", { class: "modal-footer" }).html(
                                $("<button>", { type: "button", "data-dismiss": "modal", class: "btn btn-default", text: "Cancel" }).add(
                                $("<button>", { type: "submit", class: "btn btn-inverse", text: " Save User Group" })))
                            )
                        )
                    ))
                )
            );
    $("#newTeamModal").modal({ show: true, backdrop: "static", keyboard: false }).on("shown.bs.modal", function (){
        $("#newTeamForm").submit(function (e) {
            $(this).find("button").prop("disabled", true);
            $(this).find("button:submit").prepend($("<i>", { class: "fa fa-fw fa-spin fa-circle-o-notch" }));
        });
        $(this).find("input.form-control:first").focus();
    }).on("hidden.bs.modal", function (){
        $(this).remove();
    });
}

/*
    Update existing environment.
    Update the title and description.
*/
function manageUserGroup(obj){
    if(!$(obj).data("group-id")){
        /* Environment ID is required when updating an environment */
        console.log("No environment ID.");
        return
    }
    $(obj).prop("disabled", true).prepend($("<i>", { class: "fa fa-fw fa-spin fa-circle-o-notch" }));
    var groupID = $(obj).data("group-id");
    $.ajax({
        url: "/groups/" + groupID,
        dataType: "json",
        success: function(data){
            $(obj).prop("disabled", false).children("i.fa-spin").remove();
            if(data){
                console.log(data)
                $("body").append(
                    $("<div>", { class: "modal fade", id: "updateTeamModal", "tabindex": "-1", "role": "dialog", "aria-labelledby": "updateTeamModalLabel", "aria-hidden": "true" }).html(
                        $("<div>", { class: "modal-dialog" }).html(
                            $("<form>", { class: "form-horizontal", method: "POST", action: "/groups/" + groupID, id: "updateTeamForm" }).html(
                                $("<div>", { class: "modal-content" }).html(
                                    $("<div>", { class: "modal-header" }).html(
                                        $("<button>", { class: "close", "data-dismiss": "modal", type: "button", "aria-hidden": "true", text: "×" }).add(
                                        $("<h3>", { class: "modal-title", id: "updateTeamModalLabel", text: "Manage User Group" }))
                                    ).add(
                                        $("<div>", { class: "modal-body" }).html(
                                            $("<div>", { class: "form-group" }).html(
                                                $("<label>", { class: "control-label col-xs-4", for: "teamName", text: "User Group Name " }).append(
                                                    $("<span>", { class: "text-danger", text: "*"})).add(
                                                $("<div>", { class: "col-xs-7" }).html(
                                                    $("<input>", { class: "form-control text-uppercase", id: "teamName", name: "environment_name", placeholder: "User Group Name", type: "text", value: (data.title || ""), required: "" })))).add(
                                            $("<div>", { class: "form-group" }).html(
                                                $("<label>", { class: "control-label col-xs-4", for: "teamDescription", text: "User Group Description " }).append(
                                                    $("<span>", { class: "text-danger", text: "*"})).add(
                                                $("<div>", { class: "col-xs-7" }).html(
                                                    $("<textarea>", { class: "form-control", id: "teamDescription", name: "environment_description", placeholder: "A short description about the team", rows: "5", required: "", text: (data.description || "") }))))).add(
                                            $("<div>", { class: "form-group" }).html(
                                                $("<label>", { class: "control-label col-xs-4", for: "teamMembers", text: "User Group Members" }).add(
                                                $("<div>", { class: "col-xs-7", id: "teamMembersContainer" }).html(
                                                    $("<p>", { class: "form-control-static" }).html($("<i>", { class: "fa fa-fw fa-spin fa-circle-o-notch"})).append(" Loading team members..."))))).add(
                                            $("<div>", { class: "form-group" }).html(
                                                $("<label>", { class: "control-label col-xs-4", for: "teamInvitedUsers", text: "Pending Invitations" }).add(
                                                $("<div>", { class: "col-xs-7", id: "teamInvitedUsersContainer" }).html(
                                                    $("<p>", { class: "form-control-static" }).html($("<i>", { class: "fa fa-fw fa-spin fa-circle-o-notch"})).append(" Loading pending invitations...")))))
                                        )
                                    ).add(
                                        $("<div>", { class: "modal-footer" }).html(
                                            $("<button>", { type: "button", "data-dismiss": "modal", class: "btn btn-default", text: "Cancel" }).add(
                                            $("<button>", { type: "submit", class: "btn btn-inverse", text: " Update User Group" })))
                                        )
                                    )
                                ))
                            )
                        );
                if(data.members.length > 0){
                    $("#teamMembersContainer").empty();
                    for(i=0;i<data.members.length;i++){
                        $("#teamMembersContainer").append(
                            $("<div>", { class: "row", id: data.members[i].id + "_update" }).html(
                            $("<div>", { class: "col-xs-2 no-padding-right" }).html(
                                $("<img>", { class: "navbar-avatar", src: "https://www.gravatar.com/avatar/" + data.members[i].email_md5 + "?s=30", style: "padding-top: 10px;" })).add(
                            $("<div>", { class: "col-xs-10 no-padding-left" }).html(
                                $("<p>", { class: "form-control-static", text: data.members[i].name + (data.members[i].id == userID ? " (YOU)" : "" ) }).append($("<button>", { class: "btn btn-xs btn-danger pull-right " + (data.members[i].id == userID ? "remove-own-" + userID : "" ), type: "button", "data-team-id": groupID, "data-user-id": data.members[i].id, onclick: "removeMember(this);", text: " Remove User", disabled: (data.members[i].id == userID ? true : false )})).append($("<br>")).append(" (" + data.members[i].email + ")")))));
                    }
                }
                else{
                    $("#teamMembersContainer").html($("<p>", { class: "form-control-static", text: " No team members" }).prepend($("<i>", { class: "fa fa-fw fa-info"})));
                }
                if(data.invited_users.length>0){
                    $("#teamInvitedUsersContainer").empty();
                    for(i=0;i<data.invited_users.length;i++){
                        $("#teamInvitedUsersContainer").append($("<p>", { class: "form-control-static", text: data.invited_users[i] }).append($("<button>", { class: "btn btn-xs btn-danger pull-right", type: "button", "data-team-id": groupID, "data-user-email": data.invited_users[i], onclick: "cancelInvite(this);", text: " Cancel Invite"})));
                    }
                    $("#teamInvitedUsersContainer").append($("<p>", { class: "form-control-static" }).html($("<button>", { class: "btn btn-xs btn-success", type: "button", "data-team-id": groupID, onclick: "inviteUsers(this);", text: "Invite Users"})));
                }
                else{
                    $("#teamInvitedUsersContainer").html($("<p>", { class: "form-control-static", text: " No pending invitations" }).prepend($("<i>", { class: "fa fa-fw fa-info"})).append($("<button>", { class: "btn btn-xs btn-primary pull-right", type: "button", "data-team-id": groupID, onclick: "inviteUsers(this);", text: " Invite Users"})));
                }
                $("#updateTeamModal").modal({ show: true, backdrop: "static", keyboard: false }).on("shown.bs.modal", function (){
                    $("#updateTeamForm").submit(function (e) {
                        e.preventDefault();
                        $(this).find(".modal-body").children("div.modal-alert").remove();
                        $(this).find("button").prop("disabled", true);
                        $(this).find("button:submit").children("i").remove();
                        $(this).find("button:submit").prepend($("<i>", { class: "fa fa-fw fa-spin fa-circle-o-notch" }));
                        $.ajax({
                            url: "/groups/" + groupID,
                            type: "POST",
                            data: {action: "update_group", group_name: $("#teamName").val(), group_description: $("#teamDescription").val()},
                            success: function (data){
                                $("#updateTeamForm").find("button").prop("disabled", false);
                                $("#updateTeamForm").find("button:submit").children("i").remove();
                                $(".remove-own-" + userID).prop("disabled", true);
                                if(data){
                                    if(data.code == 200){
                                        if(!data.success){
                                            $("#updateTeamForm").find(".modal-body").prepend($("<div>", { class: "form-group no-margin modal-alert" }).html(
                                                $("<div>", { class: "col-xs-12" }).html(
                                                    $("<div>", { class: "alert alert-danger", text: " " + data.description }).prepend($("<i>", { class: "fa fa-fw fa-times" })).prepend($("<button>", { class: "close", "aria-label": "Close", "data-dismiss": "alert", type: "button", text: " ×", }).prepend($("<span>", { "aria-hidden": true }))))));
                                        }
                                        else{
                                            $("#updateTeamForm").find(".modal-body").prepend($("<div>", { class: "form-group no-margin modal-alert" }).html(
                                                $("<div>", { class: "col-xs-12" }).html(
                                                    $("<div>", { class: "alert alert-success", text: " User group has been updated." }).prepend($("<i>", { class: "fa fa-fw fa-check" })).prepend($("<button>", { class: "close", "aria-label": "Close", "data-dismiss": "alert", type: "button", text: " ×", }).prepend($("<span>", { "aria-hidden": true }))))));
                                            $("#" + data.data.id).html($("<td>").text(data.data.team_name).add($("<td>").text(data.data.team_description)).add($("<td>").text(data.data.member_count)).add($("<td>").text(data.data.invited_users_count)).add($("<td>").text(data.data.created_time)).add($("<td>").html($("<button>", { class: "btn btn-success btn-xs", type: "button", text: "Update Team", onclick: "updateTeam(this);", "data-team-id": data.data.id }).add($("<button>", { class: "btn btn-primary btn-xs", type: "button", text: "Invite Users", "data-team-id": data.data.id, onclick: "inviteUsers(this);" })))));
                                            updateRowInTable(data.data);
                                        }
                                        $(this).find("input.form-control:first").focus();
                                        return
                                    }
                                }
                                $("#updateTeamForm").find(".modal-body").prepend($("<div>", { class: "form-group no-margin modal-alert" }).html(
                                            $("<div>", { class: "col-xs-12" }).html(
                                                $("<div>", { class: "alert alert-danger", text: " Could not update the team." }).prepend($("<i>", { class: "fa fa-fw fa-times" })).prepend($("<button>", { class: "close", "aria-label": "Close", "data-dismiss": "alert", type: "button", text: " ×", }).prepend($("<span>", { "aria-hidden": true }))))));
                            },
                            error: function (){
                                $(".remove-own-" + userID).prop("disabled", true);
                            }
                        });
                    });
                    $(this).find("input.form-control:first").focus();
                }).on("hidden.bs.modal", function (){
                    $(this).remove();
                });
            }
        },
        error: function (){
            $(obj).prop("disabled", false).children("i.fa-spin").remove();
        }
    });
}

function updateRowInTable(data){
    var newData = '<td>' + data.title + '</td>';
    newData += '<td>' + data.description + '</td>';
    newData += '<td><button class="btn btn-xs btn-primary" type="button" data-toggle="collapse" data-target="#'+data.id+'-collapse" aria-expanded="false" aria-controls="collapseExample">'+data.members_length+' Member(s)</button><div class="collapse" id="'+data.id+'-collapse"><table><tbody>';
    if(data.members.length > 0){
        for(i=0;i<data.members.length;i++){
            newData += '<tr><td><img class="navbar-avatar" src="https://www.gravatar.com/avatar/'+ data.members[i].email_md5 +'?s=30" style="padding-top: 10px;"> ';
            newData += data.members[i].name;
            if(userID == data.members[i].id){
                newData += ' (YOU)'
            }
            newData += '</td><td><button class="btn btn-xs btn-danger" title="Remove from group"';
            if(userID == data.members[i].id){
                newData += ' disabled';
            }
            newData += '><i class="fa fa-fw fa-remove"></i></button></td></tr>';
        }
    }
    newData += '</tbody></table></div></td>';
    newData += '<td><button class="btn btn-xs btn-inverse" data-group-id="'+data.id+'" onclick="manageUserGroup(this);"> Manage User Group</button></td>';
    $("#" + data.id + '-row').html(newData)
}

/*
    Cancel an invitation.
*/
function cancelInvite(obj){
    var teamID = $(obj).data("team-id"),
    userEmail = $(obj).data("user-email");
    $(obj).prepend($("<i>", { class: "fa fa-fw fa-spin fa-circle-o-notch" })).prop("disabled", true);
    $.ajax({
        url: "/groups/" + teamID,
        type: "POST",
        data: {email: userEmail, action: "delete_invited_user"},
        success: function (data){
            if(data){
                if(data.code == 200){
                    $(obj).prop("disabled", false).children("i").remove();
                    $(obj).parent("p.form-control-static").fadeOut( "slow", function() {
                        $(obj).parent("p.form-control-static").remove();
                        if($("#teamInvitedUsersContainer").children("p").length == 0){
                            $("#teamInvitedUsersContainer").html($("<p>", { class: "form-control-static", text: " No pending invitations" }).prepend($("<i>", { class: "fa fa-fw fa-info"})).append($("<button>", { class: "btn btn-xs btn-primary pull-right", type: "button", "data-team-id": teamID,onclick: "inviteUsers(this);", text: " Invite Users"})));
                        }
                    });
                    return
                }
            }
        },
        error: function (){
            $(obj).prop("disabled", false).children("i").remove();
        }
    })
}

/*
    Remove member from the environment.
*/
function removeMember(obj){
    var teamID = $(obj).data("team-id"),
    userID = $(obj).data("user-id");
    if(confirm('WARNING: Are you sure you want to remove this user from all Datasets that have been granted access through this user group?')){
        $(obj).prepend($("<i>", { class: "fa fa-fw fa-spin fa-circle-o-notch" })).prop("disabled", true);
        $.ajax({
            url: "/groups/" + teamID,
            type: "POST",
            data: {user_id: userID, action: "remove_member"},
            success: function (data){
                if(data){
                    if(data.code == 200){
                        $(obj).prop("disabled", false).children("i").remove();
                        console.log($("#" + userID + "_update"))
                        $("#" + userID + "_update").fadeOut( "slow", function() {
                            $("#" + userID + "_update").remove();
                            if($("#teamMembersContainer").children("div.row").length == 0){
                                $("#teamMembersContainer").html($("<p>", { class: "form-control-static", text: " No members" }).prepend($("<i>", { class: "fa fa-fw fa-info"})));
                            }
                        });
                        updateRowInTable(data.data);
                        return
                    }
                }
            },
            error: function (){
                $(obj).prop("disabled", false).children("i").remove();
            }
        });
    }
}

/*
    Invite users to the environment.
    Inivted user must have an account.
*/
function inviteUsers(obj){
    var teamID = $(obj).data("team-id");
    $("#updateTeamModal").modal("hide");
    $("body").append(
        $("<div>", { class: "modal fade", id: "inviteUsersModal", "tabindex": "-1", "role": "dialog", "aria-labelledby": "inviteUsersModalLabel", "aria-hidden": "true" }).html(
            $("<div>", { class: "modal-dialog" }).html(
                $("<form>", { class: "form-horizontal", method: "POST", action: "/groups/" + teamID, id: "inviteUsersForm" }).html(
                    $("<div>", { class: "modal-content" }).html(
                        $("<div>", { class: "modal-header" }).html(
                            $("<button>", { class: "close", "data-dismiss": "modal", type: "button", "aria-hidden": "true", text: "×" }).add(
                            $("<h3>", { class: "modal-title", id: "inviteUsersModalLabel", text: "Invite Users" }))
                        ).add(
                            $("<div>", { class: "modal-body" }).html(
                                $("<div>", { class: "form-group" }).html(
                                    $("<label>", { class: "control-label col-xs-3", for: "userEmail", text: "User Email " }).append(
                                        $("<span>", { class: "text-danger", text: "*"})).add(
                                    $("<div>", { class: "col-xs-8" }).html(
                                        $("<textarea>", { class: "form-control", id: "userEmail", name: "team_member_emails", placeholder: "User emails separated by comma", rows: "3", required: ""}).add(
                                        $("<p>", { class: "help-block", text: "Enter the email address of the users that you want to invite and separate it by comma."})))))
                            )
                        ).add(
                            $("<div>", { class: "modal-footer" }).html(
                                $("<button>", { type: "button", "data-dismiss": "modal", class: "btn btn-default", text: "Cancel" }).add(
                                $("<button>", { type: "submit", class: "btn btn-inverse", text: " Send Invitation" })))
                            )
                        )
                    ))
                )
            );
    $("#inviteUsersModal").modal({ show: true, backdrop: "static", keyboard: false }).on("shown.bs.modal", function (){
        $("#inviteUsersForm").submit(function (e) {
            e.preventDefault();
            $(this).find(".modal-body").children("div.modal-alert").remove();
            $(this).find("button").prop("disabled", true);
            $(this).find("button:submit").children("i").remove();
            $(this).find("button:submit").prepend($("<i>", { class: "fa fa-fw fa-spin fa-circle-o-notch" }));
            $.ajax({
                url: "/groups/" + teamID,
                type: "POST",
                data: {action: "invite_users", email: $("#userEmail").val()},
                success: function (data){
                    $("#inviteUsersForm").find("button").prop("disabled", false);
                    $("#inviteUsersForm").find("button:submit").children("i").remove();
                    if(data){
                        if(data.code == 200){
                            if(!data.success){
                                $("#inviteUsersForm").find(".modal-body").prepend($("<div>", { class: "form-group no-margin modal-alert" }).html(
                                    $("<div>", { class: "col-xs-12" }).html(
                                        $("<div>", { class: "alert alert-danger", text: " " + data.description }).prepend($("<i>", { class: "fa fa-fw fa-times" })).prepend($("<button>", { class: "close", "aria-label": "Close", "data-dismiss": "alert", type: "button", text: " ×", }).prepend($("<span>", { "aria-hidden": true }))))));
                            }
                            else{
                                $("#inviteUsersForm").find(".modal-body").prepend($("<div>", { class: "form-group no-margin modal-alert" }).html(
                                    $("<div>", { class: "col-xs-12" }).html(
                                        $("<div>", { class: "alert alert-success", text: " Invitation has been sent." }).prepend($("<i>", { class: "fa fa-fw fa-check" })).prepend($("<button>", { class: "close", "aria-label": "Close", "data-dismiss": "alert", type: "button", text: " ×", }).prepend($("<span>", { "aria-hidden": true }))))));
                                $("#" + data.data.id).html($("<td>").text(data.data.team_name).add($("<td>").text(data.data.team_description)).add($("<td>").text(data.data.member_count)).add($("<td>").text(data.data.invited_users_count)).add($("<td>").text(data.data.created_time)).add($("<td>").html($("<button>", { class: "btn btn-success btn-xs", type: "button", text: "Update Team", onclick: "updateTeam(this);", "data-team-id": data.data.id }).add($("<button>", { class: "btn btn-primary btn-xs", type: "button", text: "Invite Users", "data-team-id": data.data.id, onclick: "inviteUsers(this);" })))));
                            }
                            $(this).find("input.form-control:first").focus();
                            return
                        }
                    }
                    $("#inviteUsersForm").find(".modal-body").prepend($("<div>", { class: "form-group no-margin modal-alert" }).html(
                                $("<div>", { class: "col-xs-12" }).html(
                                    $("<div>", { class: "alert alert-danger", text: " Could not send the invitation." }).prepend($("<i>", { class: "fa fa-fw fa-times" })).prepend($("<button>", { class: "close", "aria-label": "Close", "data-dismiss": "alert", type: "button", text: " ×", }).prepend($("<span>", { "aria-hidden": true }))))));
                },
                error: function (){
                    $("#inviteUsersForm").find("button").prop("disabled", false);
                    $("#inviteUsersForm").find("button:submit").children("i").remove();
                    $("#inviteUsersForm").find(".modal-body").prepend($("<div>", { class: "form-group no-margin modal-alert" }).html(
                        $("<div>", { class: "col-xs-12" }).html(
                            $("<div>", { class: "alert alert-danger", text: " Could not send the invitation." }).prepend($("<i>", { class: "fa fa-fw fa-times" })).prepend($("<button>", { class: "close", "aria-label": "Close", "data-dismiss": "alert", type: "button", text: " ×", }).prepend($("<span>", { "aria-hidden": true }))))));
                }
            });
        });
        $(this).find("textarea.form-control:first").focus();
    }).on("hidden.bs.modal", function (){
        $(this).remove();
    });
}