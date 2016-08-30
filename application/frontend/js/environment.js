window.environment_groups = new Object();
var table = $('#table_id').DataTable({
    'autoWidth': false,
    'processing': true,
    'language': {
        'lengthMenu': '_MENU_',
    },
    // 'bSort': false,
});

/*
    Create a new environment.
*/
function newEnvironment(obj){
    $("body").append(
        $("<div>", { class: "modal fade", id: "newTeamModal", "tabindex": "-1", "role": "dialog", "aria-labelledby": "newTeamModalLabel", "aria-hidden": "true" }).html(
            $("<div>", { class: "modal-dialog" }).html(
                $("<form>", { class: "form-horizontal", method: "POST", id: "newTeamForm" }).html(
                    $("<div>", { class: "modal-content" }).html(
                        $("<div>", { class: "modal-header" }).html(
                            $("<button>", { class: "close", "data-dismiss": "modal", type: "button", "aria-hidden": "true", text: "×" }).add(
                            $("<h3>", { class: "modal-title", id: "newTeamModalLabel", text: "Create New Workspace" }))
                        ).add(
                            $("<div>", { class: "modal-body" }).html(
                                $("<div>", { class: "form-group" }).html(
                                    $("<label>", { class: "control-label col-xs-4", for: "teamName", text: "Workspace Name " }).append(
                                        $("<span>", { class: "text-danger", text: "*"})).add(
                                    $("<div>", { class: "col-xs-7" }).html(
                                        $("<input>", { class: "form-control text-uppercase", id: "teamName", name: "environment_name", placeholder: "Workspace Name", type: "text", required: "" })))).add(
                                $("<div>", { class: "form-group" }).html(
                                    $("<label>", { class: "control-label col-xs-4", for: "teamDescription", text: "Workspace Description " }).append(
                                        $("<span>", { class: "text-danger", text: "*"})).add(
                                    $("<div>", { class: "col-xs-7" }).html(
                                        $("<textarea>", { class: "form-control", id: "teamDescription", name: "environment_description", placeholder: "A short description about the workspace", rows: "5", required: "" }))))).add(
                                $("<div>", { class: "form-group" }).html(
                                    $("<label>", { class: "control-label col-xs-4", for: "teamDescription", text: "User Groups " }).add(
                                    $("<div>", { class: "col-xs-7", id: 'userGroupEnvironment' }).html(
                                        $("<button>", { class: "btn btn-sm btn-success", type: 'button', id: "addUserGroupBtn", onclick: 'addUserGroupToNewEnvironment(this);', text: 'Add a User Group' }))))).add(
                                $("<div>", { class: "form-group" }).html(
                                    $("<label>", { class: "control-label col-xs-4", for: "inviteMembers", text: "Add Members " }).append(
                                        $("<span>", { class: "text-danger", text: "*"})).add(
                                    $("<div>", { class: "col-xs-7" }).html(
                                        $("<textarea>", { class: "form-control", id: "inviteMembers", name: "environment_member_emails", placeholder: "User emails separated by comma", rows: "3", required: ""}).add(
                                        $("<p>", { class: "help-block", text: "Enter the email address of the users that you want to invite and separate it by comma."}))))))
                            )
                        ).add(
                            $("<div>", { class: "modal-footer" }).html(
                                $("<button>", { type: "button", "data-dismiss": "modal", class: "btn btn-default", text: "Cancel" }).add(
                                $("<button>", { type: "submit", class: "btn btn-inverse", text: " Save Workspace" })).add(
                                $('<input>', { type: 'hidden', name: 'token', value: token })))
                            )
                        )
                    ))
                )
            );
    $("#newTeamModal").modal({ show: true, backdrop: "static", keyboard: false }).on("shown.bs.modal", function (){
        $("#newTeamForm").submit(function (e) {
            $(this).find(".form-control").prop('readonly', true);
            $(this).find("button").prop("disabled", true);
            $(this).find("button:submit").prepend($("<i>", { class: "fa fa-fw fa-spin fa-circle-o-notch" }));
        });
        $(this).find("input.form-control:first").focus();
    }).on("hidden.bs.modal", function (){
        $(this).remove();
    });
}

function addUserGroupToNewEnvironment(obj){
    if($('#teamName').val().length == 0){
        $('#newTeamForm').find('button[type=submit]').click();
        return
    }
    $("body").append(
        $("<div>", { class: "modal fade", id: "addUserGroupModal", "tabindex": "-1", "role": "dialog", "aria-labelledby": "inviteUsersModalLabel", "aria-hidden": "true" }).html(
            $("<div>", { class: "modal-dialog" }).html(
                $("<form>", { class: "form-horizontal", method: "POST", action: "/workspace", id: "addUserGroupForm" }).html(
                    $("<div>", { class: "modal-content" }).html(
                        $("<div>", { class: "modal-header" }).html(
                            $("<button>", { class: "close", "data-dismiss": "modal", type: "button", "aria-hidden": "true", text: "×" }).add(
                            $("<h3>", { class: "modal-title", id: "inviteUsersModalLabel", text: "Add User Group to " + $('#teamName').val().toUpperCase() }))
                        ).add(
                            $("<div>", { class: "modal-body" }).html($('<p>', { class: 'text-center'}).html($('<i>', { class: 'fa fa-fw fa-3x fa-spin fa-circle-o-notch' })).add(
            $('<h4>', { class: 'text-center', text: 'Loading user groups...' })))
                        ).add(
                            $("<div>", { class: "modal-footer" }).html(
                                $("<button>", { type: "button", "data-dismiss": "modal", class: "btn btn-default", text: "Cancel" }).add(
                                $("<button>", { type: "submit", class: "btn btn-inverse", text: " Add to Workspace", disabled: true })))
                            )
                        )
                    ))
                )
            );
    $("#addUserGroupModal").modal({ show: true, backdrop: "static", keyboard: false }).on('shown.bs.modal', function (){
        $.ajax({
            url: '/api/v1/groups',
            success: function (data){
                if(data){
                    console.log(data.data.length )
                    if(data.data.length > 0 ){
                        $('#addUserGroupModal').find('div.modal-body').html(
                            $('<table>', { class: 'table table-striped', id: 'table-user-group-list' }).html(
                                $('<thead>').html(
                                    $('<tr>').html(
                                        $('<th>').add(
                                        $('<th>', { text: 'Group Name' })).add(
                                        $('<th>', { text: 'Group Description'})))).add(
                                $('<tbody>'))));
                        for(i=0;i<data.data.length;i++){
                            if($('#userGroupEnvironment').find('p[data-group-id='+data.data[i].id+']').length == 0){
                                $('#table-user-group-list').find('tbody').append($('<tr>').html($('<td>').html($('<input>', { type: 'checkbox', 'data-group-name': data.data[i].title, value: data.data[i].id, class: 'user-group' })).add($('<td>', { text: data.data[i].title})).add($('<td>', { text: data.data[i].description }))));
                           }
                        }

                        if($('#table-user-group-list').find('tbody>tr').length == 0){
                            $('#addUserGroupModal').find('div.modal-body').html(
                                $("<div>", { class: "alert alert-warning fade in", text: ' No available user group found. You may have already added your user groups to the workspace. ' }).append(
                                    $('<a>', { href: '', text: 'Create a user group?' })).prepend(
                                    $("<i>", { class: "fa fa-fw fa-times" })));
                        }

                        $('input.user-group').click(function(){
                            if($(this).is(':checked')){
                                $('#addUserGroupForm').find('button[type=submit]').prop('disabled', false);
                            }
                            else{
                                if(!$('input.user-group').is(':checked')){
                                    $('#addUserGroupForm').find('button[type=submit]').prop('disabled', true);
                                }
                            }
                        });
                        return
                    }
                }
                $('#addUserGroupModal').find('div.modal-body').html(
                    $("<div>", { class: "alert alert-warning fade in", text: ' No available user group found. You may have already added your user groups to the workspace. ' }).append(
                        $('<a>', { href: '', text: 'Create a user group?' })).prepend(
                        $("<i>", { class: "fa fa-fw fa-times" })));
            },
            error: function (){

            }
        });
        $('#addUserGroupForm').submit(function (e){
            $('.user-group:checked').each(function(){
                var $this = $(this);
                $('#userGroupEnvironment').prepend(
                    $("<p>", { class: "form-control-static", text: $this.data('group-name') + ' ', 'data-group-name': $this.data('group-name'), 'data-group-id': $this.val(), id: $this.val() }).append(
                        $("<button>", { class: "btn btn-xs btn-danger pull-right", type: 'button', onclick: 'removeUserGroupFromNewEnv(this);', 'data-group-name': $this.data('group-name'), 'data-group-id': $this.val(), text: ' Remove'})).append(
                        $('<input>', { type: 'hidden', name: 'user_group', value: $this.val() })))
            });
            $("#addUserGroupModal").modal('hide');
            e.preventDefault();
        });
    }).on("hidden.bs.modal", function (){
        $(this).remove();
    });
}

function removeUserGroupFromNewEnv(obj){
    $(obj).prop('disabled', true).prepend($('<i>', { class: 'fa fa-fw fa-spin fa-circle-o-notch' }));
    $('#' + $(obj).data('group-id')).fadeOut('slow', function(){
        $(this).remove();
    });
}

/*
    Update existing environment.
    Update the title and description.
*/
function updateEnvironment(obj){
    if(!$(obj).data("environment-id")){
        /* Environment ID is required when updating an environment */
        console.log("No workspace ID.");
        return
    }
    $(obj).prop("disabled", true).prepend($("<i>", { class: "fa fa-fw fa-spin fa-circle-o-notch" }));
    var environmentID = $(obj).data("environment-id");
    $.ajax({
        url: "/workspace/" + environmentID,
        dataType: "json",
        success: function(data){
            $(obj).prop("disabled", false).children("i.fa-spin").remove();
            if(data){
                console.log(data)
                for(i=0;i<data.user_groups_list.length;i++){
                    window.environment_groups[data.user_groups_list[i].id] = data.user_groups_list[i]
                }
                $("body").append(
                    $("<div>", { class: "modal fade", id: "updateTeamModal", "tabindex": "-1", "role": "dialog", "aria-labelledby": "updateTeamModalLabel", "aria-hidden": "true" }).html(
                        $("<div>", { class: "modal-dialog" }).html(
                            $("<form>", { class: "form-horizontal", method: "POST", action: "/environment/" + environmentID, id: "updateTeamForm" }).html(
                                $("<div>", { class: "modal-content" }).html(
                                    $("<div>", { class: "modal-header" }).html(
                                        $("<button>", { class: "close", "data-dismiss": "modal", type: "button", "aria-hidden": "true", text: "×" }).add(
                                        $("<h3>", { class: "modal-title", id: "updateTeamModalLabel", text: "Manage Workspace" }))
                                    ).add(
                                        $("<div>", { class: "modal-body" }).html(
                                            $("<div>", { class: "form-group" }).html(
                                                $("<label>", { class: "control-label col-xs-4", for: "teamName", text: "Workspace Name " }).append(
                                                    $("<span>", { class: "text-danger", text: "*"})).add(
                                                $("<div>", { class: "col-xs-7" }).html(
                                                    $("<input>", { class: "form-control", id: "teamName", name: "environment_name", placeholder: "Workspace Name", type: "text", value: (data.title || ""), required: "" })))).add(
                                            $("<div>", { class: "form-group" }).html(
                                                $("<label>", { class: "control-label col-xs-4", for: "teamDescription", text: "Workspace Description " }).append(
                                                    $("<span>", { class: "text-danger", text: "*"})).add(
                                                $("<div>", { class: "col-xs-7" }).html(
                                                    $("<textarea>", { class: "form-control", id: "teamDescription", name: "environment_description", placeholder: "A short description about the team", rows: "5", required: "", text: (data.description || "") }))))).add(
                                            $("<div>", { class: "form-group" }).html(
                                                $("<label>", { class: "control-label col-xs-4", for: "teamMembers", text: "Workspace Members" }).add(
                                                $("<div>", { class: "col-xs-7", id: "teamMembersContainer" }).html(
                                                    $("<p>", { class: "form-control-static" }).html($("<i>", { class: "fa fa-fw fa-spin fa-circle-o-notch"})).append(" Loading team members..."))))).add(
                                            $("<div>", { class: "form-group" }).html(
                                                $("<label>", { class: "control-label col-xs-4", for: "teamMembers", text: "User Groups" }).add(
                                                $("<div>", { class: "col-xs-7", id: "userGroupsContainer" }).html(
                                                    $("<p>", { class: "form-control-static" }).html($("<i>", { class: "fa fa-fw fa-spin fa-circle-o-notch"})).append(" Loading user groups..."))))).add(
                                            $("<div>", { class: "form-group" }).html(
                                                $("<label>", { class: "control-label col-xs-4", for: "teamInvitedUsers", text: "Pending Invitations" }).add(
                                                $("<div>", { class: "col-xs-7", id: "teamInvitedUsersContainer" }).html(
                                                    $("<p>", { class: "form-control-static" }).html($("<i>", { class: "fa fa-fw fa-spin fa-circle-o-notch"})).append(" Loading pending invitations..."))))).add(
                                            $("<div>", { class: "form-group" }).html(
                                                $("<label>", { class: "control-label col-xs-4", for: "visibilitySettings", text: "Visibility Settings" }).add(
                                                $("<div>", { class: "col-xs-7", id: "visibilitySettingsContainer" }).html(
                                                    $("<p>", { class: "form-control-static" }).html("<label><input type='radio' id='visibility_private' name='visibility' value='PRIVATE' /> PRIVATE</label> &nbsp;&nbsp;&nbsp;<label><input id='visibility_public' type='radio' name='visibility' value='PUBLIC' /> PUBLIC</label>"))))
                                                    )
                                        )
                                    ).add(
                                        $("<div>", { class: "modal-footer" }).html(
                                            $("<button>", { type: "button", "data-dismiss": "modal", class: "btn btn-default", text: "Cancel" }).add(
                                            $("<button>", { type: "submit", class: "btn btn-inverse", text: " Update Workspace" })))
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
                                $("<p>", { class: "form-control-static", text: data.members[i].name + (data.members[i].id == userID ? " (YOU)" : "" ) }).append(
                                $("<button>", { class: "btn btn-xs btn-danger pull-right " + (data.members[i].id == userID ? "remove-own-" + userID : "" ), type: "button", "data-team-id": environmentID, 'data-user-name': data.members[i].name.toUpperCase(), 'data-environment-name': data.title, "data-user-id": data.members[i].id, onclick: "removeMember(this);", text: " Remove User", disabled: (data.members[i].id == userID ? true : false )})).append(
                                $("<br>")).append(" (" + data.members[i].email + ")")))));
                    }
                }
                else{
                    $("#teamMembersContainer").html($("<p>", { class: "form-control-static", text: " No team members" }).prepend($("<i>", { class: "fa fa-fw fa-info"})));
                }
                // if(window.environment_groups){
                //     for(key in window.environment_groups){
                //         if(window.environment_groups[key].members.length > 0){

                //         }
                //     }
                // }
                // NELL
                if(data.user_groups_list.length > 0){
                    $("#userGroupsContainer").empty();
                    for(i=0;i<data.user_groups_list.length;i++){
                        $("#userGroupsContainer").append(
                            $("<p>", { class: "form-control-static", text: data.user_groups_list[i].title }).append(
                                $('<button>', { type: 'button', class: 'btn btn-xs btn-danger pull-right', 'data-environment-id': environmentID, 'data-group-id': data.user_groups_list[i].id, text: ' Remove User Group', onclick: 'removeUserGroupFromEnv(this);' })));
                    }
                    $("#userGroupsContainer").append(
                            $("<button>", { class: "btn btn-sm btn-success", type: "button", "data-environment-id": environmentID, 'data-environment-name': data.title, onclick: "addUserGroup(this);", text: " Add User Group"}));
                }
                else{
                    $("#userGroupsContainer").html(
                        $("<button>", { class: "btn btn-sm btn-success", type: "button", "data-environment-id": environmentID, 'data-environment-name': data.title, onclick: "addUserGroup(this);", text: " Add User Group"}));
                }
                if(data.invited_users.length>0){
                    $("#teamInvitedUsersContainer").empty();
                    for(i=0;i<data.invited_users.length;i++){
                        $("#teamInvitedUsersContainer").append($("<p>", { class: "form-control-static", text: data.invited_users[i] }).append($("<button>", { class: "btn btn-xs btn-danger pull-right", type: "button", "data-team-id": environmentID, "data-user-email": data.invited_users[i], onclick: "cancelInvite(this);", text: " Cancel Invite"})));
                    }
                    $("#teamInvitedUsersContainer").append($("<p>", { class: "form-control-static" }).html($("<button>", { class: "btn btn-sm btn-success", type: "button", "data-team-id": environmentID, onclick: "inviteUsers(this);", text: " Invite Users"})));
                }
                else{
                    $("#teamInvitedUsersContainer").html($("<p>", { class: "form-control-static" }).html($("<button>", { class: "btn btn-sm btn-success", type: "button", "data-team-id": environmentID, onclick: "inviteUsers(this);", text: " Invite Users"})));
                }
                if(data.private_setting){
                    $('#visibility_private').prop('checked', true);
                }
                else {
                    $('#visibility_public').prop('checked', true);
                }
                $("#updateTeamModal").modal({ show: true, backdrop: "static", keyboard: false }).on("shown.bs.modal", function (){
                    $("#updateTeamForm").submit(function (e) {
                        e.preventDefault();
                        $(this).find(".modal-body").children("div.modal-alert").remove();
                        $(this).find("button").prop("disabled", true);
                        $(this).find("button:submit").children("i").remove();
                        $(this).find("button:submit").prepend($("<i>", { class: "fa fa-fw fa-spin fa-circle-o-notch" }));
                        $.ajax({
                            url: "/workspace/" + environmentID,
                            type: "POST",
                            data: {action: "update_team", environment_name: $("#teamName").val(), environment_description: $("#teamDescription").val(), visibility: $("input[type='radio'][name='visibility']:checked").val(), token: token},
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
                                                    $("<div>", { class: "alert alert-success", text: " Workspace has been updated." }).prepend($("<i>", { class: "fa fa-fw fa-check" })).prepend($("<button>", { class: "close", "aria-label": "Close", "data-dismiss": "alert", type: "button", text: " ×", }).prepend($("<span>", { "aria-hidden": true }))))));
                                            $("#" + data.data.id).html($("<td>").text(data.data.team_name).add($("<td>").text(data.data.team_description)).add($("<td>").text(data.data.member_count)).add($("<td>").text(data.data.invited_users_count)).add($("<td>").text(data.data.created_time)).add($("<td>").html($("<button>", { class: "btn btn-success btn-xs", type: "button", text: "Update Team", onclick: "updateTeam(this);", "data-team-id": data.data.id }).add($("<button>", { class: "btn btn-primary btn-xs", type: "button", text: "Invite Users", "data-team-id": data.data.id, onclick: "inviteUsers(this);" })))));
                                            $("."+environmentID).text(data.data.title);
                                        }
                                        $(this).find("input.form-control:first").focus();
                                        return
                                    }
                                }
                                $("#updateTeamForm").find(".modal-body").prepend($("<div>", { class: "form-group no-margin modal-alert" }).html(
                                            $("<div>", { class: "col-xs-12" }).html(
                                                $("<div>", { class: "alert alert-danger", text: " Could not update the workspace." }).prepend($("<i>", { class: "fa fa-fw fa-times" })).prepend($("<button>", { class: "close", "aria-label": "Close", "data-dismiss": "alert", type: "button", text: " ×", }).prepend($("<span>", { "aria-hidden": true }))))));
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

/*
    Cancel an invitation.
*/
function cancelInvite(obj){
    var teamID = $(obj).data("team-id"),
    userEmail = $(obj).data("user-email");
    if(confirm('WARNING: You are about to cancel the invitation sent to '+userEmail+', do you want to continue?')){
        $(obj).prepend($("<i>", { class: "fa fa-fw fa-spin fa-circle-o-notch" })).prop("disabled", true);
        $.ajax({
            url: "/workspace/" + teamID,
            type: "POST",
            data: {email: userEmail, action: "delete_invited_user", token: token},
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
                        $("#" + data.data.id).html($("<td>").text(data.data.team_name).add($("<td>").text(data.data.team_description)).add($("<td>").text(data.data.member_count)).add($("<td>").text(data.data.invited_users_count)).add($("<td>").text(data.data.created_time)).add($("<td>").html($("<button>", { class: "btn btn-success btn-xs", type: "button", text: "Update Team", onclick: "updateTeam(this);", "data-team-id": data.data.id }).add($("<button>", { class: "btn btn-primary btn-xs", type: "button", text: "Invite Users", "data-team-id": data.data.id, onclick: "inviteUsers(this);" })))));
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
    Remove member from the environment.
*/
function removeMember(obj){
    var teamID = $(obj).data("team-id"),
    userMemberID = $(obj).data("user-id"),
    userName = $(obj).data('user-name'),
    environmentName = $(obj).data('environment-name');
    if(confirm('WARNING: You are about to remove '+userName+' from the '+environmentName+' workspace, do you want to continue?')){
        $(obj).prepend($("<i>", { class: "fa fa-fw fa-spin fa-circle-o-notch" })).prop("disabled", true);
        $.ajax({
            url: "/workspace/" + teamID,
            type: "POST",
            data: {user_id: userMemberID, action: "remove_member", token: token},
            success: function (data){
                if(data){
                    if(data.code == 200){
                        $(obj).prop("disabled", false).children("i").remove();
                        $("#" + userMemberID + "_update").fadeOut( "slow", function() {
                            $("#" + userMemberID + "_update").remove();
                            if($("#teamMembersContainer").children("div.row").length == 0){
                                $("#teamMembersContainer").html($("<p>", { class: "form-control-static", text: " No team members" }).prepend($("<i>", { class: "fa fa-fw fa-info"})));
                            }
                        });
                        $("#" + data.data.id).html($("<td>").text(data.data.team_name).add($("<td>").text(data.data.team_description)).add($("<td>").text(data.data.member_count)).add($("<td>").text(data.data.invited_users_count)).add($("<td>").text(data.data.created_time)).add($("<td>").html($("<button>", { class: "btn btn-success btn-xs", type: "button", text: "Update Team", onclick: "updateTeam(this);", "data-team-id": data.data.id }).add($("<button>", { class: "btn btn-primary btn-xs", type: "button", text: "Invite Users", "data-team-id": data.data.id, onclick: "inviteUsers(this);" })))));
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
                $("<form>", { class: "form-horizontal", method: "POST", action: "/workspace/" + teamID, id: "inviteUsersForm" }).html(
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
                url: "/workspace/" + teamID,
                type: "POST",
                data: {action: "invite_users", email: $("#userEmail").val(), token: token},
                success: function (data){
                    $("#inviteUsersForm").find("button").prop("disabled", false);
                    $("#inviteUsersForm").find("button:submit").children("i").remove();
                    if(data){
                        console.log(data)
                        if(data.code == 200){
                            if(!data.success){
                                $("#inviteUsersForm").find(".modal-body").prepend($("<div>", { class: "form-group no-margin modal-alert" }).html(
                                    $("<div>", { class: "col-xs-12" }).html(
                                        $("<div>", { class: "alert alert-danger", text: " " + data.description }).prepend($("<i>", { class: "fa fa-fw fa-times" })).prepend($("<button>", { class: "close", "aria-label": "Close", "data-dismiss": "alert", type: "button", text: " ×", }).prepend($("<span>", { "aria-hidden": true }))))));
                            }
                            else{
                                var message = "Invitation has been sent.";
                                if("existing_invite" in data){
                                    if(data.existing_invite.length > 0){
                                        message = "Invitations has been sent, except for " + data.existing_invite.join();
                                    }
                                }
                                $("#inviteUsersForm").find(".modal-body").prepend($("<div>", { class: "form-group no-margin modal-alert" }).html(
                                    $("<div>", { class: "col-xs-12" }).html(
                                        $("<div>", { class: "alert alert-success", text: " "+message+" " }).prepend($("<i>", { class: "fa fa-fw fa-check" })).prepend($("<button>", { class: "close", "aria-label": "Close", "data-dismiss": "alert", type: "button", text: " ×", }).prepend($("<span>", { "aria-hidden": true }))))));
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

function removeUserGroup(obj){
    var environmentID = $(obj).data("environment-id"),
    environmentName = $(obj).data('environment-name');
    $("#updateTeamModal").modal("hide");
    $("body").append(
        $("<div>", { class: "modal fade", id: "removeUserGroupModal", "tabindex": "-1", "role": "dialog", "aria-labelledby": "inviteUsersModalLabel", "aria-hidden": "true" }).html(
            $("<div>", { class: "modal-dialog" }).html(
                $("<form>", { class: "form-horizontal", method: "POST", action: "/workspace/" + environmentID, id: "removeUserGroupForm" }).html(
                    $("<div>", { class: "modal-content" }).html(
                        $("<div>", { class: "modal-header" }).html(
                            $("<button>", { class: "close", "data-dismiss": "modal", type: "button", "aria-hidden": "true", text: "×" }).add(
                            $("<h3>", { class: "modal-title", id: "inviteUsersModalLabel", text: "Remove User Group from " + environmentName }))
                        ).add(
                            $("<div>", { class: "modal-body" }).html($('<p>', { class: 'text-center'}).html($('<i>', { class: 'fa fa-fw fa-3x fa-spin fa-circle-o-notch' })).add(
            $('<h4>', { class: 'text-center', text: 'Loading user groups...' })))
                        ).add(
                            $("<div>", { class: "modal-footer" }).html(
                                $("<button>", { type: "button", "data-dismiss": "modal", class: "btn btn-default", text: "Cancel" }).add(
                                $("<button>", { type: "submit", class: "btn btn-inverse", text: " Remove from Workspace" })))
                            )
                        )
                    ))
                )
            );
    $("#removeUserGroupModal").modal({ show: true, backdrop: "static", keyboard: false }).on('shown.bs.modal', function (){
        $.ajax({
            url: '/groups?fetch=all&removeusergroup=true&environmentid=' + environmentID,
            success: function (data){
                if(data.length > 0){
                    $('#removeUserGroupModal').find('div.modal-body').html(
                        $('<table>', { class: 'table table-striped', id: 'table-user-group-list' }).html(
                            $('<thead>').html(
                                $('<tr>').html(
                                    $('<th>').add(
                                    $('<th>', { text: 'Group Name' })).add(
                                    $('<th>', { text: 'Group Description'})))).add(
                            $('<tbody>'))));
                    for(i=0;i<data.length;i++){
                        $('#table-user-group-list').find('tbody').append($('<tr>').html($('<td>').html($('<input>', { type: 'checkbox', value: data[i].id, class: 'user-group' })).add($('<td>', { text: data[i].title})).add($('<td>', { text: data[i].description }))));
                    }
                    $('input.user-group').click(function(){
                        if($(this).is(':checked')){
                            $('#addUserGroupForm').find('button[type=submit]').prop('disabled', false);
                        }
                        else{
                            if(!$('input.user-group').is(':checked')){
                                $('#addUserGroupForm').find('button[type=submit]').prop('disabled', true);
                            }
                        }
                    });
                    return
                }
                $('#removeUserGroupModal').find('div.modal-body').html(
                    $("<div>", { class: "alert alert-warning fade in", text: ' No user group available in this workspace. ' }).append(
                        $('<a>', { href: '', text: 'Add a user group?' })).prepend(
                        $("<i>", { class: "fa fa-fw fa-times" })));
            },
            error: function (){

            }
        });
        $("#removeUserGroupForm").submit(function (e) {
            e.preventDefault();
            $(this).find(".modal-body").children("div.modal-alert").remove();
            $(this).find("button").prop("disabled", true);
            $(this).find("button:submit").children("i").remove();
            $(this).find("button:submit").prepend($("<i>", { class: "fa fa-fw fa-spin fa-circle-o-notch" }));
            var userGroups = new Array();
            $('.user-group').each(function (){
                if($(this).is(':checked')){
                    userGroups.push(this.value);
                }
            });
            $.ajax({
                url: "/workspace/" + environmentID,
                type: "POST",
                data: {action: "remove_user_group", user_groups: JSON.stringify(userGroups), token: token},
                success: function (data){
                    $("#removeUserGroupForm").find("button").prop("disabled", false);
                    $("#removeUserGroupForm").find("button:submit").children("i").remove();
                    $(".remove-own-" + userID).prop("disabled", true);
                    if(data){
                        if(data.code == 200){
                            if(!data.success){
                                $("#removeUserGroupForm").find(".modal-body").prepend($("<div>", { class: "form-group no-margin modal-alert" }).html(
                                    $("<div>", { class: "col-xs-12" }).html(
                                        $("<div>", { class: "alert alert-danger", text: " " + data.description }).prepend($("<i>", { class: "fa fa-fw fa-times" })).prepend($("<button>", { class: "close", "aria-label": "Close", "data-dismiss": "alert", type: "button", text: " ×", }).prepend($("<span>", { "aria-hidden": true }))))));
                            }
                            else{
                                $("#removeUserGroupForm").find(".modal-body").prepend($("<div>", { class: "form-group no-margin modal-alert" }).html(
                                    $("<div>", { class: "col-xs-12" }).html(
                                        $("<div>", { class: "alert alert-success", text: " Workspace has been updated." }).prepend($("<i>", { class: "fa fa-fw fa-check" })).prepend($("<button>", { class: "close", "aria-label": "Close", "data-dismiss": "alert", type: "button", text: " ×", }).prepend($("<span>", { "aria-hidden": true }))))));
                                if(data.members.length > 0){
                                    $("#teamMembersContainer").empty();
                                    for(i=0;i<data.members.length;i++){
                                        $("#teamMembersContainer").append(
                                            $("<div>", { class: "row", id: data.members[i].id + "_update" }).html(
                                            $("<div>", { class: "col-xs-2 no-padding-right" }).html(
                                                $("<img>", { class: "navbar-avatar", src: "https://www.gravatar.com/avatar/" + data.members[i].email_md5 + "?s=30", style: "padding-top: 10px;" })).add(
                                            $("<div>", { class: "col-xs-10 no-padding-left" }).html(
                                                $("<p>", { class: "form-control-static", text: data.members[i].name + (data.members[i].id == userID ? " (YOU)" : "" ) }).append(
                                                $("<button>", { class: "btn btn-xs btn-danger pull-right " + (data.members[i].id == userID ? "remove-own-" + userID : "" ), type: "button", "data-team-id": environmentID, 'data-user-name': data.members[i].name.toUpperCase(), 'data-environment-name': data.title, "data-user-id": data.members[i].id, onclick: "removeMember(this);", text: " Remove User", disabled: (data.members[i].id == userID ? true : false )})).append(
                                                $("<br>")).append(" (" + data.members[i].email + ")")))));
                                    }
                                }
                                else{
                                    $("#teamMembersContainer").html($("<p>", { class: "form-control-static", text: " No team members" }).prepend($("<i>", { class: "fa fa-fw fa-info"})));
                                }
                            }
                            $(this).find("input.form-control:first").focus();
                            return
                        }
                    }
                    $("#removeUserGroupForm").find(".modal-body").prepend($("<div>", { class: "form-group no-margin modal-alert" }).html(
                                $("<div>", { class: "col-xs-12" }).html(
                                    $("<div>", { class: "alert alert-danger", text: " Could not update the team." }).prepend($("<i>", { class: "fa fa-fw fa-times" })).prepend($("<button>", { class: "close", "aria-label": "Close", "data-dismiss": "alert", type: "button", text: " ×", }).prepend($("<span>", { "aria-hidden": true }))))));
                },
                error: function (){
                    $(".remove-own-" + userID).prop("disabled", true);
                }
            });
        });
    }).on("hidden.bs.modal", function (){
        $(this).remove();
    });
}

function addUserGroup(obj){
    var environmentID = $(obj).data("environment-id"),
    environmentName = $(obj).data('environment-name');
    $("body").append(
        $("<div>", { class: "modal fade", id: "addUserGroupModal", "tabindex": "-1", "role": "dialog", "aria-labelledby": "inviteUsersModalLabel", "aria-hidden": "true" }).html(
            $("<div>", { class: "modal-dialog" }).html(
                $("<form>", { class: "form-horizontal", method: "POST", action: "/workspace/" + environmentID, id: "addUserGroupForm" }).html(
                    $("<div>", { class: "modal-content" }).html(
                        $("<div>", { class: "modal-header" }).html(
                            $("<button>", { class: "close", "data-dismiss": "modal", type: "button", "aria-hidden": "true", text: "×" }).add(
                            $("<h3>", { class: "modal-title", id: "inviteUsersModalLabel", text: "Add User Group to " + environmentName }))
                        ).add(
                            $("<div>", { class: "modal-body" }).html($('<p>', { class: 'text-center'}).html($('<i>', { class: 'fa fa-fw fa-3x fa-spin fa-circle-o-notch' })).add(
            $('<h4>', { class: 'text-center', text: 'Loading user groups...' })))
                        ).add(
                            $("<div>", { class: "modal-footer" }).html(
                                $("<button>", { type: "button", "data-dismiss": "modal", class: "btn btn-default", text: "Cancel" }).add(
                                $("<button>", { type: "submit", class: "btn btn-inverse", text: " Add to Workspace", disabled: true })))
                            )
                        )
                    ))
                )
            );
    $("#addUserGroupModal").modal({ show: true, backdrop: "static", keyboard: false }).on('shown.bs.modal', function (){
        $.ajax({
            url: '/groups?fetch=all&addusergroup=true&environmentid=' + environmentID,
            success: function (data){
                if(data.length > 0){
                    $('#addUserGroupModal').find('div.modal-body').html(
                        $('<table>', { class: 'table table-striped', id: 'table-user-group-list' }).html(
                            $('<thead>').html(
                                $('<tr>').html(
                                    $('<th>').add(
                                    $('<th>', { text: 'Group Name' })).add(
                                    $('<th>', { text: 'Group Description'})))).add(
                            $('<tbody>'))));
                    for(i=0;i<data.length;i++){
                        $('#table-user-group-list').find('tbody').append($('<tr>').html($('<td>').html($('<input>', { type: 'checkbox', value: data[i].id, class: 'user-group' })).add($('<td>', { text: data[i].title})).add($('<td>', { text: data[i].description }))));
                    }
                    $('input.user-group').click(function(){
                        if($(this).is(':checked')){
                            $('#addUserGroupForm').find('button[type=submit]').prop('disabled', false);
                        }
                        else{
                            if(!$('input.user-group').is(':checked')){
                                $('#addUserGroupForm').find('button[type=submit]').prop('disabled', true);
                            }
                        }
                    });
                    return
                }
                $('#addUserGroupModal').find('div.modal-body').html(
                    $("<div>", { class: "alert alert-warning fade in", text: ' No available user group found. You may have already added your user groups to the workspace. ' }).append(
                        $('<a>', { href: '', text: 'Create a user group?' })).prepend(
                        $("<i>", { class: "fa fa-fw fa-times" })));
            },
            error: function (){

            }
        });
        $("#addUserGroupForm").submit(function (e) {
            e.preventDefault();
            $(this).find(".modal-body").children("div.modal-alert").remove();
            $(this).find("button").prop("disabled", true);
            $(this).find("button:submit").children("i").remove();
            $(this).find("button:submit").prepend($("<i>", { class: "fa fa-fw fa-spin fa-circle-o-notch" }));
            var userGroups = new Array();
            $('.user-group').each(function (){
                if($(this).is(':checked')){
                    userGroups.push(this.value);
                }
            });
            $.ajax({
                url: "/workspace/" + environmentID,
                type: "POST",
                data: {action: "add_user_group", user_groups: JSON.stringify(userGroups), token: token},
                success: function (data){
                    $("#addUserGroupForm").find("button").prop("disabled", false);
                    $("#addUserGroupForm").find("button:submit").children("i").remove();
                    $(".remove-own-" + userID).prop("disabled", true);
                    $("#updateTeamForm").find('.modal-alert').remove();
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
                                        $("<div>", { class: "alert alert-success", text: " " + data.description }).prepend($("<i>", { class: "fa fa-fw fa-check" })).prepend($("<button>", { class: "close", "aria-label": "Close", "data-dismiss": "alert", type: "button", text: " ×", }).prepend($("<span>", { "aria-hidden": true }))))));

                                if(data.environment['members'].length > 0){
                                    $("#teamMembersContainer").empty();
                                    for(i=0;i<data.environment['members'].length;i++){
                                        $("#teamMembersContainer").append(
                                            $("<div>", { class: "row", id: data.environment['members'][i].id + "_update" }).html(
                                            $("<div>", { class: "col-xs-2 no-padding-right" }).html(
                                                $("<img>", { class: "navbar-avatar", src: "https://www.gravatar.com/avatar/" + data.environment['members'][i].email_md5 + "?s=30", style: "padding-top: 10px;" })).add(
                                            $("<div>", { class: "col-xs-10 no-padding-left" }).html(
                                                $("<p>", { class: "form-control-static", text: data.environment['members'][i].name + (data.environment['members'][i].id == userID ? " (YOU)" : "" ) }).append(
                                                $("<button>", { class: "btn btn-xs btn-danger pull-right " + (data.environment['members'][i].id == userID ? "remove-own-" + userID : "" ), type: "button", "data-team-id": environmentID, 'data-user-name': data.environment['members'][i].name.toUpperCase(), 'data-environment-name': data.title, "data-user-id": data.environment['members'][i].id, onclick: "removeMember(this);", text: " Remove User", disabled: (data.environment['members'][i].id == userID ? true : false )})).append(
                                                $("<br>")).append(" (" + data.environment['members'][i].email + ")")))));
                                    }
                                }
                                else{
                                    $("#teamMembersContainer").html($("<p>", { class: "form-control-static", text: " No team members" }).prepend($("<i>", { class: "fa fa-fw fa-info"})));
                                }

                                for(i=0;i<data.user_groups.length;i++){
                                    $("#userGroupsContainer").prepend(
                                        $("<p>", { class: "form-control-static", text: data.user_groups[i].title }).append(
                                            $('<button>', { type: 'button', class: 'btn btn-xs btn-danger pull-right', text: ' Remove User Group', 'data-environment-id': environmentID, 'data-group-id': data.user_groups[i].id, onclick: 'removeUserGroupFromEnv(this);' })));
                                }
                                $('#addUserGroupModal').modal('hide');
                            }
                            $(this).find("input.form-control:first").focus();
                            return
                        }
                    }
                    $("#updateTeamForm").find(".modal-body").prepend(
                        $("<div>", { class: "form-group no-margin modal-alert" }).html(
                            $("<div>", { class: "col-xs-12" }).html(
                                $("<div>", { class: "alert alert-danger", text: " Could not remove the user group(s) from the workspace." }).prepend($("<i>", { class: "fa fa-fw fa-times" })).prepend($("<button>", { class: "close", "aria-label": "Close", "data-dismiss": "alert", type: "button", text: " ×", }).prepend($("<span>", { "aria-hidden": true }))))));
                },
                error: function (){
                    $(".remove-own-" + userID).prop("disabled", true);
                }
            });
        });
    }).on("hidden.bs.modal", function (){
        $(this).remove();
    });
}

function removeUserGroupFromEnv(obj){
    var environmentID = $(obj).data('environment-id'),
    groupID = $(obj).data('group-id');
    $(obj).prop("disabled", true).prepend($('<i>', { class: 'fa fa-fw fa-spin fa-circle-o-notch' }));
    $.ajax({
        url: "/workspace/" + environmentID,
        type: "POST",
        data: {action: "remove_user_group", group_id: groupID, token: token},
        success: function (data){
            $("#updateTeamForm").find('.modal-alert').remove();
            $(obj).prop("disabled", false).children('i').remove();;
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
                                $("<div>", { class: "alert alert-success", text: " " + data.user_groups + " has been updated." }).prepend($("<i>", { class: "fa fa-fw fa-check" })).prepend($("<button>", { class: "close", "aria-label": "Close", "data-dismiss": "alert", type: "button", text: " ×", }).prepend($("<span>", { "aria-hidden": true }))))));

                        $(obj).parent("p.form-control-static").fadeOut( "slow", function() {
                            $(obj).parent("p.form-control-static").remove();
                        });
                    }
                    if(data.environment['members'].length > 0){
                        $("#teamMembersContainer").empty();
                        for(i=0;i<data.environment['members'].length;i++){
                            $("#teamMembersContainer").append(
                                $("<div>", { class: "row", id: data.environment['members'][i].id + "_update" }).html(
                                $("<div>", { class: "col-xs-2 no-padding-right" }).html(
                                    $("<img>", { class: "navbar-avatar", src: "https://www.gravatar.com/avatar/" + data.environment['members'][i].email_md5 + "?s=30", style: "padding-top: 10px;" })).add(
                                $("<div>", { class: "col-xs-10 no-padding-left" }).html(
                                    $("<p>", { class: "form-control-static", text: data.environment['members'][i].name + (data.environment['members'][i].id == userID ? " (YOU)" : "" ) }).append(
                                    $("<button>", { class: "btn btn-xs btn-danger pull-right " + (data.environment['members'][i].id == userID ? "remove-own-" + userID : "" ), type: "button", "data-team-id": environmentID, 'data-user-name': data.environment['members'][i].name.toUpperCase(), 'data-environment-name': data.title, "data-user-id": data.environment['members'][i].id, onclick: "removeMember(this);", text: " Remove User", disabled: (data.environment['members'][i].id == userID ? true : false )})).append(
                                    $("<br>")).append(" (" + data.environment['members'][i].email + ")")))));
                        }
                    }
                    else{
                        $("#teamMembersContainer").html($("<p>", { class: "form-control-static", text: " No team members" }).prepend($("<i>", { class: "fa fa-fw fa-info"})));
                    }
                    $(this).find("input.form-control:first").focus();
                    return
                }
            }
            $("#updateTeamForm").find(".modal-body").prepend(
                $("<div>", { class: "form-group no-margin modal-alert" }).html(
                    $("<div>", { class: "col-xs-12" }).html(
                        $("<div>", { class: "alert alert-danger", text: " Could not update the team." }).prepend($("<i>", { class: "fa fa-fw fa-times" })).prepend($("<button>", { class: "close", "aria-label": "Close", "data-dismiss": "alert", type: "button", text: " ×", }).prepend($("<span>", { "aria-hidden": true }))))));
        },
        error: function (){
            $(obj).prop("disabled", false).children('i').remove();
            $(".remove-own-" + userID).prop("disabled", true);
        }
    });
}